"""Anonymous usage metrics: requests, daily visitors, likes, trip reports."""

from __future__ import annotations

import hashlib
import sqlite3
import threading
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

from . import config

_LOCK = threading.Lock()


def _db_path() -> Path:
    path = config.DATA_DIR / "metrics.sqlite"
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(str(_db_path()), timeout=10, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init() -> None:
    with _LOCK:
        conn = _connect()
        try:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS request_days (
                  day TEXT PRIMARY KEY,
                  count INTEGER NOT NULL DEFAULT 0
                );
                CREATE TABLE IF NOT EXISTS visits (
                  visitor_hash TEXT NOT NULL,
                  day TEXT NOT NULL,
                  PRIMARY KEY (visitor_hash, day)
                );
                CREATE TABLE IF NOT EXISTS app_votes (
                  visitor_hash TEXT PRIMARY KEY,
                  vote TEXT NOT NULL,
                  updated_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS trip_reports (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  visitor_hash TEXT NOT NULL,
                  from_id TEXT NOT NULL,
                  to_id TEXT NOT NULL,
                  trip_id TEXT NOT NULL,
                  scheduled TEXT NOT NULL,
                  kind TEXT NOT NULL,
                  day TEXT NOT NULL,
                  created_at TEXT NOT NULL
                );
                CREATE UNIQUE INDEX IF NOT EXISTS trip_reports_uniq
                  ON trip_reports (visitor_hash, from_id, to_id, trip_id, scheduled, day);
                """
            )
            conn.commit()
        finally:
            conn.close()


def _hash_visitor(raw: str) -> str | None:
    v = (raw or "").strip()
    if len(v) < 8 or len(v) > 128:
        return None
    # only accept opaque ids (hex / uuid-ish)
    allowed = set("0123456789abcdefABCDEF-")
    if any(c not in allowed for c in v):
        return None
    return hashlib.sha256(v.encode("utf-8")).hexdigest()[:40]


def bump_request() -> None:
    day = date.today().isoformat()
    with _LOCK:
        conn = _connect()
        try:
            conn.execute(
                """
                INSERT INTO request_days(day, count) VALUES (?, 1)
                ON CONFLICT(day) DO UPDATE SET count = count + 1
                """,
                (day,),
            )
            conn.commit()
        finally:
            conn.close()


def record_visit(visitor_id: str) -> dict[str, Any]:
    h = _hash_visitor(visitor_id)
    if not h:
        return {"ok": False, "error": "bad_visitor"}
    day = date.today().isoformat()
    with _LOCK:
        conn = _connect()
        try:
            conn.execute(
                "INSERT OR IGNORE INTO visits(visitor_hash, day) VALUES (?, ?)",
                (h, day),
            )
            conn.commit()
        finally:
            conn.close()
    return {"ok": True}


def set_vote(visitor_id: str, vote: str) -> dict[str, Any]:
    if vote not in ("like", "dislike"):
        return {"ok": False, "error": "bad_vote"}
    h = _hash_visitor(visitor_id)
    if not h:
        return {"ok": False, "error": "bad_visitor"}
    now = datetime.now(timezone.utc).isoformat()
    with _LOCK:
        conn = _connect()
        try:
            conn.execute(
                """
                INSERT INTO app_votes(visitor_hash, vote, updated_at) VALUES (?, ?, ?)
                ON CONFLICT(visitor_hash) DO UPDATE SET vote = excluded.vote, updated_at = excluded.updated_at
                """,
                (h, vote, now),
            )
            conn.commit()
        finally:
            conn.close()
    return {"ok": True, **vote_totals()}


def add_trip_report(
    visitor_id: str,
    *,
    from_id: str,
    to_id: str,
    trip_id: str,
    scheduled: str,
    kind: str,
) -> dict[str, Any]:
    allowed = {"on_time", "late", "no_show", "board_wrong"}
    if kind not in allowed:
        return {"ok": False, "error": "bad_kind"}
    h = _hash_visitor(visitor_id)
    if not h:
        return {"ok": False, "error": "bad_visitor"}
    from_id = (from_id or "").strip()[:32]
    to_id = (to_id or "").strip()[:32]
    trip_id = (trip_id or "").strip()[:64]
    scheduled = (scheduled or "").strip()[:64]
    if not from_id or not to_id or not trip_id or not scheduled:
        return {"ok": False, "error": "missing_fields"}
    day = date.today().isoformat()
    now = datetime.now(timezone.utc).isoformat()
    with _LOCK:
        conn = _connect()
        try:
            # one report per visitor/departure/day; last write wins
            conn.execute(
                """
                INSERT INTO trip_reports(visitor_hash, from_id, to_id, trip_id, scheduled, kind, day, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(visitor_hash, from_id, to_id, trip_id, scheduled, day)
                DO UPDATE SET kind = excluded.kind, created_at = excluded.created_at
                """,
                (h, from_id, to_id, trip_id, scheduled, kind, day, now),
            )
            conn.commit()
        finally:
            conn.close()
    return {"ok": True, "aggregates": trip_report_aggregates(from_id, to_id, trip_id, scheduled)}


def vote_totals() -> dict[str, int]:
    with _LOCK:
        conn = _connect()
        try:
            rows = conn.execute(
                "SELECT vote, COUNT(*) AS n FROM app_votes GROUP BY vote"
            ).fetchall()
        finally:
            conn.close()
    likes = 0
    dislikes = 0
    for r in rows:
        if r["vote"] == "like":
            likes = int(r["n"])
        elif r["vote"] == "dislike":
            dislikes = int(r["n"])
    return {"likes": likes, "dislikes": dislikes}


def trip_report_aggregates(
    from_id: str, to_id: str, trip_id: str, scheduled: str
) -> dict[str, int]:
    with _LOCK:
        conn = _connect()
        try:
            rows = conn.execute(
                """
                SELECT kind, COUNT(*) AS n FROM trip_reports
                WHERE from_id = ? AND to_id = ? AND trip_id = ? AND scheduled = ?
                GROUP BY kind
                """,
                (from_id, to_id, trip_id, scheduled),
            ).fetchall()
        finally:
            conn.close()
    out = {"on_time": 0, "late": 0, "no_show": 0, "board_wrong": 0}
    for r in rows:
        k = r["kind"]
        if k in out:
            out[k] = int(r["n"])
    return out


def public_stats() -> dict[str, Any]:
    today = date.today().isoformat()
    with _LOCK:
        conn = _connect()
        try:
            req_today = conn.execute(
                "SELECT count FROM request_days WHERE day = ?", (today,)
            ).fetchone()
            req_total = conn.execute("SELECT COALESCE(SUM(count), 0) AS n FROM request_days").fetchone()
            visitors_today = conn.execute(
                "SELECT COUNT(*) AS n FROM visits WHERE day = ?", (today,)
            ).fetchone()
            # returning = visitors seen on a prior day who also visited today
            returning_today = conn.execute(
                """
                SELECT COUNT(*) AS n FROM visits v
                WHERE v.day = ?
                  AND EXISTS (
                    SELECT 1 FROM visits p
                    WHERE p.visitor_hash = v.visitor_hash AND p.day < ?
                  )
                """,
                (today, today),
            ).fetchone()
            days_active = conn.execute("SELECT COUNT(*) AS n FROM request_days").fetchone()
        finally:
            conn.close()
    votes = vote_totals()
    return {
        "day": today,
        "requests_today": int(req_today["count"]) if req_today else 0,
        "requests_total": int(req_total["n"]) if req_total else 0,
        "visitors_today": int(visitors_today["n"]) if visitors_today else 0,
        "returning_today": int(returning_today["n"]) if returning_today else 0,
        "days_tracked": int(days_active["n"]) if days_active else 0,
        "likes": votes["likes"],
        "dislikes": votes["dislikes"],
    }
