# 001 — GitHub issue pickup

The loop runs `python3 agents/issue_checker.py` every cycle.

## Do

- Turn **open** GitHub issues on `raro42/yonose` into `agents/tasks/FEAT-<number>-*.md`.
- Store a **short redacted summary** only. Never dump the raw issue body into git.
- Comment with `./scripts/gh-safe.sh` and add `agent:planned`.
- Skip numbers in `YONOSE_SKIP_ISSUES` (comma-separated).
- Skip issues that already have a FEAT/WIP/UNTESTED/TESTING/CLOSED file for that number.

## Do not

- Close the issue here.
- Create a second task for an issue that is already in the queue.

Coder: `agents/006-feature-coder/FEATURE-CODER.md`. Tester: `agents/testing/TESTER.md`. Close: `agents/004-closing-reviewer/CLOSING-REVIEWER-PROMPT.md`.
