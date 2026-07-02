"""Motor de métricas canônico do Start Running.

Núcleo do diferencial competitivo (PC-1): ingere a série temporal bruta e
calcula TODAS as métricas derivadas com uma única metodologia, comparável
entre marcas de dispositivo. Scores proprietários de fabricante nunca são
base de cálculo (PC-2).

Toda derivada produzida aqui carrega METHODOLOGY_VERSION e um nível de
confiança (RNF-7.1, RNF-9.2). Mudou fórmula => bump de versão + backfill.
"""

METHODOLOGY_VERSION = "engine-2026.07"
