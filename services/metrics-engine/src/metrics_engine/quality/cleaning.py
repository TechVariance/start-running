"""Qualidade do dado — pré-requisito de qualquer cálculo (PC-5).

Regras (docs/arquitetura/04 §2.1):
- FC: fonte chest_strap confiança base 1.0; optical 0.8 ajustada por variância.
  Spikes fora de [30, 230] bpm ou salto > 20 bpm/s -> remove + interpola <= 5 s.
- Gaps: <= 10 s interpola; > 10 s marca segmento e exclui das médias por zona.
- GPS: velocidade implícita > 12 m/s ou jitter parado -> mediana móvel + flag;
  distância oficial prioriza o campo `distance` do dispositivo.
- Nenhuma métrica derivada é exibida sobre dado não validado sem sinalização
  de baixa confiança (confidence < 0.6 -> UI sinaliza; motor de treino não
  recalibra limiares com a sessão).
"""


class QualityFlag:
    """Bitmask por ponto — espelha QualityFlag de @startrunning/domain."""

    NONE = 0
    SPIKE_REMOVED = 1 << 0
    INTERPOLATED = 1 << 1
    GAP = 1 << 2
    GPS_DRIFT = 1 << 3


def clean(series):  # -> (series_limpa, confidence: float, notes: dict)
    """Valida e limpa a série canônica, devolvendo confiança agregada."""
    raise NotImplementedError("Implementação na Fase 1 do roadmap")
