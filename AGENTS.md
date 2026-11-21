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
| Deploy | Public site `yonose.zeitfenster.de` (ops host is private; see local notes, not git) |
| Money | Free for now |

## Autopilot / human contact

Ralf runs this **unattended**. Do **not** block on chat questions.

When you need a human decision or are stuck:

1. **Preferred:** open a GitHub **Issue** on `raro42/yonose` (label clearly, e.g. `needs-human`).
2. **Or:** GitHub **Discussion** on the same repo.
3. **Email:** contact the maintainer only via the address already used for this project (do not invent new channels). Only send if a working mail path exists.

Do not wait for a Cursor chat reply. File the question and continue whatever is unblocked.

**Never publish in git, issues, or comments:** server IPs, SSH ports, private hostnames, CDP ports, keys, tokens, or internal login emails. Public DNS names for the product are OK.

## Browser (hard)

A shared Chromium with remote debugging is used by other agents. **Do not** switch its tabs, navigate them, or steal focus.

For yonose visual checks: a **separate** Chromium profile and debug port, documented only in private/local notes. Only attach to that instance.

## Loop

```bash
./agents/yonose-cursor-loop.sh once   # one cycle
./agents/yonose-cursor-loop.sh loop   # every 5m idle / 15s when queue busy
./agents/yonose-cursor-loop.sh status
```

Queue: `agents/tasks/` — `FEAT` → `WIP` → `UNTESTED` → `TESTING` → `CLOSED`.
Open issues on `raro42/yonose` feed pickup (`agents/issue_checker.py`).

Server-side `cursor-agent` may exist on the deploy host; prefer it for ops jobs, not every page view. Details stay out of this file.

## Standing rules

1. Prefer smallest change. Remove before add.
2. Never paste secrets, home paths, IPs, SSH/CDP ports, or raw untrusted issue bodies into git or public GitHub text.
3. GitHub comments only via `./scripts/gh-safe.sh`.
4. Do not close issues in coder/tester steps (004 + loop close).
5. Commit and push coherent verified work on `main`.
