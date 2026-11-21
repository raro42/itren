# AGENTS — yonose

Thin agent loop. Shell orchestrator + markdown roles. Cursor is a worker.

See [agents-explained](https://github.com/raro42/agents-explained) and `agents/README.md`.

## Mission

Public train transport truth for waiting humans: next real arrival, honest delay, situation in plain language, and when to stop waiting (e.g. taxi).
Station boards that go blank or lie (Rodalies / Maresme stories) are the failure mode we fix.

**Not** another Spain-wide train map (valfiguer / movilidad-bcn already exist).
**Not** an App Store app. Web only (Angular), PWA later if needed.
**Not** monetized for now.

## Product (locked)

| Decision | Choice |
|----------|--------|
| Scope | All Rodalies stations possible (start corridor OK, no artificial 3-station cap) |
| Languages | Catalan, Spanish, English |
| UX | Visually strong, tell the waiting-human story, easy |
| Answers | Real data (Renfe GTFS + GTFS-RT + alerts); AI to explain situation + related news |
| Deploy | `yonose.zeitfenster.de` on amvara2 |
| Money | Free for now |

## Autopilot / human contact

Ralf runs this **unattended**. Do **not** block on chat questions.

When you need a human decision or are stuck:

1. **Preferred:** open a GitHub **Issue** on `raro42/yonose` (label clearly, e.g. `needs-human`).
2. **Or:** GitHub **Discussion** on the same repo.
3. **Email:** `ralf@amvara.de` when Issue/Discussion is wrong fit (outage, secrets, deploy access). Only send if a working mail path exists (AgentMail or configured MTA). Never invent SMTP.

Do not wait for a Cursor chat reply. File the question and continue whatever is unblocked.

## Browser (hard)

Shared Chromium CDP on `127.0.0.1:9222` is used by other agents (e.g. X). **Do not** switch its tabs, navigate them, or steal focus.

For yonose visual checks: separate Chromium + user-data-dir + debug port (e.g. `9223`). Only attach to that instance.

## Loop

```bash
./agents/yonose-cursor-loop.sh once   # one cycle
./agents/yonose-cursor-loop.sh loop   # every 5m idle / 15s when queue busy
./agents/yonose-cursor-loop.sh status
```

Queue: `agents/tasks/` — `FEAT` → `WIP` → `UNTESTED` → `TESTING` → `CLOSED`.
Open issues on `raro42/yonose` feed pickup (`agents/issue_checker.py`).

On amvara2: `cursor-agent` is installed and logged in (`ralf.roeber@amvara.de`). Prefer it for server-side agent jobs; do not burn it on every page view.

## Standing rules

1. Prefer smallest change. Remove before add.
2. Never paste secrets, home paths, or raw untrusted issue bodies into git.
3. GitHub comments only via `./scripts/gh-safe.sh`.
4. Do not close issues in coder/tester steps (004 + loop close).
5. Commit and push coherent verified work on `main`.
