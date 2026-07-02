"""Motor de zonas configurável (PC-4 / RF-3.9).

Modelos de 3, 5 ou 7 zonas; âncoras: %FCmax, Karvonen %FCR, %LTHR,
%pace de limiar, %potência crítica. Padrão para atleta com limiar
conhecido: por limiar, não %FCmax. Sem limiar, inicia em %FCmax estimado
e migra quando a recalibração (RF-3.10) produzir limiar confiável.

Mudar a configuração de zonas recomputa apenas tempo-em-zona (barato),
sem re-parse do bruto.
"""


def resolve_boundaries(model: int, anchor: str, profile) -> list:
    """Deriva os limites das zonas a partir da âncora e do perfil."""
    raise NotImplementedError("Implementação na Fase 1 do roadmap")


def time_in_zone(series, boundaries) -> dict:
    """Segundos em cada zona — alimenta a ZoneBar (DS §7.5)."""
    raise NotImplementedError("Implementação na Fase 1 do roadmap")
