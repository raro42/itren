#!/usr/bin/env bash
# yonose GitHub issue loop — pickup → code → test → close.
# Pattern: raro42/agents-explained (thin shell loop; Cursor is a worker).
#   ./agents/yonose-cursor-loop.sh once
#   ./agents/yonose-cursor-loop.sh loop
#   ./agents/yonose-cursor-loop.sh status
#
# Env:
#   YONOSE_GH_REPO=raro42/itren
#   AGENT_LOOP_SLEEP_MINUTES=5
#   AGENT_LOOP_BUSY_SLEEP_SECONDS=15
#   AGENT_USE_CURSOR=1|0
#   AGENT_GIT_SYNC=1|0
set -euo pipefail

SCRIPTDIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPTDIR}/.." && pwd)"
TASKDIR="${SCRIPTDIR}/tasks"
TESTINGDIR="${SCRIPTDIR}/testing/active"
STATEDIR="${SCRIPTDIR}/state"
GH_REPO="${YONOSE_GH_REPO:-raro42/itren}"
sleepminutes="${AGENT_LOOP_SLEEP_MINUTES:-5}"
sleepseconds=$((sleepminutes * 60))
busy_sleep_seconds="${AGENT_LOOP_BUSY_SLEEP_SECONDS:-15}"
CURSOR_LOCK="${STATEDIR}/cursor.pid"
LOOP_LOCK="${STATEDIR}/loop.pid"
export YONOSE_GH_REPO="$GH_REPO"
export PATH="${HOME}/.local/bin:/usr/local/bin:${PATH}"
cd "$REPO_ROOT"

if [[ -z "${AGENT_USE_CURSOR+x}" ]]; then
  if command -v cursor-agent >/dev/null 2>&1; then
    AGENT_USE_CURSOR=1
  else
    AGENT_USE_CURSOR=0
  fi
fi

ensure_gh_auth_env() {
  command -v gh >/dev/null 2>&1 || return 0
  if [[ -z "${GITHUB_TOKEN:-}${GH_TOKEN:-}" ]]; then
    return 0
  fi
  if gh api user -q .login >/dev/null 2>&1; then
    return 0
  fi
  echo "----- gh: invalid env token, unsetting so keyring can work" >&2
  unset GITHUB_TOKEN GH_TOKEN
}
ensure_gh_auth_env

mkdir -p "$TASKDIR" "$TESTINGDIR" "$STATEDIR" "${SCRIPTDIR}/workspace"

tick() {
  echo "AGENT_LOOP_TICK_yonose {\"at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"msg\":\"$*\"}"
}

