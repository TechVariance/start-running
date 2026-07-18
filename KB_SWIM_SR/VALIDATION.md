# Relatório de validação

Data: 18 de julho de 2026  
Versão: 1.0.0

## Resultado

**APROVADO** para indexação e testes de recuperação.

## Verificações executadas

- 25 arquivos YAML analisados sem erro sintático.
- Todos os 25 registros contêm os campos obrigatórios do schema.
- IDs `SW-001` a `SW-025` são únicos.
- 25 fontes JSONL analisadas sem erro.
- Todas as referências `source_ids` resolvem no catálogo.
- 15 casos do golden set analisados sem erro JSON.
- Políticas de segurança, resposta e propriedade intelectual presentes.
- Fonte-mestra, módulos, glossário, estratégia de recuperação e manifesto presentes.
- Nenhum artigo integral, tabela ou figura protegida foi incorporado.

## Limites conhecidos

- Validação estrutural não substitui revisão por especialista em ciência do esporte ou medicina.
- Parte da evidência é indireta, observacional, de elite ou específica de crawl; isso está marcado nos registros.
- URLs públicas podem mudar; verificar disponibilidade na revisão semestral.
- O golden set mede comportamento esperado, mas ainda precisa ser executado no agente e no índice escolhidos.

## Critério para produção

Antes de uso público, executar o golden set contra o pipeline real, inspecionar citações e confirmar que as políticas entram no contexto fixo.

