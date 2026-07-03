"""Carga interna e séries de carga (RF-3.3 a RF-3.5).

Por sessão, a melhor carga disponível (degradação elegante):
  hrTSS (FC + LTHR) > rTSS (pace + limiar) > TRIMP (FCmax/FCrep) >
  sRPE (RPE x minutos — único caminho no registro manual, RF-2.5).

Séries diárias:
  CTL: EWMA ~42 d ("fitness") | ATL: EWMA ~7 d (fadiga) | TSB = CTL - ATL
  ACWR: janela 7 d / 28 d; fora de [0.8, 1.3] emite alerta (RF-8.2)
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import date, timedelta

import pandas as pd

from ..models import AthleteProfile, CanonicalSeries

ACWR_SAFE_MIN = 0.8
ACWR_SAFE_MAX = 1.3

CTL_TIME_CONSTANT_D = 42.0
ATL_TIME_CONSTANT_D = 7.0
ACWR_ACUTE_WINDOW_D = 7
ACWR_CHRONIC_WINDOW_D = 28

#: Coeficiente do TRIMP de Banister por sexo (mulheres têm curva própria).
_TRIMP_EXP = {"female": 1.67, "male": 1.92}
_TRIMP_EXP_DEFAULT = 1.92


@dataclass
class SessionLoad:
    """Cargas calculadas para uma sessão; `best` aponta a usada no modelo."""

    trimp: float | None = None
    rtss: float | None = None
    hrtss: float | None = None
    srpe_load: float | None = None

    @property
    def best(self) -> tuple[str, float] | None:
        for name in ("hrtss", "rtss", "trimp", "srpe_load"):
            value = getattr(self, name)
            if value is not None:
                return name, value
        return None


def trimp_banister(series: CanonicalSeries, profile: AthleteProfile) -> float | None:
    """TRIMP = Σ dt_min × HRr × 0.64 × e^(k×HRr), HRr = (FC−rep)/(máx−rep)."""
    if not (profile.hr_max and profile.hr_rest) or not series.has_channel("hr"):
        return None
    df = series.df
    dt_min = df["elapsed_s"].diff().clip(upper=10.0) / 60.0
    hrr = ((df["hr"] - profile.hr_rest) / (profile.hr_max - profile.hr_rest)).clip(0, 1)
    k = _TRIMP_EXP.get(profile.sex or "", _TRIMP_EXP_DEFAULT)
    total = 0.0
    for i in range(1, len(df)):
        h, m = hrr.iloc[i], dt_min.iloc[i]
        if pd.isna(h) or pd.isna(m):
            continue
        total += float(m) * float(h) * 0.64 * math.exp(k * float(h))
    return round(total, 1) if total > 0 else None


def hrtss(duration_s: float, avg_hr: float | None, profile: AthleteProfile) -> float | None:
    """hrTSS = horas × IF² × 100, IF = FC média / LTHR (1 h no limiar = 100)."""
    if not profile.lthr or not avg_hr or duration_s <= 0:
        return None
    intensity = avg_hr / profile.lthr
    return round(duration_s / 3600.0 * intensity**2 * 100.0, 1)


def rtss(
    moving_s: float | None,
    gap_avg_s_per_km: float | None,
    profile: AthleteProfile,
) -> float | None:
    """rTSS = horas × IF² × 100, IF = velocidade GAP / velocidade de limiar."""
    if not profile.threshold_pace_s_per_km or not gap_avg_s_per_km or not moving_s:
        return None
    intensity = profile.threshold_pace_s_per_km / gap_avg_s_per_km  # razão de velocidades
    return round(moving_s / 3600.0 * intensity**2 * 100.0, 1)


def srpe_load(srpe: float | None, duration_s: float | None) -> float | None:
    """sRPE × minutos (Foster) — único caminho no registro manual (RF-2.5)."""
    if srpe is None or not duration_s:
        return None
    return round(srpe * duration_s / 60.0, 1)


def session_load(
    series: CanonicalSeries | None,
    profile: AthleteProfile,
    *,
    avg_hr: float | None = None,
    moving_s: float | None = None,
    elapsed_s: float | None = None,
    gap_avg_s_per_km: float | None = None,
    srpe: float | None = None,
) -> SessionLoad:
    """Calcula todas as cargas possíveis com o dado disponível.

    Sessões com dispositivo passam a série + agregados da Camada 1;
    registro manual (RF-2.5) passa apenas `elapsed_s` + `srpe`.
    """
    duration_s = moving_s or elapsed_s or (series.elapsed_s if series is not None else None)
    return SessionLoad(
        trimp=trimp_banister(series, profile) if series is not None else None,
        rtss=rtss(moving_s, gap_avg_s_per_km, profile),
        hrtss=hrtss(duration_s or 0.0, avg_hr, profile),
        srpe_load=srpe_load(srpe, duration_s),
    )


@dataclass
class DailyLoad:
    """Espelha `DailyLoad` de @startrunning/domain."""

    day: date
    daily_load: float
    ctl: float
    atl: float
    tsb: float
    acwr: float | None
    acwr_alert: bool = False


def daily_load_series(
    session_loads: list[tuple[date, float]],
    *,
    start_ctl: float = 0.0,
    start_atl: float = 0.0,
) -> list[DailyLoad]:
    """Série diária determinística a partir das sessões do período (RNF-2.3).

    Recomputar nunca duplica: a saída é função apenas da entrada. TSB do dia
    usa CTL/ATL de ONTEM — é a forma com que o atleta acordou (RF-3.4).
    """
    if not session_loads:
        return []
    per_day: dict[date, float] = {}
    for day, load in session_loads:
        per_day[day] = per_day.get(day, 0.0) + load
    first, last = min(per_day), max(per_day)
    days = [first + timedelta(days=i) for i in range((last - first).days + 1)]

    result: list[DailyLoad] = []
    ctl, atl = start_ctl, start_atl
    window: list[float] = []
    for day in days:
        load = per_day.get(day, 0.0)
        tsb = ctl - atl  # forma ao acordar, antes do treino do dia
        ctl += (load - ctl) / CTL_TIME_CONSTANT_D
        atl += (load - atl) / ATL_TIME_CONSTANT_D
        window.append(load)
        if len(window) > ACWR_CHRONIC_WINDOW_D:
            window.pop(0)
        chronic = sum(window) / len(window)
        acute_slice = window[-ACWR_ACUTE_WINDOW_D:]
        acute = sum(acute_slice) / len(acute_slice)
        acwr = round(acute / chronic, 2) if chronic > 0 else None
        result.append(
            DailyLoad(
                day=day,
                daily_load=round(load, 1),
                ctl=round(ctl, 1),
                atl=round(atl, 1),
                tsb=round(tsb, 1),
                acwr=acwr,
                acwr_alert=acwr is not None
                and not (ACWR_SAFE_MIN <= acwr <= ACWR_SAFE_MAX),
            )
        )
    return result
