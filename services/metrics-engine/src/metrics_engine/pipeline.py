"""Orquestração do pipeline por sessão.

Fluxo (docs/arquitetura/04): job `activity.received` -> baixa bruto do S3 ->
parse -> qualidade (PC-5) -> Camada 1 -> carga -> persiste derivadas
versionadas -> emite `activity.processed` / `load.updated`.

Este módulo contém apenas o núcleo puro e determinístico (bytes -> derivadas);
S3, Postgres e fila entram pelo worker, mantendo o cálculo testável e
recomputável (ADR-0006). Idempotência (RNF-2.3): mesma entrada, mesma saída;
derivadas fazem upsert por (activity_id, methodology_version).

Orçamento de latência: parse + qualidade + Camada 1 + carga <= 30 s para um
treino típico de 1 h a 1 Hz (RNF-1.1: leitura pronta em <= 2 min).
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass, field
from datetime import datetime, timezone

from . import METHODOLOGY_VERSION
from .metrics import layer1 as layer1_module
from .metrics.load import SessionLoad, session_load, srpe_load
from .models import LOW_CONFIDENCE_THRESHOLD, AthleteProfile, CanonicalSeries
from .parsers import parse
from .quality.cleaning import clean
from .zones.engine import ZoneBoundary, resolve_boundaries, time_in_zone

#: Âncora padrão quando o atleta não tem configuração de zonas: limiar se
#: conhecido, senão %FCmax estimado (PC-4).
_DEFAULT_MODEL = 5


@dataclass
class SessionResult:
    """Derivadas de uma sessão — tudo que o worker persiste e versiona."""

    activity_id: str
    methodology_version: str
    confidence: float
    computed_at: str
    raw_sha256: str | None
    series: CanonicalSeries | None
    layer1: layer1_module.Layer1Result | None
    load: SessionLoad
    time_in_zone: dict[int, float] = field(default_factory=dict)
    quality_notes: dict = field(default_factory=dict)

    @property
    def low_confidence(self) -> bool:
        """< 0.6: UI sinaliza e a recalibração ignora a sessão (RNF-7.1)."""
        return self.confidence < LOW_CONFIDENCE_THRESHOLD


def _default_zones(profile: AthleteProfile) -> tuple[str, list[ZoneBoundary]] | None:
    if profile.lthr:
        anchor = "pct_lthr"
    elif profile.hr_max:
        anchor = "pct_hrmax"
    else:
        return None
    return anchor, resolve_boundaries(_DEFAULT_MODEL, anchor, profile)


def process_activity(
    raw: bytes,
    profile: AthleteProfile,
    *,
    activity_id: str,
    fmt: str | None = None,
    zone_anchor: str | None = None,
    zone_boundaries: list[ZoneBoundary] | None = None,
    srpe: float | None = None,
) -> SessionResult:
    """Processa uma atividade de ponta a ponta (estágios do doc 04 §2).

    `zone_anchor`/`zone_boundaries` vêm da `zone_config` vigente do atleta;
    sem ela o motor resolve o padrão PC-4 a partir do perfil.
    """
    series = parse(raw, fmt=fmt)
    cleaned, quality = clean(series)
    layer1_module.enrich(cleaned)
    layer1 = layer1_module.compute(cleaned)

    tiz: dict[int, float] = {}
    if zone_boundaries is None:
        default = _default_zones(profile)
        if default is not None:
            zone_anchor, zone_boundaries = default
    if zone_boundaries:
        tiz = time_in_zone(cleaned, zone_boundaries, anchor=zone_anchor or "pct_lthr")

    load = session_load(
        cleaned,
        profile,
        avg_hr=layer1.avg_hr,
        moving_s=layer1.moving_s,
        elapsed_s=layer1.elapsed_s,
        gap_avg_s_per_km=layer1.gap_avg_s_per_km,
        srpe=srpe,
    )
    return SessionResult(
        activity_id=activity_id,
        methodology_version=METHODOLOGY_VERSION,
        confidence=quality.confidence,
        computed_at=datetime.now(timezone.utc).isoformat(),
        raw_sha256=hashlib.sha256(raw).hexdigest(),
        series=cleaned,
        layer1=layer1,
        load=load,
        time_in_zone=tiz,
        quality_notes=quality.notes,
    )


def process_manual_activity(
    *,
    activity_id: str,
    duration_s: float,
    srpe: float,
    distance_m: float | None = None,
) -> SessionResult:
    """Registro manual (RF-2.5): só Camada 4; a carga é sRPE × minutos.

    Entra no mesmo pipeline com source='manual' — o iniciante sem sensor
    participa do modelo de carga desde o primeiro dia.
    """
    layer1 = layer1_module.Layer1Result(
        distance_m=distance_m,
        elapsed_s=duration_s,
        moving_s=duration_s,
        avg_pace_s_per_km=(
            round(duration_s / (distance_m / 1000.0), 1) if distance_m else None
        ),
    )
    return SessionResult(
        activity_id=activity_id,
        methodology_version=METHODOLOGY_VERSION,
        confidence=1.0,  # o dado declarado é o dado; a limitação é de camada, não de qualidade
        computed_at=datetime.now(timezone.utc).isoformat(),
        raw_sha256=None,
        series=None,
        layer1=layer1,
        load=SessionLoad(srpe_load=srpe_load(srpe, duration_s)),
    )
