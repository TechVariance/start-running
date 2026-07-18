# Chunking e recuperação

## Unidades

- Um arquivo `BM-xxx.yaml` por chunk.
- Módulos divididos por subtítulo, preservando título e público.
- Políticas no contexto fixo e também indexadas.
- Fonte-mestra somente para auditoria ou fallback.

## Filtros

`goals`, `profiles`, `topics`, `outcomes`, `evidence_level`, `confidence`, `applicability`, `status`, `review_due` e `source_ids`.

## Ranking

Priorizar status ativo, aplicação direta, nível A/B, confiança alta/moderada e revisão vigente. Penalizar extrapolação indireta. Recuperar uma limitação ou fonte divergente quando a confiança for baixa.

## Contexto

Recuperar 3–6 evidências e no máximo dois módulos. Incluir política de segurança para menores, sintomas, lesão, nutrição, suplemento, falha, teste máximo ou BFR.

