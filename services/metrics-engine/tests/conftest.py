"""Fixtures compartilhadas — séries sintéticas e arquivos brutos mínimos."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pandas as pd
import pytest

from metrics_engine.models import AthleteProfile, CanonicalSeries

START = datetime(2026, 7, 1, 7, 0, tzinfo=timezone.utc)


def make_series(
    *,
    n: int = 600,
    dt_s: float = 1.0,
    speed_m_s: float = 1000.0 / 300.0,  # pace 5:00/km
    hr: float | None = 150.0,
    cadence: float | None = 170.0,
    altitude: float | None = 10.0,
    altitude_slope_m_per_s: float = 0.0,
    hr_sensor: str = "chest_strap",
    raw_format: str = "fit",
) -> CanonicalSeries:
    """Série 1 Hz constante — treino de esteira perfeito para asserções exatas."""
    rows = []
    for i in range(n):
        t = i * dt_s
        row = {
            "elapsed_s": t,
            "distance_m": speed_m_s * t,
        }
        if hr is not None:
            row["hr"] = hr
        if cadence is not None:
            row["cadence_spm"] = cadence
        if altitude is not None:
            row["altitude_m"] = altitude + altitude_slope_m_per_s * t
        rows.append(row)
    return CanonicalSeries(
        df=pd.DataFrame(rows),
        started_at=START,
        raw_format=raw_format,
        hr_sensor=hr_sensor,
    )


@pytest.fixture
def profile() -> AthleteProfile:
    return AthleteProfile(
        athlete_id="ath_1",
        sex="male",
        hr_rest=50,
        hr_max=190,
        lthr=170,
        threshold_pace_s_per_km=255.0,  # 4:15/km
        critical_power_w=320.0,
    )


def gpx_bytes(points: list[tuple[float, float, float | None, int | None]]) -> bytes:
    """GPX mínimo: (lat, lon, ele, hr) a cada 10 s a partir de START."""
    trkpts = []
    for i, (lat, lon, ele, hr) in enumerate(points):
        ts = (START + timedelta(seconds=10 * i)).strftime("%Y-%m-%dT%H:%M:%SZ")
        ele_xml = f"<ele>{ele}</ele>" if ele is not None else ""
        hr_xml = (
            "<extensions><gpxtpx:TrackPointExtension>"
            f"<gpxtpx:hr>{hr}</gpxtpx:hr>"
            "</gpxtpx:TrackPointExtension></extensions>"
            if hr is not None
            else ""
        )
        trkpts.append(f'<trkpt lat="{lat}" lon="{lon}">{ele_xml}<time>{ts}</time>{hr_xml}</trkpt>')
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<gpx version="1.1" creator="test" xmlns="http://www.topografix.com/GPX/1/1" '
        'xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">'
        f"<trk><name>run</name><trkseg>{''.join(trkpts)}</trkseg></trk></gpx>"
    ).encode()


def tcx_bytes(n: int = 60, speed_m_s: float = 3.0, hr: int = 145) -> bytes:
    """TCX mínimo com distância e FC por ponto, 1 ponto a cada 5 s."""
    tps = []
    for i in range(n):
        ts = (START + timedelta(seconds=5 * i)).strftime("%Y-%m-%dT%H:%M:%SZ")
        tps.append(
            f"<Trackpoint><Time>{ts}</Time>"
            f"<AltitudeMeters>12.0</AltitudeMeters>"
            f"<DistanceMeters>{speed_m_s * 5 * i:.1f}</DistanceMeters>"
            f"<HeartRateBpm><Value>{hr}</Value></HeartRateBpm>"
            f"<Cadence>85</Cadence></Trackpoint>"
        )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        "<TrainingCenterDatabase "
        'xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">'
        '<Activities><Activity Sport="Running">'
        f"<Id>{START.isoformat()}</Id><Lap StartTime=\"{START.isoformat()}\">"
        f"<Track>{''.join(tps)}</Track></Lap>"
        "<Creator><Name>Forerunner 265</Name></Creator>"
        "</Activity></Activities></TrainingCenterDatabase>"
    ).encode()
