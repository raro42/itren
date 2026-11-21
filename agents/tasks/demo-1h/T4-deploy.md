# T4 Deploy (parent after T1+T2+T3)

## Goal
Replace deploy-host stubs with real images. Public demo live.

## Scope
- Sync built compose project to the deploy host yonose dir (or rebuild there). Host name stays out of git.
- Keep localhost binds; do not edit HAProxy (already wired).
- Smoke: public site HTML is not stub; `/api/health` 200.

## Done when
- https://yonose.zeitfenster.de shows real UI.
- Public `/api/health` ok.
- No secrets/IPs in git or issue comments.
