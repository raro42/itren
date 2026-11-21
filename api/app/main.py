from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any
from zoneinfo import ZoneInfo

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from . import config, metrics
from .gtfs import STORE
from .security import RateLimitMiddleware, SecurityHeadersMiddleware, cors_origins

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("itren.api")
TZ = ZoneInfo("Europe/Madrid")

app = FastAPI(title="itren", version=config.VERSION, docs_url=None, redoc_url=None, openapi_url=None)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class VisitBody(BaseModel):
    visitor_id: str = Field(..., min_length=8, max_length=128)


class VoteBody(BaseModel):
    visitor_id: str = Field(..., min_length=8, max_length=128)
    vote: str = Field(..., pattern="^(like|dislike)$")


class ReportBody(BaseModel):
    visitor_id: str = Field(..., min_length=8, max_length=128)
    from_id: str = Field(..., min_length=1, max_length=32)
    to_id: str = Field(..., min_length=1, max_length=32)
    trip_id: str = Field(..., min_length=1, max_length=64)
    scheduled: str = Field(..., min_length=1, max_length=64)
    kind: str = Field(..., pattern="^(on_time|late|no_show|board_wrong)$")


@app.on_event("startup")
def _startup() -> None:
    metrics.init()
    import threading

    def _load() -> None:
        try:
            STORE.ensure_loaded()
        except Exception as e:
            log.exception("GTFS preload failed (will retry on request): %s", e)

    threading.Thread(target=_load, name="gtfs-preload", daemon=True).start()


@app.get("/health")
@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "itren-api",
        "version": config.VERSION,
        "commit": config.COMMIT,
        "gtfs_loaded": bool(STORE.stations),
        "gtfs_stops": len(STORE.stations),
        "gtfs_last_modified": STORE.gtfs_last_modified,
        "attribution": "Origen de los datos: Renfe Operadora (CC BY 4.0)",
    }


@app.get("/stats")
@app.get("/api/stats")
def stats() -> dict[str, Any]:
    return metrics.public_stats()


@app.post("/visit")
@app.post("/api/visit")
def visit(body: VisitBody) -> dict[str, Any]:
    return metrics.record_visit(body.visitor_id)


@app.post("/vote")
@app.post("/api/vote")
def vote(body: VoteBody) -> dict[str, Any]:
    return metrics.set_vote(body.visitor_id, body.vote)


@app.post("/report")
@app.post("/api/report")
def report(body: ReportBody) -> dict[str, Any]:
    return metrics.add_trip_report(
        body.visitor_id,
        from_id=body.from_id,
        to_id=body.to_id,
        trip_id=body.trip_id,
        scheduled=body.scheduled,
        kind=body.kind,
    )


@app.get("/stations")
@app.get("/api/stations")
def stations(q: str | None = Query(None), limit: int = Query(80, ge=1, le=300)) -> dict[str, Any]:
    try:
        STORE.ensure_loaded()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"GTFS unavailable: {e}") from e
    items = STORE.list_stations(q=q, limit=limit)
    return {
        "stations": [
            {"id": s.id, "name": s.name, "lat": s.lat, "lon": s.lon} for s in items
        ],
        "attribution": "Origen de los datos: Renfe Operadora (CC BY 4.0)",
    }


@app.get("/next")
@app.get("/api/next")
def next_trains(
    from_id: str = Query(..., alias="from"),
    to_id: str = Query(..., alias="to"),
    limit: int = Query(5, ge=1, le=12),
) -> dict[str, Any]:
    try:
        STORE.ensure_loaded()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"GTFS unavailable: {e}") from e

    from_st = STORE.stations.get(from_id) or next(
        (s for s in STORE.list_stations(limit=500) if s.id == from_id or s.name.casefold() == from_id.casefold()),
        None,
    )
    to_st = STORE.stations.get(to_id) or next(
        (s for s in STORE.list_stations(limit=500) if s.id == to_id or s.name.casefold() == to_id.casefold()),
        None,
    )
    if not from_st or not to_st:
        raise HTTPException(status_code=404, detail="Unknown station id")

    from datetime import timedelta

    deps = STORE.next_departures(from_st.id, to_st.id, limit=limit)
    now = datetime.now(TZ)
    board = []
    any_rt = False
    for d in deps:
        if d.realtime:
            any_rt = True
        delay = d.delay_seconds
        effective = d.scheduled_departure + timedelta(seconds=delay or 0)
        wait_min = max(0, int((effective - now).total_seconds() // 60))
        situation = _situation(wait_min, delay, d.realtime, d.cancelled)
        leave = (not d.cancelled) and (
            wait_min >= 45 or (delay is not None and delay >= 20 * 60 and wait_min >= 25)
        )
        delay_source = "live" if d.realtime and delay is not None else (
            "timetable" if not d.realtime else "unknown"
        )
        board.append(
            {
                "trip_id": d.trip_id,
                "line": d.route_short_name,
                "headsign": d.headsign,
                "scheduled": d.scheduled_departure.isoformat(),
                "delay_seconds": delay,
                "realtime": d.realtime,
                "cancelled": d.cancelled,
                "delay_source": delay_source,
                "wait_minutes": wait_min,
                "situation": situation,
                "suggest_leave": leave,
            }
        )

    feed_ok = STORE.live_feed_ok()
    if not deps:
        live_mode = "unknown"
    elif any_rt:
        live_mode = "live"
    elif feed_ok:
        live_mode = "timetable"  # feed up, no match for these trips
    else:
        live_mode = "timetable_only"

    taxi = None
    if from_st.lat is not None and from_st.lon is not None:
        taxi = {
            "maps": (
                f"https://www.google.com/maps/dir/?api=1&destination={from_st.lat},{from_st.lon}"
                f"&travelmode=driving"
            ),
            "label": from_st.name,
        }

    # Relevant alerts only (no elevator spam). Front shows them in train details, not on the board.
    lines = {str(row.get("line") or "") for row in board}
    alerts = STORE.active_alerts(
        from_name=from_st.name,
        to_name=to_st.name,
        lines=lines,
        limit=4,
    )

    return {
        "from": {"id": from_st.id, "name": from_st.name, "lat": from_st.lat, "lon": from_st.lon},
        "to": {"id": to_st.id, "name": to_st.name, "lat": to_st.lat, "lon": to_st.lon},
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "live_mode": live_mode,
        "live_feed_ok": feed_ok,
        "alerts": alerts,
        "departures": board,
        "taxi": taxi,
        "attribution": "Origen de los datos: Renfe Operadora (CC BY 4.0)",
        "empty_reason": None if board else "No more scheduled trips on this service day for that pair.",
    }


def _situation(wait_min: int, delay_seconds: int | None, realtime: bool, cancelled: bool) -> str:
    if cancelled:
        return "Cancelled according to live feed. Do not wait for this one."
    if delay_seconds is None:
        base = f"Next in about {wait_min} min (timetable"
        base += ", live delay not confirmed)" if not realtime else ")"
        return base
    delay_min = delay_seconds // 60
    if delay_min <= 1:
        return f"On time. Leaves in about {wait_min} min."
    if delay_min < 10:
        return f"About {delay_min} min late. Leaves in about {wait_min} min."
    if delay_min < 25:
        return f"Delayed ~{delay_min} min. Leaves in about {wait_min} min. Keep watching the board."
    return f"Heavy delay (~{delay_min} min). Wait ~{wait_min} min more, or leave."
