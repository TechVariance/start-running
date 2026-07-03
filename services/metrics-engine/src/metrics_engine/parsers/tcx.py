"""Parser TCX (Training Center XML) — richness_rank = 2.

Traz distância e FC por ponto (diferente do GPX), mas sem os campos de
dinâmica do FIT.
"""

from __future__ import annotations

import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import Any

import pandas as pd

from ..models import CanonicalSeries

_NS = {
    "tcx": "http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2",
    "ext": "http://www.garmin.com/xmlschemas/ActivityExtension/v2",
}


def _text(el: ET.Element | None) -> str | None:
    return el.text.strip() if el is not None and el.text else None


def _parse_time(value: str) -> datetime:
    ts = datetime.fromisoformat(value.replace("Z", "+00:00"))
    return ts if ts.tzinfo else ts.replace(tzinfo=timezone.utc)


def parse(raw: bytes) -> CanonicalSeries:
    root = ET.fromstring(raw)
    trackpoints = root.findall(".//tcx:Trackpoint", _NS)
    rows: list[dict[str, Any]] = []
    started_at: datetime | None = None
    for tp in trackpoints:
        time_text = _text(tp.find("tcx:Time", _NS))
        if not time_text:
            continue
        ts = _parse_time(time_text)
        if started_at is None:
            started_at = ts
        row: dict[str, Any] = {"elapsed_s": (ts - started_at).total_seconds()}
        pos = tp.find("tcx:Position", _NS)
        if pos is not None:
            lat = _text(pos.find("tcx:LatitudeDegrees", _NS))
            lon = _text(pos.find("tcx:LongitudeDegrees", _NS))
            if lat and lon:
                row["lat"], row["lon"] = float(lat), float(lon)
        for tag, column in (
            ("tcx:AltitudeMeters", "altitude_m"),
            ("tcx:DistanceMeters", "distance_m"),
            ("tcx:Cadence", "cadence_spm"),
        ):
            value = _text(tp.find(tag, _NS))
            if value is not None:
                row[column] = float(value)
        hr = _text(tp.find("tcx:HeartRateBpm/tcx:Value", _NS))
        if hr is not None:
            row["hr"] = float(hr)
        watts = _text(tp.find("tcx:Extensions/ext:TPX/ext:Watts", _NS))
        if watts is not None:
            row["power_w"] = float(watts)
        rows.append(row)
    if not rows or started_at is None:
        raise ValueError("Arquivo TCX sem Trackpoints com Time")
    df = pd.DataFrame(rows)
    hr_sensor = "optical" if df.get("hr") is not None and df["hr"].notna().any() else "none"
    creator = _text(root.find(".//tcx:Creator/tcx:Name", _NS))
    return CanonicalSeries(
        df=df,
        started_at=started_at,
        raw_format="tcx",
        device=creator,
        hr_sensor=hr_sensor,
    )
