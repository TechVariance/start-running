"""Camada 1 e carga da natação (Módulo 19, RF-19.3–19.5, ADR-0007).

Métricas de piscina são POR PISCINA (RN-19.1). O CSS é o limiar do nado —
mesma família do pace de limiar da corrida — e ancora zonas (`pct_css`) e
carga (sTSS), mantendo tudo na moeda comum do PC-6.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class SwimLength:
    """Uma piscina nadada — espelha `SwimLength` de @startrunning/domain."""

    index: int
    stroke: str  # 'free' | 'back' | 'breast' | 'fly' | 'mixed' | 'drill'
    duration_s: float
    strokes: int

    @property
    def swolf(self) -> float:
        """SWOLF = tempo (s) + braçadas — menor é melhor."""
        return self.duration_s + self.strokes


@dataclass
class SwimSummary:
    pool_length_m: float
    distance_m: float
    moving_s: float
    avg_pace_s_per_100m: float
    avg_swolf: float | None = None
    avg_strokes_per_length: float | None = None
    distance_per_stroke_m: float | None = None
    time_by_stroke: dict[str, float] = field(default_factory=dict)


def css_from_test(t400_s: float, t200_s: float) -> float:
    """CSS do teste de campo 400/200 (RF-19.4), em s/100 m.

    Velocidade crítica = 200 m ÷ (T400 − T200); CSS = 100 / velocidade.
    """
    if t400_s <= t200_s:
        raise ValueError("T400 deve ser maior que T200 — teste inválido")
    speed_m_s = 200.0 / (t400_s - t200_s)
    return round(100.0 / speed_m_s, 1)


def summarize(pool_length_m: float, lengths: list[SwimLength]) -> SwimSummary:
    """Agregados de sessão a partir das piscinas (mensagens `length` do FIT)."""
    if pool_length_m <= 0 or not lengths:
        raise ValueError("Sessão de piscina exige pool_length_m > 0 e ao menos 1 length")
    swim_lengths = [ln for ln in lengths if ln.stroke != "drill" or ln.strokes > 0]
    distance = pool_length_m * len(lengths)
    moving = sum(ln.duration_s for ln in lengths)
    total_strokes = sum(ln.strokes for ln in swim_lengths)
    time_by_stroke: dict[str, float] = {}
    for ln in lengths:
        time_by_stroke[ln.stroke] = time_by_stroke.get(ln.stroke, 0.0) + ln.duration_s
    return SwimSummary(
        pool_length_m=pool_length_m,
        distance_m=distance,
        moving_s=round(moving, 1),
        avg_pace_s_per_100m=round(moving / (distance / 100.0), 1),
        avg_swolf=round(sum(ln.swolf for ln in swim_lengths) / len(swim_lengths), 1)
        if swim_lengths
        else None,
        avg_strokes_per_length=round(total_strokes / len(swim_lengths), 1)
        if swim_lengths
        else None,
        distance_per_stroke_m=round(distance / total_strokes, 2) if total_strokes else None,
        time_by_stroke={k: round(v, 1) for k, v in time_by_stroke.items()},
    )


def stss(moving_s: float, avg_pace_s_per_100m: float, css_s_per_100m: float | None) -> float | None:
    """sTSS = horas × IF² × 100, IF = CSS/pace (razão de velocidades).

    1 h nadada no CSS = 100 — mesma escala do hrTSS/rTSS (moeda comum PC-6).
    """
    if not css_s_per_100m or not avg_pace_s_per_100m or moving_s <= 0:
        return None
    intensity = css_s_per_100m / avg_pace_s_per_100m
    return round(moving_s / 3600.0 * intensity**2 * 100.0, 1)
