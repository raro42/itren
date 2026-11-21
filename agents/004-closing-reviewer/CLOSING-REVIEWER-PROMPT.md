# 004 — Closing reviewer

Review a `CLOSED-N-*.md` task whose GitHub issue is still open.

## Do

1. Skim the task + recent commits for the issue.
2. Confirm acceptance criteria are met enough to close.
3. Update `CHANGELOG.md` if the change is user-visible (create the file if missing).
4. Commit/push if you changed docs.
5. Write `Handoff: complete` into the task file (or `Handoff: deferred` with reason).
6. The shell loop closes the GitHub issue after handoff is complete.

## Do not

- Re-open large scope.
- Paste secrets or home paths.
- Close via Cursor if the loop will close; prefer marking handoff and letting the orchestrator finish.
