# yonose

**The board went blank. The app said “on time”. You stood there anyway.**

yonose is a free web app for one moment: you are already at a Rodalies station, and you need the truth about the next train. Not a Spain-wide map. Not another timetable PDF. A phone-sized answer: next departure, honest delay, plain language, and when waiting stops making sense.

**Try it:** [yonose.zeitfenster.de](https://yonose.zeitfenster.de)

ca / es / en · open source · Renfe data (CC BY 4.0)

---

## The pain

Anyone who rides Rodalies on a bad day knows this pattern:

1. You arrive with a plan (Pineda, Mataró, El Masnou, wherever).
2. The station board is empty, stuck, or optimistic.
3. Your phone map still draws a green train that will not come.
4. Twenty minutes later you are still “waiting”, while a taxi would have been cheaper than your evening.

That gap (board vs reality vs decision) is the product.

yonose exists so a waiting human can answer, fast:

- What is the next real train toward my destination?
- How late is it, in minutes I can trust?
- Should I keep waiting, or leave?

If the feed has nothing honest to say, yonose says that too. Empty truth beats a pretty lie.

---

## What you get

| | |
|---|---|
| **Next trains** | Origin → destination, from official Renfe GTFS + live updates when available |
| **Situation in plain words** | Delay and wait time you can read on a platform in the rain |
| **Leave vs wait** | Soft nudge when the wait is getting absurd, plus a maps deep-link for a ride |
| **Habits** | Last trip and favorites in the browser (`localStorage`). No account required |
| **Languages** | Catalan, Spanish, English |
| **Access** | Keyboard and screen-reader first-class. No “accessibility overlay” widgets |
| **Local UI** | No Google Fonts CDN. Assets served from the app origin |

**Not this project:** a full Spain train atlas, App Store install, ads, or VC theatre. Maps like valfiguer / movilidad-bcn already cover “see the network”. yonose covers “I am stuck here, what now?”.

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
| API | FastAPI, Renfe GTFS zip + GTFS-RT trip updates |
| Run | Docker Compose (localhost binds); TLS/HAProxy on the public host |

Agent automation for the repo: see `AGENTS.md`.

---

## Data and licence of the data

Schedules and realtime come from **Renfe Operadora** open data (GTFS / GTFS-RT), **CC BY 4.0**.

On-screen attribution:

> Origen de los datos: Renfe Operadora (CC BY 4.0)

Code in this repository: see `LICENSE.md` (MIT).

---

## Feedback and issues

Something wrong on the board? Idea for the Maresme corridor? Accessibility miss?

- In the app: **Give feedback** → GitHub issues  
- Direct: [github.com/raro42/yonose/issues](https://github.com/raro42/yonose/issues)  
- New issue: [open one](https://github.com/raro42/yonose/issues/new)

Please do not paste passwords, private IPs, or personal data into issues.

---

## Contributing

We want this used on real platforms, by real people, including people who navigate with a screen reader.

How to help (code, copy, a11y, Rodalies knowledge): **`CONTRIBUTE.md`**.

---

## Name

**yonose** = you do not know (Spanish *yo no sé*), until the board tells the truth. Then you do.
