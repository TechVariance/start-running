"""Carga interna e séries de carga (RF-3.3 a RF-3.5).

Por sessão, a melhor carga disponível (degradação elegante):
  hrTSS (FC + LTHR) > rTSS (pace + limiar) > TRIMP (FCmax/FCrep) >
  sRPE (RPE x minutos — único caminho no registro manual, RF-2.5).

Séries diárias:
  CTL: EWMA ~42 d ("fitness") | ATL: EWMA ~7 d (fadiga) | TSB = CTL - ATL
  ACWR: janela 7 d / 28 d; fora de [0.8, 1.3] emite alerta (RF-8.2)
"""

ACWR_SAFE_MIN = 0.8
ACWR_SAFE_MAX = 1.3


def session_load(series, thresholds):  # -> dict(trimp, rtss, hrtss, srpe_load)
    raise NotImplementedError("Implementação na Fase 1 do roadmap")


def update_daily_load(athlete_id: str, day):  # -> DailyLoad
    """Recomputação determinística a partir das sessões do período —
    reprocessar nunca duplica (RNF-2.3)."""
    raise NotImplementedError("Implementação na Fase 1 do roadmap")
