"""Qualidade do dado — pré-requisito de qualquer cálculo (PC-5).

Regras (docs/arquitetura/04 §2.1):
- FC: fonte chest_strap confiança base 1.0; optical 0.8 ajustada por variância.
  Spikes fora de [30, 230] bpm ou salto > 20 bpm/s -> remove + interpola <= 5 s.
- Gaps: <= 10 s interpola; > 10 s marca segmento e exclui das médias por zona.
- GPS: velocidade implícita > 12 m/s -> mediana móvel + flag;
  distância oficial prioriza o campo `distance` do dispositivo.
- Confiança agregada < 0.6 -> UI sinaliza; motor de treino não recalibra
  limiares com a sessão (RNF-7.1).
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from ..models import HR_SENSOR_CONFIDENCE, CanonicalSeries, QualityFlag, QualityReport

HR_MIN_BPM = 30
HR_MAX_BPM = 230
HR_MAX_JUMP_BPM_PER_S = 20.0
INTERPOLATE_MAX_S = 5.0
GAP_THRESHOLD_S = 10.0
GPS_MAX_SPEED_M_S = 12.0
GPS_MEDIAN_WINDOW = 5


def _flag(df: pd.DataFrame, mask, flag: QualityFlag) -> None:
    df.loc[mask, "quality_flags"] = df.loc[mask, "quality_flags"].astype(int) | int(flag)


def _clean_hr(df: pd.DataFrame) -> None:
    """Remove spikes de FC e interpola buracos curtos (regra 2)."""
    if df["hr"].isna().all():
        return
    hr = df["hr"].astype(float)
    dt = df["elapsed_s"].diff()
    jump = hr.diff().abs() / dt.replace(0, np.nan)
    spikes = (hr < HR_MIN_BPM) | (hr > HR_MAX_BPM) | (jump > HR_MAX_JUMP_BPM_PER_S)
    spikes = spikes.fillna(False)
    _flag(df, spikes, QualityFlag.SPIKE_REMOVED)
    hr[spikes] = np.nan
    df["hr"] = hr

    # Interpola apenas trechos ausentes com duração <= 5 s; o resto vira gap.
    missing = hr.isna()
    if not missing.any():
        return
    interpolated = hr.interpolate(method="linear", limit_area="inside")
    for _, run in missing[missing].groupby((~missing).cumsum()):
        idx = run.index
        lo = max(idx[0] - 1, df.index[0])
        hi = min(idx[-1] + 1, df.index[-1])
        span = float(df.loc[hi, "elapsed_s"] - df.loc[lo, "elapsed_s"])
        if span <= INTERPOLATE_MAX_S and interpolated.loc[idx].notna().all():
            df.loc[idx, "hr"] = interpolated.loc[idx]
            _flag(df, df.index.isin(idx), QualityFlag.INTERPOLATED)
        else:
            _flag(df, df.index.isin(idx), QualityFlag.GAP)


def _mark_gaps(df: pd.DataFrame) -> float:
    """Marca amostras que iniciam após buraco > 10 s de gravação (regra 3)."""
    dt = df["elapsed_s"].diff()
    gap_starts = (dt > GAP_THRESHOLD_S).fillna(False)
    _flag(df, gap_starts, QualityFlag.GAP)
    return float(dt[gap_starts].sum()) if gap_starts.any() else 0.0


def _clean_gps(df: pd.DataFrame) -> None:
    """Suaviza drift de GPS por mediana móvel quando a velocidade implícita
    entre pontos é fisicamente impossível (regra 4)."""
    if df["lat"].isna().all() or df["lon"].isna().all():
        return
    from ..parsers.gpx import haversine_m

    lat, lon = df["lat"].astype(float), df["lon"].astype(float)
    dt = df["elapsed_s"].diff()
    step_m = pd.Series(
        [
            haversine_m(lat.iloc[i - 1], lon.iloc[i - 1], lat.iloc[i], lon.iloc[i])
            if i > 0 and pd.notna(lat.iloc[i]) and pd.notna(lat.iloc[i - 1])
            else np.nan
            for i in range(len(df))
        ],
        index=df.index,
    )
    implied_speed = step_m / dt.replace(0, np.nan)
    drift = (implied_speed > GPS_MAX_SPEED_M_S).fillna(False)
    if not drift.any():
        return
    _flag(df, drift, QualityFlag.GPS_DRIFT)
    smooth_lat = lat.rolling(GPS_MEDIAN_WINDOW, center=True, min_periods=1).median()
    smooth_lon = lon.rolling(GPS_MEDIAN_WINDOW, center=True, min_periods=1).median()
    df.loc[drift, "lat"] = smooth_lat[drift]
    df.loc[drift, "lon"] = smooth_lon[drift]


def _confidence(series: CanonicalSeries, gap_s: float) -> tuple[float, dict]:
    """Confiança agregada = média ponderada dos sinais (regra 5)."""
    df = series.df
    n = len(df)
    flags = df["quality_flags"].astype(int)
    touched = (flags & int(QualityFlag.SPIKE_REMOVED | QualityFlag.INTERPOLATED)) != 0
    interpolated_fraction = float(touched.sum()) / n if n else 1.0

    dt = df["elapsed_s"].diff().dropna()
    median_dt = float(dt.median()) if len(dt) else float("inf")
    # 1 Hz (ou mais denso) = 1.0; degrada linearmente até 0 em amostragem 10 s.
    density_score = float(np.clip((GAP_THRESHOLD_S - median_dt) / (GAP_THRESHOLD_S - 1.0), 0, 1))

    has_hr = series.has_channel("hr")
    hr_source_score = HR_SENSOR_CONFIDENCE.get(series.hr_sensor, 0.0) if has_hr else None

    components: dict[str, float] = {
        "clean_fraction": 1.0 - interpolated_fraction,
        "sampling_density": density_score,
    }
    weights: dict[str, float] = {"clean_fraction": 0.5, "sampling_density": 0.25}
    if hr_source_score is not None:
        components["hr_source"] = hr_source_score
        weights["hr_source"] = 0.25
    total_weight = sum(weights.values())
    confidence = sum(components[k] * weights[k] for k in components) / total_weight

    notes = {
        "components": components,
        "interpolated_fraction": interpolated_fraction,
        "gap_seconds": gap_s,
        "median_sample_interval_s": median_dt,
    }
    return round(float(confidence), 3), notes


def clean(series: CanonicalSeries) -> tuple[CanonicalSeries, QualityReport]:
    """Valida e limpa a série canônica, devolvendo confiança agregada.

    Trabalha sobre uma cópia — a série de entrada (espelho do bruto)
    permanece intacta (ADR-0006).
    """
    cleaned = CanonicalSeries(
        df=series.df.copy(),
        started_at=series.started_at,
        raw_format=series.raw_format,
        sport=series.sport,
        device=series.device,
        hr_sensor=series.hr_sensor,
    )
    df = cleaned.df
    _clean_hr(df)
    gap_s = _mark_gaps(df)
    _clean_gps(df)
    confidence, notes = _confidence(cleaned, gap_s)
    return cleaned, QualityReport(confidence=confidence, notes=notes)
