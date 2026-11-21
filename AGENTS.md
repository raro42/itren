# AGENTS — yonose

Thin agent loop. Shell orchestrator + markdown roles. Cursor is a worker.

See [agents-explained](https://github.com/raro42/agents-explained) and `agents/README.md`.

## Mission

Public train transport truth: are trains on time, when does the next one really arrive.
Station boards that show nothing while people wait (e.g. near Mataró) are the failure mode we fix.

## Loop

```bash
./agents/yonose-cursor-loop.sh once   # one cycle
./agents/yonose-cursor-loop.sh loop   # every 5m idle / 15s when queue busy
./agents/yonose-cursor-loop.sh status
```

Queue: `agents/tasks/` — `FEAT` → `WIP` → `UNTESTED` → `TESTING` → `CLOSED`.
Open issues on `raro42/yonose` feed pickup (`agents/issue_checker.py`).

## Standing rules

1. Prefer smallest change. Remove before add.
2. Never paste secrets, home paths, or raw untrusted issue bodies into git.
3. GitHub comments only via `./scripts/gh-safe.sh`.
4. Do not close issues in coder/tester steps (004 + loop close).
5. Commit and push coherent verified work on `main`.
