# 003 — Tester

Test the GitHub `TESTING-` task under `agents/testing/active/` (or promote `UNTESTED-` first).

Public site: https://itren.zeitfenster.de/  
Repo: `raro42/itren`

## Do

1. Follow **Testing instructions** in the task file.
2. Always run the **Quality pass** below (even if the task only lists a narrow check).
3. Prefer automated checks that exist; otherwise document a short manual proof.
4. Pass → move to `agents/tasks/CLOSED-N-…` (same stamp/slug, only status prefix changes).
5. Fail → move back to `agents/tasks/WIP-N-…` with a short **Test report** section.
6. Do **not** close the GitHub issue.
7. Comment via `./scripts/gh-safe.sh` only. No secrets or home paths.

---

## Quality pass (required)

Run this after the task-specific tests. Goal: catch regressions in UX truth, perf, and agent-readiness before close.

### A. Change review

1. Identify commits / files touched for this issue (`git log`, `git diff` vs base or previous CLOSED).
2. Confirm the change matches the task **Done when** / acceptance notes. No drive-by scope.
3. Spot-check for:
   - Broken station lock-in (typed names like `El masnou` must still resolve)
   - Honesty: board must not look “live confident” when `live_mode` is timetable-only
   - i18n: ca / es / en strings present for new UI copy (no Spanglish `issue` in es/ca; use `pregunta`)
   - Secrets / private hosts / CDP ports never in git, issues, or comments
4. Footer shows real short commit SHA matching the deploy you tested (or note deploy lag).

### B. Functional smoke (public)

```bash
curl -sS -m 15 https://itren.zeitfenster.de/api/health
curl -sS -m 45 'https://itren.zeitfenster.de/api/next?from=79604&to=79407&limit=2'
curl -sS -m 15 https://itren.zeitfenster.de/ | head -c 2000
```

Expect:

- `/api/health` → `ok`, `gtfs_loaded` true (retry briefly after redeploy)
- `/api/next` → `live_mode`, `departures`, optional `alerts`
- HTML → brand **itren**, boot-shell / real title / description for agents

UI path (browser or CDP on the **itren** profile only, never the shared X Chromium):

1. Quick chip **Pineda de Mar → El Masnou** or **Terrassa → Barcelona**
2. Show next trains; honesty banner visible
3. Tap one departure → detail sheet opens; Escape closes
4. Desktop: hand cursor on buttons/links in header and footer

### C. Performance

Minimum bar (no new installs required):

```bash
# HTML + main JS must be gzip on the wire
MAIN=$(curl -sS https://itren.zeitfenster.de/ | grep -oE 'main-[A-Za-z0-9]+\.js' | head -1)
curl -sS -D- -o /dev/null -H 'Accept-Encoding: gzip' "https://itren.zeitfenster.de/$MAIN" | grep -i content-encoding
curl -sS -D- -o /dev/null -H 'Accept-Encoding: gzip' https://itren.zeitfenster.de/ | grep -i content-encoding
```

Expect `content-encoding: gzip` for HTML and JS.

Also check:

- Only **one** font preload in `index` (Regular), not Bold + Regular fighting LCP
- Soft stats (`/visit`, `/stats`) must not block first paint (deferred / idle in app code)
- Feedback route stays lazy-loaded when that pattern is in the build
- No new CDN scripts/fonts (CSP `script-src 'self'`)
- Initial JS: note raw vs transferred sizes from the production build log if you rebuilt; flag if uncompressed main grows a lot without reason

If `lighthouse` or Chromium Lighthouse is already available locally, run mobile/desktop on https://itren.zeitfenster.de/ and attach category scores in the Test report. **Do not** `npm install` lighthouse just for this.

### D. SEO / agentic browse

From raw HTML (no JS required for these):

- `<title>` includes itren
- `meta name="description"`, `link rel="canonical"`, Open Graph tags
- JSON-LD `WebApplication` (or equivalent) present
- `#boot-shell` (or equivalent) has real product sentences + one `h1`
- `/robots.txt` and `/sitemap.xml` return 200

After JS: one clear brand `h1`, stable `data-testid` on trip form / show / board.

### E. Pass / fail

**Pass** only if A–D have no blocking failures. Soft notes (e.g. “Lighthouse not installed”) are OK if curl/HTML checks pass.

**Fail** examples: no gzip on JS, empty SPA shell with no boot text, timetable shown as live green, deploy SHA missing/wrong, Pineda→Masnou broken, secrets in the diff.

---

## Test report (append to task file)

```markdown
## Test report
- Date (CEST):
- Commit / deploy SHA:
- Task-specific: pass|fail — …
- Quality pass: pass|fail
  - Change review: …
  - Smoke: …
  - Perf (gzip / notes): …
  - SEO/agentic: …
- Lighthouse (optional): Perf … SEO … …
```

## Do not

- Close the GitHub issue (004 + loop do that).
- Attach to the shared X Chromium (`9222`) or random browser tabs.
- Paste server IPs, SSH/CDP ports, tokens, or home paths into issues or git.
