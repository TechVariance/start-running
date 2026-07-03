"""Parser FIT — o formato mais rico (richness_rank = 3).

Usa `fitdecode` para ler as mensagens `record` (série ponto a ponto),
`session` (metadados) e `device_info` (origem da FC — RN-2.2). O núcleo da
conversão (`records_to_series`) é puro e testável sem um arquivo FIT real.
"""

from __future__ import annotations

import io
from datetime import datetime, timezone
from typing import Any, Iterable, Mapping

import pandas as pd

from ..models import CanonicalSeries

#: Coordenadas FIT vêm em semicírculos: graus = valor × (180 / 2^31).
_SEMICIRCLE_TO_DEG = 180.0 / 2**31

#: Campos FIT `record` → coluna canônica. `enhanced_*` prevalece quando presente.
_RECORD_FIELDS = {
    "position_lat": "lat",
    "position_long": "lon",
    "distance": "distance_m",
    "heart_rate": "hr",
    "cadence": "cadence_spm",
    "altitude": "altitude_m",
    "enhanced_altitude": "altitude_m",
    "temperature": "temp_c",
    "power": "power_w",
}

#: ANT+ device_type 120 = monitor de FC dedicado (cinta) — confiança 1.0.
_ANTPLUS_HEART_RATE = 120


def records_to_series(
    records: Iterable[Mapping[str, Any]],
    *,
    device: str | None = None,
    hr_sensor: str = "none",
) -> CanonicalSeries:
    """Converte mensagens `record` (dicts campo→valor) na série canônica."""
    rows: list[dict[str, Any]] = []
    started_at: datetime | None = None
    for rec in records:
        ts = rec.get("timestamp")
        if ts is None:
            continue
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        if started_at is None:
            started_at = ts
        row: dict[str, Any] = {"elapsed_s": (ts - started_at).total_seconds()}
        for fit_field, column in _RECORD_FIELDS.items():
            value = rec.get(fit_field)
            if value is None:
                continue
            if column in ("lat", "lon"):
                value = value * _SEMICIRCLE_TO_DEG
            row[column] = float(value)
        rows.append(row)
    if not rows or started_at is None:
        raise ValueError("Arquivo FIT sem mensagens `record` com timestamp")
    df = pd.DataFrame(rows)
    return CanonicalSeries(
        df=df,
        started_at=started_at,
        raw_format="fit",
        device=device,
        hr_sensor=hr_sensor,
    )


def parse(raw: bytes) -> CanonicalSeries:
    """Lê o arquivo FIT e devolve a série canônica."""
    import fitdecode

    records: list[dict[str, Any]] = []
    device: str | None = None
    hr_sensor = "none"
    with fitdecode.FitReader(io.BytesIO(raw)) as reader:
        for frame in reader:
            if not isinstance(frame, fitdecode.FitDataMessage):
                continue
            if frame.name == "record":
                records.append({f.name: f.value for f in frame.fields})
            elif frame.name == "session":
                fields = {f.name: f.value for f in frame.fields}
                device = device or fields.get("sub_sport")
            elif frame.name == "device_info":
                fields = {f.name: f.value for f in frame.fields}
                if fields.get("antplus_device_type") == _ANTPLUS_HEART_RATE:
                    hr_sensor = "chest_strap"
                manufacturer = fields.get("manufacturer")
                product = fields.get("product_name") or fields.get("garmin_product")
                if fields.get("device_index") == "creator" and (manufacturer or product):
                    device = f"{manufacturer} {product}".strip()
    if hr_sensor == "none" and any(r.get("heart_rate") is not None for r in records):
        # Sem device_info de cinta, FC presente veio do sensor óptico do relógio.
        hr_sensor = "optical"
    return records_to_series(records, device=device, hr_sensor=hr_sensor)
