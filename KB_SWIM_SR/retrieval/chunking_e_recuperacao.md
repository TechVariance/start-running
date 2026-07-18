# Estratégia de chunking e recuperação

## Unidades

- Cada `evidence/SW-xxx.yaml` é um chunk atômico.
- Cada seção de segundo nível dos módulos é um chunk de síntese.
- Políticas entram sempre no contexto; não dependem de busca semântica.

## Metadados para filtro

`events`, `strokes`, `profiles`, `topics`, `outcomes`, `evidence_level`, `confidence`, `applicability`, `status`, `last_reviewed`, `review_due`.

## Consulta

1. Detectar intenção: técnica, periodização, prova, recuperação, dor, segurança ou competição.
2. Aplicar filtros duros de status, faixa etária e segurança.
3. Dar prioridade a aplicabilidade direta e níveis A/B.
4. Recuperar diversidade: pelo menos um registro de benefício, um de implementação e um de limitação/segurança quando aplicável.
5. Deduplicar claims semanticamente próximos.
6. Não mesclar prescrições incompatíveis sem explicitar a diferença de população ou contexto.

## Atualização

Revisão editorial semestral. Fontes novas não alteram a base automaticamente: exigem triagem de método, população, comparador, desfecho, aplicabilidade e coerência com a fonte-mestra.

