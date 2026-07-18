# Política de chunking e recuperação

## Unidades de indexação

1. Cada arquivo `evidence/BC-xxx.yaml` é um chunk indivisível.
2. Cada módulo de distância é dividido por subtítulo, preservando o cabeçalho da distância.
3. Políticas são indexadas separadamente e também inseridas no contexto fixo.
4. O documento-fonte serve para auditoria e fallback, não como primeira unidade de recuperação.

## Metadados de filtro

`distances`, `profiles`, `topics`, `outcomes`, `evidence_level`, `confidence`, `applicability`, `status`, `review_due` e `source_ids`.

## Estratégia híbrida

- Busca lexical para IDs, siglas e termos exatos.
- Busca semântica para perguntas naturais.
- Filtro obrigatório por status `active`.
- Boost para aplicação direta, nível A/B, confiança alta/moderada e revisão vigente.
- Penalização para extrapolação indireta e fonte desatualizada.

## Montagem de contexto

- Recuperar 3–6 registros de evidência.
- Incluir no máximo dois módulos de distância.
- Deduplicar registros com a mesma conclusão e fontes.
- Se a confiança for baixa ou houver conflito, recuperar também uma fonte divergente ou de limitação.
- Sempre incluir política de segurança quando a consulta envolver lesão, sintomas, menores, nutrição, hidratação ou calor.

## Resposta rastreável

O agente deve emitir `evidence_ids` e links de fonte no texto ou em metadados de saída. Uma recomendação sem registro recuperado deve ser rotulada como prática geral ou evidência insuficiente.

