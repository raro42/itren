"""Minimal public-API hardening: per-IP rate limit + security headers."""

from __future__ import annotations

import os
import time
from collections import defaultdict, deque
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

# requests per window per client IP
RATE_LIMIT = int(os.environ.get("YONOSE_RATE_LIMIT", "60"))
RATE_WINDOW_SEC = int(os.environ.get("YONOSE_RATE_WINDOW_SEC", "60"))

_ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "YONOSE_CORS_ORIGINS",
        "https://yonose.zeitfenster.de,http://127.0.0.1:9090,http://localhost:9090,http://127.0.0.1:4200,http://localhost:4200",
    ).split(",")
    if o.strip()
]


def cors_origins() -> list[str]:
    return list(_ALLOWED_ORIGINS)


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = RATE_LIMIT, window: int = RATE_WINDOW_SEC) -> None:
        super().__init__(app)
        self.limit = limit
        self.window = window
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = request.url.path
        if path.endswith("/health") or path.endswith("/api/health"):
            return await call_next(request)

        ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip() or (
            request.client.host if request.client else "unknown"
        )
        now = time.time()
        q = self._hits[ip]
        while q and now - q[0] > self.window:
            q.popleft()
        if len(q) >= self.limit:
            return JSONResponse(
                {"detail": "Rate limit exceeded"},
                status_code=429,
                headers={"Retry-After": str(self.window)},
            )
        q.append(now)
        return await call_next(request)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
        response.headers.setdefault("Cache-Control", "no-store")
        return response
