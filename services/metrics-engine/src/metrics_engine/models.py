"""Modelo canônico do motor — espelha `packages/domain` (ver doc 01 §4).

Qualquer mudança de vocabulário aqui deve acontecer no mesmo PR que muda
`packages/domain`. A série canônica é um DataFrame 1 linha = 1 amostra
(tipicamente 1 Hz), com colunas nomeadas como os campos de `StreamSample`
em snake_case.
"""

from __future__ import annotations

import enum
from dataclasses import dataclass, field
from datetime import datetime

import pandas as pd

#: Colunas da série canônica (Camada 1 + Camada 2 opcional).
SERIES_COLUMNS = [
    "elapsed_s",
    "lat",
    "lon",
    "distance_m",
    "hr",
    "cadence_spm",
    "altitude_m",
    "temp_c",
    "power_w",
    "quality_flags",
]

#: FIT(3) > TCX(2) ≈ HealthKit(2) > GPX(1) > resumo(0) — decide dedup e
#: reprocessamento (RF-2.6/2.7). HealthKit traz FC + distância (como TCX),
#: mas nunca dinâmica de corrida.
RICHNESS_RANK = {"fit": 3, "tcx": 2, "healthkit_json": 2, "gpx": 1}

#: Confiança base da FC pela origem do sensor (RN-2.2 / doc 04 §2.1).
HR_SENSOR_CONFIDENCE = {"chest_strap": 1.0, "optical": 0.8, "none": 0.0}


class QualityFlag(enum.IntFlag):
    """Bitmask por ponto (PC-5) — espelha `QualityFlag` de @startrunning/domain."""

    NONE = 0
    SPIKE_REMOVED = 1 << 0
    INTERPOLATED = 1 << 1
    GAP = 1 << 2
    GPS_DRIFT = 1 << 3


@dataclass
class CanonicalSeries:
    """Série temporal canônica de uma atividade + metadados de procedência."""

    df: pd.DataFrame
    started_at: datetime
    raw_format: str  # 'fit' | 'tcx' | 'gpx'
    sport: str = "run"
    device: str | None = None
    hr_sensor: str = "none"  # 'chest_strap' | 'optical' | 'none'

    def __post_init__(self) -> None:
        for col in SERIES_COLUMNS:
            if col not in self.df.columns:
                self.df[col] = pd.NA
        self.df["quality_flags"] = self.df["quality_flags"].fillna(0).astype(int)
        self.df = self.df.sort_values("elapsed_s").reset_index(drop=True)

    @property
    def richness_rank(self) -> int:
        return RICHNESS_RANK.get(self.raw_format, 0)

    @property
    def elapsed_s(self) -> float:
        if self.df.empty:
            return 0.0
        return float(self.df["elapsed_s"].iloc[-1] - self.df["elapsed_s"].iloc[0])

    def has_channel(self, column: str) -> bool:
        return column in self.df.columns and self.df[column].notna().any()


@dataclass
class AthleteProfile:
    """Camada 0 — subconjunto do `AthleteProfile` do domínio usado no cálculo.

    Campos ausentes não bloqueiam: o motor degrada para a melhor métrica
    disponível (RN-1.2).
    """

    athlete_id: str
    sex: str | None = None  # 'female' | 'male' | ...
    hr_rest: int | None = None
    hr_max: int | None = None
    lthr: int | None = None
    threshold_pace_s_per_km: float | None = None
    critical_power_w: float | None = None
    weight_kg: float | None = None


@dataclass
class QualityReport:
    """Saída do estágio de qualidade (PC-5) — propagada até a UI (RNF-7.1)."""

    confidence: float
    notes: dict = field(default_factory=dict)


#: Abaixo disso a UI sinaliza "baixa confiança" e o motor de treino não
#: recalibra limiares com a sessão (doc 04 §2.1, DS §7.6).
LOW_CONFIDENCE_THRESHOLD = 0.6
