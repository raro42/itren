# itren

**The board went blank. The app said “on time”. You stood there anyway.**

itren is a free web app for one moment: you are already at a Rodalies station, and you need the truth about the next train. Not a Spain-wide map. Not another timetable PDF. A phone-sized answer: next departure, honest delay, plain language, and when waiting stops making sense.

Private project by **Ralf Roeber**, hosted for our own needs. If it helps you: star the repo, share it.

**Try it:** [itren.zeitfenster.de](https://itren.zeitfenster.de) (old host `yonose.zeitfenster.de` still aliases for now)

ca / es / en · open source · Renfe data (CC BY 4.0)

Repo: [github.com/raro42/yonose](https://github.com/raro42/yonose)

---

## The pain

Anyone who rides Rodalies on a bad day knows this pattern:

1. You arrive with a plan (Pineda, Mataró, El Masnou, wherever).
2. The station board is empty, stuck, or optimistic.
3. Your phone map still draws a green train that will not come.
4. Twenty minutes later you are still “waiting”, while a taxi would have been cheaper than your evening.

That gap (board vs reality vs decision) is the product.

itren exists so a waiting human can answer, fast:

- What is the next real train toward my destination?
- How late is it, in minutes I can trust?
- Should I keep waiting, or leave?

If the feed has nothing honest to say, itren says that too. Empty truth beats a pretty lie.

---

## What you get

| | |
|---|---|
| **Next trains** | Origin → destination, from official Renfe GTFS + live updates when available |
| **Honesty** | Timetable-only banner when live delay is not confirmed; alerts when Renfe publishes them; cancelled trips stay visible |
| **Train details** | Tap a departure for delay source, wait, optional anonymous “how was it” report |
| **Leave vs wait** | Soft nudge when the wait is getting absurd, plus a maps deep-link for a ride |
| **Pulse** | Anonymous like/dislike + daily visitors / returning counts (no accounts) |
| **Habits** | Last trip and favorites in the browser (`localStorage`). No account required |
| **Languages** | Catalan, Spanish, English |
| **Access** | Keyboard and screen-reader first-class. No “accessibility overlay” widgets |
| **Local UI** | No Google Fonts CDN. Assets served from the app origin |

**Not this project:** a full Spain train atlas, App Store install, ads, or VC theatre. Maps like valfiguer / movilidad-bcn already cover “see the network”. itren covers “I am stuck here, what now?”.

---

## Quick start (local)

```bash
git clone git@github.com:raro42/yonose.git
cd yonose
export YONOSE_VERSION=0.1.0
export YONOSE_COMMIT=$(git rev-parse --short HEAD)
docker compose up -d --build
```

- App: http://127.0.0.1:9090  
- API health: http://127.0.0.1:9091/api/health  
- Feedback page: http://127.0.0.1:9090/feedback  

Pin-exact deps (npm + pip). Details in `CONTRIBUTE.md`.

---

## Stack

| Layer | Choice |
|-------|--------|
| Front | Angular **22.3.0** (exact pins), Amvara colours, vendored Open Sans |
| API | FastAPI, Renfe GTFS zip + GTFS-RT trip updates + alerts |
| Run | Docker Compose (localhost binds); TLS/HAProxy on the public host |

Agent automation for the repo: see `AGENTS.md`.

---

## Data and licence of the data

Timetable and live feeds: **Renfe Operadora**, published under **CC BY 4.0**. Attribution shown in the app and API responses.

---

## Licence

See `LICENSE.md` for application code.
