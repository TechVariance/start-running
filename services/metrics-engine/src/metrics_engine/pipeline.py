"""Orquestração do pipeline por sessão.

Fluxo (docs/arquitetura/04): job `activity.received` -> baixa bruto do S3 ->
parse -> qualidade (PC-5) -> Camada 1 -> carga -> persiste derivadas
versionadas -> emite `activity.processed` / `load.updated`.

Idempotência (RNF-2.3): a identidade do bruto é o sha256; derivadas fazem
upsert por (activity_id, methodology_version). Reprocessar nunca duplica.

Orçamento de latência: parse + qualidade + Camada 1 + carga <= 30 s para um
treino típico de 1 h a 1 Hz (RNF-1.1: leitura pronta em <= 2 min).
"""

from dataclasses import dataclass

from . import METHODOLOGY_VERSION


@dataclass
class SessionResult:
    activity_id: str
    methodology_version: str
    confidence: float


def process_activity(activity_id: str, raw_s3_key: str) -> SessionResult:
    """Processa uma atividade de ponta a ponta.

    Estágios (cada um em seu módulo):
      1. parsers.parse(raw)        -> série canônica (FIT > TCX > GPX)
      2. quality.clean(series)     -> flags por ponto + confiança agregada
      3. metrics.layer1(series)    -> splits, tempo-em-zona, GAP, elevação
      4. metrics.load(series)      -> TRIMP/rTSS/hrTSS -> daily_load
      5. persistência versionada   -> activity_metrics(is_current=True)

    Fase 2 acrescenta metrics.efficiency (EF/decoupling) e
    recalibration.thresholds; Fase 3 acrescenta metrics.dynamics (Camada 2).
    """
    raise NotImplementedError("Implementação na Fase 1 do roadmap")
