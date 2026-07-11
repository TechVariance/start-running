"""Parser Apple Health/Watch (raw_format healthkit_json)."""

from __future__ import annotations

import json

import pytest

from metrics_engine.parsers import detect_format, parse
from metrics_engine.pipeline import process_activity


def hk_payload(n: int = 300, dt: float = 5.0, speed_m_s: float = 3.0, hr: float | None = 148.0):
    """Payload como o app envia: FC a cada ~5 s (padrão do Watch)."""
    samples = []
    for i in range(n):
        sample = {"t": i * dt, "distanceM": speed_m_s * i * dt, "altitudeM": 12.0}
        if hr is not None:
            sample["hr"] = hr
        samples.append(sample)
    return {
        "workout": {
            "uuid": "6ED9AC0D-2F3B-4F7A-9AF1-000000000001",
            "startedAt": "2026-07-05T07:00:00Z",
            "endedAt": "2026-07-05T07:25:00Z",
            "elapsedS": n * dt,
            "distanceM": speed_m_s * n * dt,
            "device": "Apple Watch Series 9",
            "sourceBundleId": "com.apple.workout",
        },
        "samples": samples,
    }


def test_detect_format_healthkit():
    raw = json.dumps(hk_payload(n=3)).encode()
    assert detect_format(raw) == "healthkit_json"


def test_parse_serie_canonica():
    series = parse(json.dumps(hk_payload()).encode())
    assert series.raw_format == "healthkit_json"
    assert series.richness_rank == 2  # equivale a TCX
    assert series.hr_sensor == "optical"  # Watch = sensor óptico (RN-2.2)
    assert series.device == "Apple Watch Series 9"
    assert len(series.df) == 300
    assert series.df["distance_m"].iloc[-1] == pytest.approx(3.0 * 299 * 5.0)


def test_sem_fc_hr_sensor_none():
    series = parse(json.dumps(hk_payload(hr=None)).encode())
    assert series.hr_sensor == "none"


def test_payload_invalido():
    with pytest.raises(ValueError):
        parse(b'{"workout": {}}')
    with pytest.raises(ValueError):
        parse(json.dumps({"workout": {"uuid": "x", "startedAt": "2026-01-01T00:00:00Z"}, "samples": []}).encode())


def test_pipeline_ponta_a_ponta_com_watch(profile):
    """Treino do Watch passa pelo mesmo pipeline canônico que um FIT."""
    raw = json.dumps(hk_payload(n=360, dt=5.0, speed_m_s=1000.0 / 300.0, hr=150.0)).encode()
    result = process_activity(raw, profile, activity_id="act_watch")
    assert result.layer1.distance_m == pytest.approx(5983, abs=20)
    assert result.load.hrtss is not None  # FC + LTHR presentes
    assert result.load.best[0] == "hrtss"
    # Amostragem de 5 s reduz a densidade => confiança < 1.0, mas utilizável
    assert 0.6 <= result.confidence < 1.0
    assert sum(result.time_in_zone.values()) > 0
