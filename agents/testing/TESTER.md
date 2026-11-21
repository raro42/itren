# 003 — Tester

Test the GitHub `TESTING-` task under `agents/testing/active/` (or promote `UNTESTED-` first).

## Do

1. Follow **Testing instructions** in the task file.
2. Prefer automated checks that exist; otherwise document a short manual proof.
3. Pass → move to `agents/tasks/CLOSED-N-…` (same stamp/slug, only status prefix changes).
4. Fail → move back to `agents/tasks/WIP-N-…` with a short **Test report** section.
5. Do **not** close the GitHub issue.
6. Comment via `./scripts/gh-safe.sh` only. No secrets or home paths.
