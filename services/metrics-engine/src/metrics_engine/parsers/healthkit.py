"""Parser do bruto Apple Health/Watch — raw_format 'healthkit_json'.

A Apple não expõe FIT: o app exporta o treino do HealthKit como JSON
canônico (contrato em services/api/.../apple-health/apple-health.types.ts —
os dois lados mudam no mesmo PR). Riqueza equivale a TCX: FC + distância
acumulada, sem dinâmica de corrida. FC do Watch é sensor óptico (RN-2.2).
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

import pandas as pd

from ..models import CanonicalSeries

#: Campos do sample HealthKit → coluna canônica.
_SAMPLE_FIELDS = {
    "hr": "hr",
    "lat": "lat",
    "lon": "lon",
    "distanceM": "distance_m",
    "altitudeM": "altitude_m",
    "cadenceSpm": "cadence_spm",
}


def parse(raw: bytes) -> CanonicalSeries:
    try:
        payload: dict[str, Any] = json.loads(raw)
    except json.JSONDecodeError as error:
        raise ValueError(f"Payload HealthKit não é JSON válido: {error}") from error

    workout = payload.get("workout") or {}
    samples = payload.get("samples")
    if not workout.get("uuid") or not workout.get("startedAt") or samples is None:
        raise ValueError("Payload HealthKit exige workout.uuid, workout.startedAt e samples")

    started_at = datetime.fromisoformat(str(workout["startedAt"]).replace("Z", "+00:00"))
    if started_at.tzinfo is None:
        started_at = started_at.replace(tzinfo=timezone.utc)

    rows: list[dict[str, Any]] = []
    for sample in samples:
        t = sample.get("t")
        if t is None or float(t) < 0:
            continue
        row: dict[str, Any] = {"elapsed_s": float(t)}
        for field, column in _SAMPLE_FIELDS.items():
            value = sample.get(field)
            if value is not None:
                row[column] = float(value)
        rows.append(row)
    if not rows:
        raise ValueError("Payload HealthKit sem samples com t válido")

    df = pd.DataFrame(rows)
    hr_sensor = "optical" if "hr" in df.columns and df["hr"].notna().any() else "none"
    return CanonicalSeries(
        df=df,
        started_at=started_at,
        raw_format="healthkit_json",
        device=workout.get("device"),
        hr_sensor=hr_sensor,
    )
