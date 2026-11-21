from __future__ import annotations

import csv
import io
import json
import logging
import threading
import time
import zipfile
from dataclasses import dataclass
from datetime import date, datetime, time as dtime, timedelta, timezone
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

import httpx

from . import config

log = logging.getLogger("itren.gtfs")
TZ = ZoneInfo("Europe/Madrid")


@dataclass
class Station:
    id: str
    name: str
    lat: float | None
    lon: float | None


@dataclass
class Departure:
    trip_id: str
    route_short_name: str
    headsign: str
    stop_id: str
    dest_stop_id: str
    scheduled_departure: datetime
    delay_seconds: int | None
    realtime: bool
    cancelled: bool


class GtfsStore:
    def __init__(self, data_dir: Path | None = None) -> None:
        self.data_dir = data_dir or config.DATA_DIR
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.zip_path = self.data_dir / "fomento_transit.zip"
        self.meta_path = self.data_dir / "gtfs_meta.json"
        self._lock = threading.RLock()
        self.stations: dict[str, Station] = {}
        self.stop_name_index: dict[str, str] = {}
        # trip_id -> list of (seq, stop_id, dep_seconds, arr_seconds, headsign)
        self.trip_stops: dict[str, list[tuple[int, str, int | None, int | None, str]]] = {}
        self.trip_route: dict[str, str] = {}
        self.route_short: dict[str, str] = {}
        self.service_days: dict[str, set[date]] = {}
        self.trip_service: dict[str, str] = {}
        self.loaded_at: float | None = None
        self.gtfs_last_modified: str | None = None
        self._alerts_cache: list[dict[str, str]] = []
        self._alerts_fetched_at: float = 0.0
        self._rt_ok_at: float = 0.0

    def ensure_loaded(self) -> None:
        with self._lock:
            if self.stations and self.trip_stops and self.service_days:
                return
            need_download = True
            if self.zip_path.exists() and self.meta_path.exists():
                try:
                    meta = json.loads(self.meta_path.read_text())
                    age_h = (time.time() - float(meta.get("fetched_at", 0))) / 3600.0
                    if age_h < config.GTFS_MAX_AGE_HOURS:
                        need_download = False
                except Exception:
                    need_download = True
            if need_download:
                self.refresh_static()
            else:
                self._parse_zip()

    def refresh_static(self) -> None:
        log.info("Downloading GTFS from %s", config.GTFS_URL)
        headers = {"User-Agent": config.USER_AGENT}
        with httpx.Client(timeout=config.HTTP_TIMEOUT, follow_redirects=True, headers=headers) as client:
            r = client.get(config.GTFS_URL)
            r.raise_for_status()
            self.zip_path.write_bytes(r.content)
            last_mod = r.headers.get("last-modified")
        self.meta_path.write_text(
            json.dumps(
                {
                    "fetched_at": time.time(),
                    "last_modified": last_mod,
                    "url": config.GTFS_URL,
                }
            )
        )
        self.gtfs_last_modified = last_mod
        self._parse_zip()

    def _parse_zip(self) -> None:
        log.info("Parsing GTFS zip %s", self.zip_path)
        with zipfile.ZipFile(self.zip_path) as zf:
            names = {n.split("/")[-1].lower(): n for n in zf.namelist()}

            def read_csv(name: str) -> list[dict[str, str]]:
                key = names.get(name.lower())
                if not key:
                    return []
                raw = zf.read(key)
                text = raw.decode("utf-8-sig", errors="replace")
                # Renfe pads some headers/values with spaces; normalize.
                reader = csv.DictReader(io.StringIO(text))
                if not reader.fieldnames:
                    return []
                reader.fieldnames = [((h or "").strip()) for h in reader.fieldnames]
                rows: list[dict[str, str]] = []
                for row in reader:
                    rows.append(
                        {
                            (k or "").strip(): (v or "").strip()
                            for k, v in row.items()
                            if k is not None
                        }
                    )
                return rows

            stops = read_csv("stops.txt")
            routes = read_csv("routes.txt")
            trips = read_csv("trips.txt")
            stop_times = read_csv("stop_times.txt")
            calendar = read_csv("calendar.txt")
            calendar_dates = read_csv("calendar_dates.txt")

        stations: dict[str, Station] = {}
        stop_name_index: dict[str, str] = {}
        for row in stops:
            sid = (row.get("stop_id") or "").strip()
            if not sid:
                continue
            name = (row.get("stop_name") or sid).strip()
            lat = _f(row.get("stop_lat"))
            lon = _f(row.get("stop_lon"))
            stations[sid] = Station(id=sid, name=name, lat=lat, lon=lon)
            stop_name_index[name.casefold()] = sid

        route_short = {
            (r.get("route_id") or "").strip(): (r.get("route_short_name") or r.get("route_id") or "").strip()
            for r in routes
            if (r.get("route_id") or "").strip()
        }

        trip_route: dict[str, str] = {}
        trip_service: dict[str, str] = {}
        for t in trips:
            tid = (t.get("trip_id") or "").strip()
            if not tid:
                continue
            trip_route[tid] = (t.get("route_id") or "").strip()
            trip_service[tid] = (t.get("service_id") or "").strip()

        service_days = _build_service_days(calendar, calendar_dates)

        trip_stops: dict[str, list[tuple[int, str, int | None, int | None, str]]] = {}
        for st in stop_times:
            tid = (st.get("trip_id") or "").strip()
            sid = (st.get("stop_id") or "").strip()
            if not tid or not sid:
                continue
            seq = int(float(st.get("stop_sequence") or 0))
            dep = _hms_to_seconds(st.get("departure_time"))
            arr = _hms_to_seconds(st.get("arrival_time"))
            head = (st.get("stop_headsign") or "").strip()
            trip_stops.setdefault(tid, []).append((seq, sid, dep, arr, head))

        for rows in trip_stops.values():
            rows.sort(key=lambda x: x[0])

        # Atomic publish (callers hold _lock via ensure_loaded / refresh_static).
        self.stations = stations
        self.stop_name_index = stop_name_index
        self.route_short = route_short
        self.trip_route = trip_route
        self.trip_service = trip_service
        self.service_days = service_days
        self.trip_stops = trip_stops
        self.loaded_at = time.time()
        try:
            meta = json.loads(self.meta_path.read_text()) if self.meta_path.exists() else {}
            self.gtfs_last_modified = meta.get("last_modified") or self.gtfs_last_modified
        except Exception:
            pass
        log.info(
            "GTFS loaded: %s stops, %s trips, %s services",
            len(self.stations),
            len(self.trip_stops),
            len(self.service_days),
        )

    def list_stations(self, q: str | None = None, limit: int = 80) -> list[Station]:
        self.ensure_loaded()
        items = list(self.stations.values())
        # Prefer unique names (collapse platforms by name)
        by_name: dict[str, Station] = {}
        for s in items:
            key = s.name.casefold()
            prev = by_name.get(key)
            if prev is None or (s.lat is not None and prev.lat is None):
                by_name[key] = s
        items = sorted(by_name.values(), key=lambda s: s.name.casefold())
        if q:
            ql = q.casefold().strip()
            items = [s for s in items if ql in s.name.casefold()]
        return items[:limit]

    def next_departures(self, from_id: str, to_id: str, limit: int = 6) -> list[Departure]:
        self.ensure_loaded()
        from_ids = self._expand_stop_ids(from_id)
        to_ids = self._expand_stop_ids(to_id)
        if not from_ids or not to_ids:
            return []

        now = datetime.now(TZ)
        today = now.date()
        now_sec = now.hour * 3600 + now.minute * 60 + now.second
        results: list[Departure] = []

        for tid, stops in self.trip_stops.items():
            service = self.trip_service.get(tid)
            if not service or today not in self.service_days.get(service, set()):
                continue
            from_idx = None
            to_idx = None
            for i, (_seq, sid, dep, _arr, _h) in enumerate(stops):
                if from_idx is None and sid in from_ids and dep is not None:
                    from_idx = i
                elif from_idx is not None and sid in to_ids:
                    to_idx = i
                    break
            if from_idx is None or to_idx is None or to_idx <= from_idx:
                continue
            dep_sec = stops[from_idx][2]
            if dep_sec is None:
                continue
            # allow slight past (2 min) for boarding truth
            if dep_sec + 120 < now_sec:
                continue
            head = stops[from_idx][4] or stops[-1][4] or self.stations.get(stops[-1][1], Station("", "", None, None)).name
            if not head:
                dest = self.stations.get(stops[to_idx][1])
                head = dest.name if dest else stops[to_idx][1]
            route_id = self.trip_route.get(tid, "")
            route = self.route_short.get(route_id, route_id or "?")
            scheduled = _seconds_to_dt(today, dep_sec)
            results.append(
                Departure(
                    trip_id=tid,
                    route_short_name=route,
                    headsign=head,
                    stop_id=stops[from_idx][1],
                    dest_stop_id=stops[to_idx][1],
                    scheduled_departure=scheduled,
                    delay_seconds=None,
                    realtime=False,
                    cancelled=False,
                )
            )

        results.sort(key=lambda d: d.scheduled_departure)
        results = results[: max(limit * 3, 12)]
        self._apply_realtime(results)
        # Keep cancelled visible (honesty); sort effective time, cancelled last among ties
        results.sort(
            key=lambda d: (
                1 if d.cancelled else 0,
                d.scheduled_departure + timedelta(seconds=d.delay_seconds or 0),
            )
        )
        return results[:limit]

    def live_feed_ok(self) -> bool:
        return bool(self._rt_ok_at) and (time.time() - self._rt_ok_at) < 300

    def active_alerts(self, limit: int = 5) -> list[dict[str, str]]:
        self._refresh_alerts()
        return list(self._alerts_cache[:limit])

    def _refresh_alerts(self) -> None:
        if self._alerts_fetched_at and (time.time() - self._alerts_fetched_at) < 120:
            return
        headers = {"User-Agent": config.USER_AGENT, "Accept": "application/json"}
        try:
            with httpx.Client(timeout=min(15.0, config.HTTP_TIMEOUT), follow_redirects=True, headers=headers) as client:
                r = client.get(config.ALERTS_URL)
                if r.status_code != 200:
                    self._alerts_fetched_at = time.time()
                    return
                ctype = (r.headers.get("content-type") or "").lower()
                if "json" not in ctype and not r.text.lstrip().startswith("{"):
                    self._alerts_fetched_at = time.time()
                    return
                data = r.json()
        except Exception as e:
            log.warning("alerts fetch failed: %s", e)
            self._alerts_fetched_at = time.time()
            return

        out: list[dict[str, str]] = []
        for ent in data.get("entity") or data.get("entities") or []:
            alert = ent.get("alert") or {}
            header = _alert_text(alert.get("headerText") or alert.get("header_text"))
            desc = _alert_text(alert.get("descriptionText") or alert.get("description_text"))
            text = header or desc
            if not text:
                continue
            out.append({"header": header or text[:120], "description": desc})
            if len(out) >= 8:
                break
        self._alerts_cache = out
        self._alerts_fetched_at = time.time()

    def _expand_stop_ids(self, stop_id: str) -> set[str]:
        base = self.stations.get(stop_id)
        if not base:
            # try as name
            sid = self.stop_name_index.get(stop_id.casefold())
            if sid:
                base = self.stations.get(sid)
                stop_id = sid
        if not base:
            return {stop_id}
        name = base.name.casefold()
        return {s.id for s in self.stations.values() if s.name.casefold() == name}

    def _apply_realtime(self, deps: list[Departure]) -> None:
        if not deps:
            return
        headers = {"User-Agent": config.USER_AGENT, "Accept": "application/json"}
        try:
            with httpx.Client(timeout=min(20.0, config.HTTP_TIMEOUT), follow_redirects=True, headers=headers) as client:
                r = client.get(config.TRIP_UPDATES_URL)
                if r.status_code != 200:
                    return
                ctype = (r.headers.get("content-type") or "").lower()
                if "json" not in ctype and not r.text.lstrip().startswith("{"):
                    # WAF HTML with 200
                    return
                data = r.json()
        except Exception as e:
            log.warning("trip_updates fetch failed: %s", e)
            return

        self._rt_ok_at = time.time()
        by_trip: dict[str, Any] = {}
        for ent in data.get("entity") or data.get("entities") or []:
            tu = ent.get("tripUpdate") or ent.get("trip_update") or {}
            trip = tu.get("trip") or {}
            tid = (trip.get("tripId") or trip.get("trip_id") or "").strip()
            if tid:
                by_trip[tid] = tu

        for d in deps:
            tu = by_trip.get(d.trip_id)
            if not tu:
                continue
            d.realtime = True
            sched = tu.get("trip") or {}
            if (sched.get("scheduleRelationship") or sched.get("schedule_relationship")) in (
                "CANCELED",
                "CANCELLED",
                3,
                "3",
            ):
                d.cancelled = True
                continue
            delay = None
            for stu in tu.get("stopTimeUpdate") or tu.get("stop_time_update") or []:
                sid = (stu.get("stopId") or stu.get("stop_id") or "").strip()
                if sid and sid != d.stop_id and sid not in self._expand_stop_ids(d.stop_id):
                    continue
                dep = stu.get("departure") or {}
                if "delay" in dep:
                    delay = int(dep["delay"])
                    break
                if delay is None and "delay" in (stu.get("arrival") or {}):
                    delay = int(stu["arrival"]["delay"])
            if delay is not None:
                d.delay_seconds = delay


