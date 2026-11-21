# T2 API (subagent A)

## Goal
Real next-train answers for a Maresme OD within the hour.

## Scope
- Harden `api/app/gtfs.py` + `main.py` only.
- Ensure GTFS zip download + parse works; cache under data volume.
- `/api/health`, `/api/stations?q=`, `/api/next?from=&to=` return honest JSON.
- Sample pair to verify: Pineda de Mar -> El Masnou (or closest GTFS names).
- Keep Renfe CC BY attribution in responses.
- No infra IPs/ports in code comments.
- **Security (required for demo):** in-memory per-IP rate limit (429 + Retry-After), CORS allowlist (public host + localhost), no `allow_origins=["*"]` in prod, hide stack traces, query bounds. Pin deps via `requirements.txt` + `requirements.lock`. Prefer no new unpinned packages.

## Done when
- `/api/next` returns >=1 departure or a clear empty_reason for that pair tonight.
- Startup failure does not crash forever (retry on request).
