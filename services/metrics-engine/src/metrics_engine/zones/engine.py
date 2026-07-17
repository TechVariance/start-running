"""Motor de zonas configurável (PC-4 / RF-3.9).

Modelos de 3, 5 ou 7 zonas; âncoras: %FCmax, Karvonen %FCR, %LTHR,
%pace de limiar, %potência crítica. Padrão para atleta com limiar
conhecido: por limiar, não %FCmax. Sem limiar, inicia em %FCmax estimado
e migra quando a recalibração (RF-3.10) produzir limiar confiável.

Mudar a configuração de zonas recomputa apenas tempo-em-zona (barato),
sem re-parse do bruto.
"""

from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from ..models import AthleteProfile, CanonicalSeries, QualityFlag

#: Gaps de gravação são excluídos das médias por zona (doc 04 §2.1 regra 3);
#: dt por amostra é limitado a este teto ao acumular tempo-em-zona.
MAX_SAMPLE_DT_S = 10.0


@dataclass(frozen=True)
class ZoneBoundary:
    """Espelha `ZoneBoundary` de @startrunning/domain.

    `lower`/`upper` na unidade da âncora (bpm, s/km ou W). Para âncoras de
    pace a intensidade cresce quando o valor cai, então `lower` é o pace mais
    LENTO da zona (valor maior) e `upper` o mais rápido; `upper` aberto na
    última zona.
    """

    zone: int
    label: str
    lower: float
    upper: float | None = None


# Frações da âncora no início de cada zona, por modelo. Para %LTHR/%pace/%CP a
# referência é o limiar (zona de limiar começa em 1.0); para %FCmax/Karvonen a
# referência é o teto fisiológico.
_THRESHOLD_FRACTIONS: dict[int, list[float]] = {
    3: [0.55, 0.85, 1.0],
    5: [0.55, 0.81, 0.90, 0.96, 1.03],
    7: [0.55, 0.81, 0.90, 0.94, 1.0, 1.03, 1.10],
}
_MAX_FRACTIONS: dict[int, list[float]] = {
    3: [0.50, 0.70, 0.85],
    5: [0.50, 0.60, 0.70, 0.80, 0.90],
    7: [0.50, 0.60, 0.70, 0.77, 0.84, 0.90, 0.95],
}

_LABELS: dict[int, list[str]] = {
    3: ["Fácil", "Moderado", "Forte"],
    5: ["Recuperação", "Endurance", "Tempo", "Limiar", "VO2max"],
    7: ["Recuperação", "Endurance", "Tempo", "Sweet Spot", "Limiar", "VO2max", "Anaeróbico"],
}

_HR_ANCHORS = {"pct_hrmax", "karvonen_pct_hrr", "pct_lthr"}
#: Âncoras de pace: intensidade cresce quando o valor cai (semântica invertida).
_PACE_ANCHORS = {"pct_threshold_pace", "pct_css"}
_POWER_ANCHORS = {"pct_critical_power"}


def _anchor_points(anchor: str, profile: AthleteProfile) -> list[tuple[str, float | None]]:
    """(nome do campo exigido, valor) para mensagens de erro claras."""
    if anchor == "pct_hrmax":
        return [("hr_max", profile.hr_max)]
    if anchor == "karvonen_pct_hrr":
        return [("hr_max", profile.hr_max), ("hr_rest", profile.hr_rest)]
    if anchor == "pct_lthr":
        return [("lthr", profile.lthr)]
    if anchor == "pct_threshold_pace":
        return [("threshold_pace_s_per_km", profile.threshold_pace_s_per_km)]
    if anchor == "pct_css":
        return [("css_s_per_100m", profile.css_s_per_100m)]
    if anchor == "pct_critical_power":
        return [("critical_power_w", profile.critical_power_w)]
    raise ValueError(f"Âncora de zona desconhecida: {anchor!r}")


def resolve_boundaries(model: int, anchor: str, profile: AthleteProfile) -> list[ZoneBoundary]:
    """Deriva os limites das zonas a partir da âncora e do perfil (Camada 0)."""
    if model not in _LABELS:
        raise ValueError(f"Modelo de zonas deve ser 3, 5 ou 7; recebi {model}")
    required = _anchor_points(anchor, profile)
    missing = [name for name, value in required if not value]
    if missing:
        raise ValueError(
            f"Âncora {anchor!r} exige {', '.join(missing)} no perfil do atleta"
        )

    fractions = (
        _MAX_FRACTIONS[model]
        if anchor in ("pct_hrmax", "karvonen_pct_hrr")
        else _THRESHOLD_FRACTIONS[model]
    )
    labels = _LABELS[model]

    def scale(fraction: float) -> float:
        if anchor == "pct_hrmax":
            return profile.hr_max * fraction
        if anchor == "karvonen_pct_hrr":
            return profile.hr_rest + (profile.hr_max - profile.hr_rest) * fraction
        if anchor == "pct_lthr":
            return profile.lthr * fraction
        if anchor == "pct_threshold_pace":
            # Intensidade em fração da VELOCIDADE de limiar; pace = limiar/fração.
            return profile.threshold_pace_s_per_km / fraction
        if anchor == "pct_css":
            return profile.css_s_per_100m / fraction
        return profile.critical_power_w * fraction

    edges = [round(scale(f), 1) for f in fractions]
    boundaries: list[ZoneBoundary] = []
    for i, label in enumerate(labels):
        upper = edges[i + 1] if i + 1 < len(edges) else None
        boundaries.append(ZoneBoundary(zone=i + 1, label=label, lower=edges[i], upper=upper))
    return boundaries


def _zone_channel(anchor: str) -> str:
    if anchor in _HR_ANCHORS:
        return "hr"
    if anchor == "pct_css":
        return "pace_s_per_100m"  # canal canônico do nado (metrics/swim.py)
    if anchor in _PACE_ANCHORS:
        return "pace_s_per_km"
    if anchor in _POWER_ANCHORS:
        return "power_w"
    raise ValueError(f"Âncora de zona desconhecida: {anchor!r}")


def _in_zone(value: float, boundary: ZoneBoundary, descending: bool) -> bool:
    if descending:  # pace: intensidade cresce quando o valor cai
        return value <= boundary.lower and (boundary.upper is None or value > boundary.upper)
    return value >= boundary.lower and (boundary.upper is None or value < boundary.upper)


def time_in_zone(
    series: CanonicalSeries,
    boundaries: list[ZoneBoundary],
    anchor: str = "pct_lthr",
) -> dict[int, float]:
    """Segundos em cada zona — alimenta a ZoneBar (DS §7.5).

    Amostras marcadas como gap (PC-5) são excluídas; dt por amostra é limitado
    a `MAX_SAMPLE_DT_S` para buracos não sinalizados não inflarem uma zona.
    """
    channel = _zone_channel(anchor)
    descending = anchor in _PACE_ANCHORS
    result: dict[int, float] = {b.zone: 0.0 for b in boundaries}
    df = series.df
    if channel not in df.columns or df[channel].isna().all():
        return result
    dt = df["elapsed_s"].diff().clip(upper=MAX_SAMPLE_DT_S)
    in_gap = (df["quality_flags"].astype(int) & int(QualityFlag.GAP)) != 0
    for i in range(1, len(df)):
        if in_gap.iloc[i]:
            continue
        value = df[channel].iloc[i]
        if pd.isna(value):
            continue
        for boundary in boundaries:
            if _in_zone(float(value), boundary, descending):
                result[boundary.zone] += float(dt.iloc[i])
                break
    return {zone: round(seconds, 1) for zone, seconds in result.items()}
