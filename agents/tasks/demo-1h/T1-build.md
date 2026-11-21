# T1 Build (serial gate, parent owns)

## Goal
Fast Docker images without shipping `node_modules` in context.

## Steps
1. Confirm `front/.dockerignore` and `api/.dockerignore` exist.
2. `export YONOSE_VERSION=0.1.0 YONOSE_COMMIT=$(git rev-parse --short HEAD)`
3. `docker compose build` (context must be small: front context << 20MB).
4. `docker compose up -d`
5. Curl local health + front index 200.

## Done when
- Images built in minutes, not stuck on 100MB+ context.
- Local front and API respond.
