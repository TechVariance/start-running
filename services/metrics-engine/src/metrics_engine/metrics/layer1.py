"""Camada 1 — núcleo universal por sessão (RF-3.2).

Splits por km, pace, GAP (pace ajustado ao grade — modelo de custo de
Minetti sobre o grade suavizado, doc 04 §2.2), cadência, elevação e
agregados da atividade. Tudo derivado da série canônica limpa (PC-5).
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
import pandas as pd

from ..models import CanonicalSeries

#: Janela (em amostras) para suavizar altitude antes de grade/elevação.
ALTITUDE_SMOOTH_WINDOW = 15
#: Ganho mínimo acumulado (m) para contar como subida — filtra ruído barométrico.
ELEVATION_GAIN_NOISE_M = 1.0
#: Abaixo desta velocidade a amostra não conta como tempo em movimento.
MOVING_SPEED_MIN_M_S = 0.5
#: Faixa de validade do polinômio de Minetti (grade como fração).
GRADE_CLAMP = 0.30

_MINETTI_COEF = (155.4, -30.4, -43.3, 46.3, 19.5, 3.6)  # i^5 … i^0 (J/kg/m)
_MINETTI_FLAT = 3.6


def minetti_cost(grade_fraction: float) -> float:
    """Custo energético de corrida C(i) em J/kg/m (Minetti et al., 2002)."""
    i = float(np.clip(grade_fraction, -GRADE_CLAMP, GRADE_CLAMP))
    return float(np.polyval(_MINETTI_COEF, i))


@dataclass
class KmSplit:
    """Espelha `KmSplit` de @startrunning/domain."""

    km: int
    pace_s_per_km: float
    gap_s_per_km: float | None = None
    avg_hr: float | None = None
    elevation_gain_m: float | None = None


@dataclass
class Layer1Result:
    splits: list[KmSplit] = field(default_factory=list)
    distance_m: float | None = None
    elapsed_s: float | None = None
    moving_s: float | None = None
    avg_pace_s_per_km: float | None = None
    gap_avg_s_per_km: float | None = None
    avg_hr: float | None = None
    max_hr: float | None = None
    avg_cadence_spm: float | None = None
    elevation_gain_m: float | None = None
    avg_temp_c: float | None = None


def _smooth_altitude(df: pd.DataFrame) -> pd.Series | None:
    if df["altitude_m"].isna().all():
        return None
    return (
        df["altitude_m"]
        .astype(float)
        .interpolate(limit_area="inside")
        .rolling(ALTITUDE_SMOOTH_WINDOW, center=True, min_periods=1)
        .mean()
    )


def enrich(series: CanonicalSeries) -> CanonicalSeries:
    """Deriva colunas por amostra: velocidade, pace, grade e GAP.

    Idempotente: recalcula sempre a partir dos canais primários.
    """
    df = series.df
    dt = df["elapsed_s"].diff()
    dd = df["distance_m"].astype(float).diff()
    speed = (dd / dt.replace(0, np.nan)).clip(lower=0)
    df["speed_m_s"] = speed
    df["pace_s_per_km"] = 1000.0 / speed.where(speed >= MOVING_SPEED_MIN_M_S)

    altitude = _smooth_altitude(df)
    if altitude is not None:
        dalt = altitude.diff()
        grade = (dalt / dd.replace(0, np.nan)).clip(-GRADE_CLAMP, GRADE_CLAMP)
        df["grade_pct"] = grade * 100.0
        cost = grade.map(lambda g: minetti_cost(g) if pd.notna(g) else np.nan)
        # Velocidade equivalente no plano = velocidade real × C(i)/C(0).
        gap_speed = speed * cost / _MINETTI_FLAT
        df["gap_s_per_km"] = 1000.0 / gap_speed.where(gap_speed >= MOVING_SPEED_MIN_M_S)
    else:
        df["grade_pct"] = np.nan
        df["gap_s_per_km"] = df["pace_s_per_km"]
    return series


def _elevation_gain(altitude: pd.Series | None) -> float | None:
    if altitude is None:
        return None
    deltas = altitude.diff()
    gain = float(deltas[deltas > 0].sum())
    return round(gain, 1) if gain >= ELEVATION_GAIN_NOISE_M else 0.0


def _split_rows(df: pd.DataFrame) -> list[tuple[int, pd.DataFrame]]:
    km_index = (df["distance_m"].astype(float) / 1000.0).fillna(0).astype(int)
    return [(int(km), group) for km, group in df.groupby(km_index) if len(group) > 1]


def compute(series: CanonicalSeries) -> Layer1Result:
    """Calcula a Camada 1 completa; chama `enrich` se ainda não foi chamado."""
    if "pace_s_per_km" not in series.df.columns:
        enrich(series)
    df = series.df
    result = Layer1Result(elapsed_s=round(series.elapsed_s, 1))

    has_distance = series.has_channel("distance_m")
    if has_distance:
        distance = float(df["distance_m"].max() - df["distance_m"].min())
        result.distance_m = round(distance, 1)
        dt = df["elapsed_s"].diff()
        moving = df["speed_m_s"] >= MOVING_SPEED_MIN_M_S
        moving_s = float(dt[moving].sum())
        result.moving_s = round(moving_s, 1)
        if distance > 0 and moving_s > 0:
            result.avg_pace_s_per_km = round(moving_s / (distance / 1000.0), 1)
        gap = df["gap_s_per_km"].dropna()
        if len(gap):
            gap_speed = 1000.0 / gap
            result.gap_avg_s_per_km = round(1000.0 / float(gap_speed.mean()), 1)

    if series.has_channel("hr"):
        result.avg_hr = round(float(df["hr"].mean()), 1)
        result.max_hr = float(df["hr"].max())
    if series.has_channel("cadence_spm"):
        result.avg_cadence_spm = round(float(df["cadence_spm"].mean()), 1)
    if series.has_channel("temp_c"):
        result.avg_temp_c = round(float(df["temp_c"].mean()), 1)
    result.elevation_gain_m = _elevation_gain(_smooth_altitude(df))

    if has_distance:
        for bucket, group in _split_rows(df):
            km = bucket + 1
            dist_km = float(group["distance_m"].iloc[-1] - group["distance_m"].iloc[0]) / 1000.0
            span_s = float(group["elapsed_s"].iloc[-1] - group["elapsed_s"].iloc[0])
            if dist_km <= 0 or span_s <= 0:
                continue
            gap = group["gap_s_per_km"].dropna()
            split = KmSplit(
                km=km,
                pace_s_per_km=round(span_s / dist_km, 1),
                gap_s_per_km=round(1000.0 / float((1000.0 / gap).mean()), 1) if len(gap) else None,
                avg_hr=round(float(group["hr"].mean()), 1) if group["hr"].notna().any() else None,
                elevation_gain_m=_elevation_gain(_smooth_altitude(group.reset_index(drop=True))),
            )
            result.splits.append(split)
    return result
