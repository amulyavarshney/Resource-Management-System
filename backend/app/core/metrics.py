"""Lightweight Prometheus metrics for HTTP traffic.

High-cardinality labels (full paths, user ids) are intentionally avoided.
"""

from __future__ import annotations

import time

from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest
from starlette.requests import Request
from starlette.responses import Response

REQUESTS = Counter(
    "rms_http_requests_total",
    "Total HTTP requests",
    ["method", "status_class"],
)

LATENCY = Histogram(
    "rms_http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["method"],
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0),
)


def _status_class(status_code: int) -> str:
    return f"{status_code // 100}xx"


async def metrics_middleware(request: Request, call_next):
    if request.url.path in ("/metrics", "/health/live", "/health/ready"):
        return await call_next(request)

    start = time.perf_counter()
    response = await call_next(request)
    elapsed = time.perf_counter() - start
    method = request.method
    REQUESTS.labels(method=method, status_class=_status_class(response.status_code)).inc()
    LATENCY.labels(method=method).observe(elapsed)
    return response


def metrics_response() -> Response:
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
