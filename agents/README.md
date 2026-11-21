# agents/

Thin agent loop for **itren** (pattern from [agents-explained](https://github.com/raro42/agents-explained) / mac-stats).

Shell orchestrator. Markdown roles. Task files are the queue. Cursor is a worker.

| Step | Role | Prompt |
|------|------|--------|
| 001 | Issue pickup | [001-issue-reviewer.md](001-issue-reviewer.md) · `issue_checker.py` |
| 002 | Coder | [006-feature-coder/FEATURE-CODER.md](006-feature-coder/FEATURE-CODER.md) |
| 003 | Tester | [testing/TESTER.md](testing/TESTER.md) (task tests + **quality pass**: review, smoke, perf, SEO/agentic) |
| 004 | Close | [004-closing-reviewer/CLOSING-REVIEWER-PROMPT.md](004-closing-reviewer/CLOSING-REVIEWER-PROMPT.md) |

```bash
./agents/yonose-cursor-loop.sh once|loop|status
./agents/yonose-cursor-loop.sh 001   # pickup only
```

**Repo:** `raro42/itren` (`YONOSE_GH_REPO`).  
**Queue:** `agents/tasks/` · `FEAT` → `WIP` → `UNTESTED` → `TESTING` → `CLOSED`.  
**Single instance:** `agents/state/loop.pid` (gitignored).

Product goal: people see if trains are on time and when the next one really arrives (Rodalies / Mataró and beyond). Station boards that omit long waits are the pain.
