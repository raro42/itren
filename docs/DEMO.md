# Demo / platform ride check

Short script to prove the MVP on a phone at the station (or at a desk).

## Public

https://itren.zeitfenster.de/

## 3 minutes

1. Open the site on the phone (fresh tab). Brand is **itren**.
2. Tap **Pineda de Mar → El Masnou** (or type both stations).
3. Tap **Show next trains**.
4. Check the honesty banner:
   - green-ish: live matched at least one train
   - warn: timetable only / live not confirmed
5. If alerts exist, they show above the board in plain text.
6. Tap a train row → detail sheet (delay source, trip id, optional report).
7. If wait is long, **Consider leaving** + **Open maps for a ride**.
8. Footer: like/dislike, GitHub link, version + short commit SHA.

## API smoke (optional)

```bash
curl -sS https://itren.zeitfenster.de/api/health
curl -sS 'https://itren.zeitfenster.de/api/next?from=79604&to=79407&limit=3'
```

Expect JSON with `live_mode`, `alerts`, and `departures` (cancelled stays visible when the feed says so).

## Pass

You can answer on the platform: next train, delay trust level, wait or leave. Empty truth beats a pretty lie.
