# Changelog

Notable user-facing changes for itren. Semver lives in `front/package.json`.

## Unreleased

### Changed

- Empty board: shorter no-direct copy (ca / es / en), FAQ link jumps to `#faq-change`, tap-hint hidden when there are no rows.
- Honesty: `/api/next` `live_mode` is `live` only when a delay figure exists; empty boards report `timetable` / `timetable_only` from feed health instead of `unknown`.

## 0.1.0

- Initial public MVP board: next trains, delay honesty, FAQ, PWA shell, ca / es / en.
