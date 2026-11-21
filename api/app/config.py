from __future__ import annotations

import os
from pathlib import Path

DATA_DIR = Path(os.environ.get("YONOSE_DATA_DIR", "/tmp/yonose-data"))
GTFS_URL = os.environ.get(
    "YONOSE_GTFS_URL",
    "https://ssl.renfe.com/ftransit/Fichero_CER_FOMENTO/fomento_transit.zip",
)
TRIP_UPDATES_URL = os.environ.get(
    "YONOSE_TRIP_UPDATES_URL",
    "https://gtfsrt.renfe.com/trip_updates.json",
)
ALERTS_URL = os.environ.get(
    "YONOSE_ALERTS_URL",
    "https://gtfsrt.renfe.com/alerts.json",
)
GTFS_MAX_AGE_HOURS = float(os.environ.get("YONOSE_GTFS_MAX_AGE_HOURS", "24"))
HTTP_TIMEOUT = float(os.environ.get("YONOSE_HTTP_TIMEOUT", "45"))
USER_AGENT = os.environ.get(
    "YONOSE_USER_AGENT",
    "yonose/0.1 (+https://github.com/raro42/yonose; CC-BY Renfe data)",
)
VERSION = os.environ.get("YONOSE_VERSION", "0.1.0")
COMMIT = os.environ.get("YONOSE_COMMIT", "dev")