def _alert_text(block: Any) -> str:
    if not block:
        return ""
    if isinstance(block, str):
        return block.strip()
    translations = block.get("translation") or block.get("translations") or []
    for t in translations:
        text = (t.get("text") or "").strip()
        if text:
            return text
    return ""


def _f(v: str | None) -> float | None:
    if v is None or v == "":
        return None
    try:
        return float(v)
    except ValueError:
        return None


def _hms_to_seconds(v: str | None) -> int | None:
    if not v:
        return None
    parts = v.strip().split(":")
    if len(parts) < 2:
        return None
    try:
        h, m = int(parts[0]), int(parts[1])
        s = int(float(parts[2])) if len(parts) > 2 else 0
        return h * 3600 + m * 60 + s
    except ValueError:
        return None


def _seconds_to_dt(day: date, seconds: int) -> datetime:
    extra_days, sec = divmod(seconds, 86400)
    t = dtime(hour=sec // 3600, minute=(sec % 3600) // 60, second=sec % 60)
    dt = datetime.combine(day + timedelta(days=extra_days), t, tzinfo=TZ)
    return dt


def _build_service_days(
    calendar: list[dict[str, str]], calendar_dates: list[dict[str, str]]
) -> dict[str, set[date]]:
    out: dict[str, set[date]] = {}
    today = datetime.now(TZ).date()
    window_end = today + timedelta(days=14)
    window_start = today - timedelta(days=1)

    for row in calendar:
        sid = (row.get("service_id") or "").strip()
        if not sid:
            continue
        start = _parse_ymd(row.get("start_date"))
        end = _parse_ymd(row.get("end_date"))
        if not start or not end:
            continue
        days = {
            0: row.get("monday") == "1",
            1: row.get("tuesday") == "1",
            2: row.get("wednesday") == "1",
            3: row.get("thursday") == "1",
            4: row.get("friday") == "1",
            5: row.get("saturday") == "1",
            6: row.get("sunday") == "1",
        }
        cur = max(start, window_start)
        last = min(end, window_end)
        bucket = out.setdefault(sid, set())
        while cur <= last:
            if days.get(cur.weekday()):
                bucket.add(cur)
            cur += timedelta(days=1)

    for row in calendar_dates:
        sid = (row.get("service_id") or "").strip()
        d = _parse_ymd(row.get("date"))
        if not sid or not d:
            continue
        if d < window_start or d > window_end:
            continue
        exc = (row.get("exception_type") or "").strip()
        bucket = out.setdefault(sid, set())
        if exc == "1":
            bucket.add(d)
        elif exc == "2":
            bucket.discard(d)
    return out


def _parse_ymd(v: str | None) -> date | None:
    if not v:
        return None
    s = v.strip()
    if len(s) != 8 or not s.isdigit():
        return None
    try:
        return date(int(s[0:4]), int(s[4:6]), int(s[6:8]))
    except ValueError:
        return None


STORE = GtfsStore()
