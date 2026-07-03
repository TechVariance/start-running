"""Parser GPX — richness_rank = 1 (o formato mais pobre que aceitamos).

GPX não traz canal de distância; ela é derivada por haversine acumulada.
FC e cadência chegam pela extensão `gpxtpx` quando o exportador as inclui.
"""

from __future__ import annotations

import math
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import Any

import pandas as pd

from ..models import CanonicalSeries

_EARTH_RADIUS_M = 6_371_000.0


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Distância em metros entre dois pontos (lat/lon em graus)."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * _EARTH_RADIUS_M * math.asin(math.sqrt(a))


def _local(tag: str) -> str:
    """Nome local sem namespace — GPX aparece com variações de xmlns."""
    return tag.rsplit("}", 1)[-1]


def parse(raw: bytes) -> CanonicalSeries:
    root = ET.fromstring(raw)
    rows: list[dict[str, Any]] = []
    started_at: datetime | None = None
    prev: tuple[float, float] | None = None
    distance = 0.0
    for trkpt in root.iter():
        if _local(trkpt.tag) != "trkpt":
            continue
        lat, lon = float(trkpt.attrib["lat"]), float(trkpt.attrib["lon"])
        row: dict[str, Any] = {"lat": lat, "lon": lon}
        ts: datetime | None = None
        for child in trkpt.iter():
            name = _local(child.tag)
            text = child.text.strip() if child.text else None
            if not text:
                continue
            if name == "time":
                ts = datetime.fromisoformat(text.replace("Z", "+00:00"))
                if ts.tzinfo is None:
                    ts = ts.replace(tzinfo=timezone.utc)
            elif name == "ele":
                row["altitude_m"] = float(text)
            elif name == "hr":
                row["hr"] = float(text)
            elif name == "cad":
                # gpxtpx:cad é por perna; a série canônica usa passos/min totais.
                row["cadence_spm"] = float(text) * 2
            elif name == "atemp":
                row["temp_c"] = float(text)
        if ts is None:
            continue
        if started_at is None:
            started_at = ts
        row["elapsed_s"] = (ts - started_at).total_seconds()
        if prev is not None:
            distance += haversine_m(prev[0], prev[1], lat, lon)
        row["distance_m"] = distance
        prev = (lat, lon)
        rows.append(row)
    if not rows or started_at is None:
        raise ValueError("Arquivo GPX sem trkpt com time")
    df = pd.DataFrame(rows)
    hr_sensor = "optical" if "hr" in df.columns and df["hr"].notna().any() else "none"
    return CanonicalSeries(
        df=df,
        started_at=started_at,
        raw_format="gpx",
        hr_sensor=hr_sensor,
    )
