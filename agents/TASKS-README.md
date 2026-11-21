# Task workflow (itren)

Filename: `<STATUS>-<GITHUB-ISSUE-NUMBER>-<YYYYMMDD-HHMM>-<slug>.md`

Statuses: `FEAT` → `WIP` → `UNTESTED` → `TESTING` → `CLOSED`

Use issue `0` only when there is no GitHub issue.

Live queue: `agents/tasks/`. In-flight tests: `agents/testing/active/`.

Tester (003) always runs the **Quality pass** in `agents/testing/TESTER.md`: change review, public smoke, gzip/perf, SEO/agentic, then a Test report.
