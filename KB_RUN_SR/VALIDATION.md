# Relatório de validação

**Data:** 18 de julho de 2026  
**Versão:** 1.1.0-rag

## Testes executados

- Documento-fonte preservado e comparado por SHA-256.
- `MANIFEST.json` analisado como JSON válido.
- 20 registros YAML analisados sem erro sintático.
- Campos obrigatórios, enumerações, IDs e correspondência arquivo/ID verificados.
- 26 linhas do catálogo de fontes analisadas como JSON válido e sem IDs duplicados.
- Todas as referências `source_ids` resolvidas no catálogo.
- 12 casos do golden set analisados como JSON válido.
- Todas as referências `expected_evidence_ids` resolvidas nos registros de evidência.
- Caminhos canônicos declarados no manifesto verificados.

## Resultado

Nenhum erro estrutural encontrado. O pacote está pronto para protótipo RAG. Antes de uso em produção, recomenda-se executar o golden set no agente integrado, verificar licenças específicas das fontes e instituir revisão científica humana periódica.

## Integridade da fonte-mestra

`f4288874081f6b1d794eee7d7377ba56f03bb3226df74c28127c135c4308a25f`

