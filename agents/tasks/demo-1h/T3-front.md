# T3 Front (subagent B)

## Goal
Phone-usable Angular UI with Amvara look, a11y, footer.

## Scope
- `front/src/**` only (do not fight Docker/deploy).
- Station search by name, show next board, leave CTA, ca/es/en, localStorage favorites.
- Skip link, landmarks, aria-live board, visible focus, Amvara tokens.
- Footer: GitHub link + version + commit from environment.
- Keep build green (`ng build` production).
- Exact npm pins only (no `^`/`~` in package.json). `npm ci --ignore-scripts`.
- nginx: basic security headers (nosniff, referrer-policy, frame-ancestors).
- **No CDN:** fonts/scripts only from origin. Open Sans under `public/fonts/`. CSP must not allow Google Fonts.
- Include short “why we built this” story band (ca/es/en).

## Done when
- Production build succeeds.
- UI is not the stub; brand `yonose` visible; footer testids present; why-section present.