pid_is_alive() {
  local pid="$1"
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

pid_is_our_loop() {
  local pid="$1"
  local cmd
  cmd="$(ps -p "$pid" -o command= 2>/dev/null || true)"
  [[ "$cmd" == *yonose-cursor-loop.sh* ]]
}

loop_lock_held() {
  local old
  [[ -f "$LOOP_LOCK" ]] || return 1
  old="$(tr -d ' \n' <"$LOOP_LOCK" 2>/dev/null || true)"
  if pid_is_alive "$old" && pid_is_our_loop "$old"; then
    echo "$old"
    return 0
  fi
  return 1
}

release_loop_lock() {
  local old
  [[ -f "$LOOP_LOCK" ]] || return 0
  old="$(tr -d ' \n' <"$LOOP_LOCK" 2>/dev/null || true)"
  if [[ "$old" == "$$" ]]; then
    rm -f "$LOOP_LOCK"
  fi
}

acquire_loop_lock() {
  local old
  mkdir -p "$STATEDIR"
  if old="$(loop_lock_held)"; then
    echo "----- loop lock held by pid $old, refuse duplicate loop" >&2
    return 1
  fi
  rm -f "$LOOP_LOCK"
  if ! (set -o noclobber; echo "$$" >"$LOOP_LOCK") 2>/dev/null; then
    old="$(tr -d ' \n' <"$LOOP_LOCK" 2>/dev/null || true)"
    if pid_is_alive "$old" && pid_is_our_loop "$old"; then
      echo "----- loop lock race lost to pid $old, refuse duplicate" >&2
      return 1
    fi
    echo "$$" >"$LOOP_LOCK"
  fi
  old="$(tr -d ' \n' <"$LOOP_LOCK" 2>/dev/null || true)"
  if [[ "$old" != "$$" ]]; then
    echo "----- loop lock stolen by pid $old, exit" >&2
    return 1
  fi
  echo "----- loop lock acquired pid $$ ($LOOP_LOCK)"
  return 0
}

acquire_cursor_lock() {
  local old
  if [[ -f "$CURSOR_LOCK" ]]; then
    old="$(tr -d ' \n' <"$CURSOR_LOCK" 2>/dev/null || true)"
    if pid_is_alive "$old"; then
      echo "----- cursor lock held by pid $old, skip cursor spawn"
      return 1
    fi
  fi
  echo $$ >"$CURSOR_LOCK"
  return 0
}

release_cursor_lock() {
  local old
  [[ -f "$CURSOR_LOCK" ]] || return 0
  old="$(tr -d ' \n' <"$CURSOR_LOCK" 2>/dev/null || true)"
  if [[ "$old" == "$$" ]]; then
    rm -f "$CURSOR_LOCK"
  fi
}

run_cursor() {
  local role="$1"
  local prompt="$2"
  if [[ "${AGENT_USE_CURSOR}" != "1" ]] || ! command -v cursor-agent >/dev/null 2>&1; then
    echo "----- ${role}: cursor-agent off (AGENT_USE_CURSOR=${AGENT_USE_CURSOR})"
    return 0
  fi
  if ! acquire_cursor_lock; then
    return 0
  fi
  echo "----- ${role}: starting cursor-agent"
  cursor-agent -p --force --trust --workspace "$REPO_ROOT" "$prompt" || {
    echo "----- ${role}: cursor-agent exited $?" >&2
  }
  release_cursor_lock
  return 0
}

sync_main() {
  if [[ "${AGENT_GIT_SYNC:-1}" != "1" ]]; then
    echo "----- git sync skipped (AGENT_GIT_SYNC=0)"
    return 0
  fi
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    if [[ -n "$(git status --porcelain 2>/dev/null || true)" ]]; then
      echo "----- git sync skipped (dirty tree; refuse autostash)"
      return 0
    fi
    git fetch origin 2>/dev/null || true
    if git show-ref --verify --quiet refs/heads/main; then
      git checkout main 2>/dev/null || true
      git pull --rebase --autostash origin main 2>/dev/null || true
    fi
  fi
}

github_issue_is_open() {
  local n="$1"
  local state
  state="$(gh issue view "$n" --repo "$GH_REPO" --json state -q .state 2>/dev/null || true)"
  [[ "$state" == "OPEN" ]]
}

issue_num_from_task() {
  local base="$1"
  echo "$base" | sed -E 's/^(FEAT|WIP|UNTESTED|TESTING|CLOSED)-([0-9]{1,5})-.*/\2/'
}

is_gh_task() {
  local f="$1"
  local base n
  base="$(basename "$f")"
  n="$(issue_num_from_task "$base")"
  [[ "$n" =~ ^[0-9]+$ ]] || return 1
  grep -q "github.com/${GH_REPO}/issues/${n}" "$f" 2>/dev/null
}

pick_lowest() {
  local kind="$1"
  local dir="${2:-$TASKDIR}"
  local f base n
  shopt -s nullglob
  for f in "$dir"/${kind}-*.md; do
    is_gh_task "$f" || continue
    base="$(basename "$f")"
    n="$(issue_num_from_task "$base")"
    printf '%s %s\n' "$n" "$f"
  done | sort -n | head -n 1 | awk '{print $2}'
}

queue_has_live_work() {
  [[ -n "$(pick_lowest FEAT || true)" ]] && return 0
  [[ -n "$(pick_lowest WIP || true)" ]] && return 0
  [[ -n "$(pick_lowest UNTESTED || true)" ]] && return 0
  [[ -n "$(pick_lowest TESTING "$TESTINGDIR" || true)" ]] && return 0
  local f n
  shopt -s nullglob
  for f in "$TASKDIR"/CLOSED-*.md; do
    is_gh_task "$f" || continue
    n="$(issue_num_from_task "$(basename "$f")")"
    if github_issue_is_open "$n"; then
      return 0
    fi
  done
  return 1
}

cycle_sleep_seconds() {
  if queue_has_live_work; then
    echo "$busy_sleep_seconds"
  else
    echo "$sleepseconds"
  fi
}

close_github_issue_for_task() {
  local n="$1"
  local task_base="$2"
  echo "----- 004: closing GitHub issue #${n}"
  gh label create "agent:done" --repo "$GH_REPO" --color "5319E7" --description "agent:done" >/dev/null 2>&1 || true
  gh issue edit "$n" --repo "$GH_REPO" --add-label "agent:done" 2>/dev/null || true
  gh issue edit "$n" --repo "$GH_REPO" --remove-label "agent:wip" 2>/dev/null || true
  gh issue edit "$n" --repo "$GH_REPO" --remove-label "agent:planned" 2>/dev/null || true
  ./scripts/gh-safe.sh issue comment "$n" --body "Agent 004: handoff complete (\`${task_base}\`). Closing." 2>/dev/null || true
  gh issue close "$n" --repo "$GH_REPO" --reason completed
}

step_001_issues() {
  echo "===== 001 issue pickup ($(date -u +%Y-%m-%dT%H:%M:%SZ)) repo=$GH_REPO"
  python3 "${SCRIPTDIR}/issue_checker.py"
}

step_002_coder() {
  local feat wip task base issue_n
  feat="$(pick_lowest FEAT || true)"
  wip="$(pick_lowest WIP || true)"
  if [[ -n "$feat" && -n "$wip" ]]; then
    local fn wn
    fn="$(issue_num_from_task "$(basename "$feat")")"
    wn="$(issue_num_from_task "$(basename "$wip")")"
    if [[ "$wn" -lt "$fn" ]]; then
      task="$wip"
    else
      task="$feat"
    fi
  else
    task="${feat:-$wip}"
  fi
  if [[ -z "$task" ]]; then
    echo "----- 002: no GitHub FEAT or WIP tasks"
    return 0
  fi

  base="$(basename "$task")"
  if [[ "$base" == FEAT-* ]]; then
    local wip_name="${base/FEAT-/WIP-}"
    mv "$task" "$TASKDIR/$wip_name"
    task="$TASKDIR/$wip_name"
    base="$wip_name"
    echo "----- 002: promoted to $(basename "$task")"
  fi
  issue_n="$(issue_num_from_task "$base")"
  if [[ "$issue_n" =~ ^[0-9]+$ ]]; then
    echo "----- 002: GitHub issue #${issue_n} -> agent:wip"
    gh label create "agent:wip" --repo "$GH_REPO" --color "FBCA04" --description "agent:wip" >/dev/null 2>&1 || true
    gh issue edit "$issue_n" --repo "$GH_REPO" --add-label "agent:wip" 2>/dev/null || true
    gh issue edit "$issue_n" --repo "$GH_REPO" --remove-label "agent:planned" 2>/dev/null || true
    ./scripts/gh-safe.sh issue comment "$issue_n" --body "Agent 002: coding (\`$(basename "$task")\`). Tester gets UNTESTED- when the batch is ready." 2>/dev/null || true
  fi

  echo "----- 002: pending $(basename "$task")"
  run_cursor "002" \
    "Follow agents/006-feature-coder/FEATURE-CODER.md and AGENTS.md. Read agents/workspace/lessons.md if present. Implement the lowest-numbered GitHub task under agents/tasks/ (FEAT-N or WIP-N that links raro42/itren issues). Commit and push origin/main. Rename WIP- to UNTESTED- when ready and append Testing instructions. Do not close the GitHub issue. Do not paste secrets or home paths."
}

step_003_tester() {
  local task base issue_n
  task="$(pick_lowest UNTESTED || true)"
  if [[ -z "$task" ]]; then
    task="$(pick_lowest TESTING "$TESTINGDIR" || true)"
  fi
  if [[ -z "$task" ]]; then
    echo "----- 003: no GitHub UNTESTED or TESTING tasks"
    return 0
  fi
  base="$(basename "$task")"
  if [[ "$base" == UNTESTED-* ]]; then
    local test_name="${base/UNTESTED-/TESTING-}"
    mv "$task" "$TESTINGDIR/$test_name"
    task="$TESTINGDIR/$test_name"
    base="$test_name"
    echo "----- 003: moved to testing/active/$(basename "$task")"
  fi
  issue_n="$(issue_num_from_task "$base")"
  echo "----- 003: testing $(basename "$task")"
  if [[ "$issue_n" =~ ^[0-9]+$ ]]; then
    ./scripts/gh-safe.sh issue comment "$issue_n" --body "Agent 003: testing (\`$(basename "$task")\`)." 2>/dev/null || true
  fi
  run_cursor "003" \
    "Follow agents/testing/TESTER.md. Test the GitHub TESTING- task under agents/testing/active/. On pass: move to agents/tasks/CLOSED-N-…. On fail: back to agents/tasks/WIP-N-… with a test report. Do not close the GitHub issue. Do not paste secrets."
}

step_004_handoff() {
  local task="" f base issue_n already_complete
  shopt -s nullglob
  for f in "$TASKDIR"/CLOSED-*.md; do
    is_gh_task "$f" || continue
    issue_n="$(issue_num_from_task "$(basename "$f")")"
    if github_issue_is_open "$issue_n"; then
      task="$f"
      break
    fi
  done
  if [[ -z "$task" ]]; then
    echo "----- 004: no CLOSED GitHub tasks awaiting close"
    return 0
  fi
  base="$(basename "$task")"
  issue_n="$(issue_num_from_task "$base")"
  already_complete=0
  grep -qE '^[[:space:]]*-?[[:space:]]*Handoff:[[:space:]]*complete' "$task" && already_complete=1
  echo "----- 004: handoff ${base}"
  if [[ "$already_complete" -ne 1 ]]; then
    ./scripts/gh-safe.sh issue comment "$issue_n" --body "Agent 004: closing review + changelog (\`${base}\`)." 2>/dev/null || true
    run_cursor "004" \
      "Follow agents/004-closing-reviewer/CLOSING-REVIEWER-PROMPT.md. Review ${base}. Align CHANGELOG.md if needed. Commit and push origin/main if needed. Then write Handoff: complete in the task file. Do not paste secrets."
  else
    echo "----- 004: already marked complete; closing GitHub if still open"
  fi
  if grep -qE '^[[:space:]]*-?[[:space:]]*Handoff:[[:space:]]*deferred' "$task" 2>/dev/null; then
    echo "----- 004: deferred; leaving issue open"
    return 0
  fi
  if github_issue_is_open "$issue_n"; then
    if ! close_github_issue_for_task "$issue_n" "$base"; then
      echo "----- 004: close failed for #${issue_n}; will retry" >&2
      return 0
    fi
  fi
}

run_once() {
  tick "cycle_start"
  echo "===== cycle start ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
  sync_main
  step_001_issues
  step_002_coder
  step_003_tester
  step_004_handoff
  step_003_tester
  step_004_handoff
  echo "===== cycle done ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
  tick "cycle_done"
}

cmd="${1:-once}"
case "$cmd" in
  once) run_once ;;
  loop)
    if ! acquire_loop_lock; then
      exit 1
    fi
    trap 'release_loop_lock' EXIT INT TERM
    echo "===== yonose loop start AGENT_USE_CURSOR=${AGENT_USE_CURSOR} idle_sleep=${sleepminutes}m busy_sleep=${busy_sleep_seconds}s pid=$$"
    while true; do
      run_once || true
      wait_s="$(cycle_sleep_seconds)"
      echo "AGENT_LOOP_SLEEP {\"seconds\":${wait_s}}"
      echo "----- sleep ${wait_s}s"
      sleep "$wait_s"
    done
    ;;
  status)
    if old="$(loop_lock_held)"; then
      echo "loop running pid=$old lock=$LOOP_LOCK"
      exit 0
    fi
    echo "loop not running"
    exit 1
    ;;
  001) sync_main; step_001_issues ;;
  002) sync_main; step_002_coder ;;
  003) sync_main; step_003_tester ;;
  004) sync_main; step_004_handoff ;;
  *)
    echo "usage: $0 [once|loop|status|001|002|003|004]" >&2
    exit 2
    ;;
esac
