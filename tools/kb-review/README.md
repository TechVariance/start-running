# Formulário de revisão técnica

Ferramenta para um técnico de corrida revisar o conteúdo que alimenta o Coach de IA,
sem precisar entender nada de como a base é construída.

## Premissa de projeto

O revisor tem muita experiência em treino de corrida e nenhuma em construção de base de
conhecimento. Então a tela **não mostra** identificador de registro, YAML, nível A/B/C/D,
`source_ids`, manifesto nem política de recuperação. Ele vê uma afirmação em português e
responde se diria aquilo a um aluno. A tradução entre a linguagem dele e a estrutura da
base acontece dentro do `app.js` e no relatório de saída.

Duas decisões que vieram junto:

- **Verificação de licença das fontes saiu do escopo dele.** Julgar se um artigo é CC BY-NC-ND
  não é competência de treinador, e forçar isso produziria resposta por adivinhação. As 47
  fontes com licença pendente continuam sendo tarefa da Variance.
- **Toda pergunta tem a saída "fora da minha área".** O perfil é corrida; sem essa saída, as
  25 fichas de musculação virariam palpite. O relatório separa esses itens para roteamento
  a outro especialista.

## Arquivos

| Arquivo | Papel |
|---|---|
| `build.ps1` | Lê as KBs e gera a página. É o único builder. |
| `shell.html` | Esqueleto, com os marcadores `/*__CSS__*/`, `/*__DATA__*/` e `/*__JS__*/`. |
| `app.css` | Estilo. Tokens herdados de `Design System - Start Running.md`. |
| `app.js` | Percurso, filas, tradução da estrutura e geração do relatório. |
| `../kb-review-form.html` | **Gerado.** Não editar à mão. |

## Regerar

```powershell
powershell -ExecutionPolicy Bypass -File tools\kb-review\build.ps1
```

Rode sempre que algo mudar em `KB_RUN_SR/` ou `KB_MUSC_SR/`. A build também confere as KBs
e reclama de referência quebrada entre afirmação, fonte e caso de teste, e de contagem
divergente no `MANIFEST.json`.

Está em PowerShell, e não em JS como o resto do projeto, porque é tarefa de operação rodada
em máquina Windows: regenera sem depender de Bun ou Node instalado.

`build.ps1` precisa continuar salvo em **UTF-8 com BOM**. O PowerShell 5.1 lê `.ps1` sem BOM
como ANSI e quebra nos acentos.

## O percurso do revisor

1. **Comece aqui** — o que é, quanto tempo leva, e quando usar "fora da minha área".
2. **Quem é você** — nome, formação, registro, conflito de interesse.
3. **Corrida** — 20 afirmações, uma por vez.
4. **Musculação** — 25 afirmações, com atalho para marcar tudo como fora da área.
5. **Regras do app** — 16 documentos: segurança, linguagem, resumos por prova e por
   objetivo, e vocabulário. Ficam de fora propriedade intelectual e política de recuperação.
6. **Perguntas de aluno** — 27 casos de teste, mais as perguntas que ele propõe.
7. **O que falta** — lacunas, observação sobre estudos e parecer final.
8. **Entregar** — dois blocos para copiar e mandar por e-mail.

## Como as respostas voltam

Não existe envio automático, e não é escolha de design: a página publicada roda sob uma CSP
que bloqueia qualquer requisição de rede. As capacidades de runtime liberadas nesta conta são
só `downloads` e `mcp`, e nenhuma delas dá estado compartilhado. O único caminho para fora é o
próprio revisor entregar o arquivo.

A página declara `capabilities: {downloads: true}`. Com isso:

- **Guardar em arquivo** (barra superior) salva a cópia de segurança a qualquer momento.
- **Etapa 8** salva `revisao-<nome>.md` e `copia-de-seguranca-<nome>.json`, que ele anexa a um
  e-mail.
- **Retomar de um arquivo** recarrega o JSON por seletor de arquivo, que é leitura local e
  funciona dentro do sandbox.

O salvamento passa por uma confirmação que o visualizador pode recusar, e a capacidade pode não
estar disponível na janela dele. Por isso `claude.use("downloads")` é tratado como podendo
retornar `null`: nesse caso os botões de salvar somem e os blocos de copiar continuam sendo o
caminho. Os blocos de copiar ficam visíveis nos dois cenários.

Se um dia a coleta precisar ser automática, o caminho é outro: uma rota dentro do próprio app
gravando no Supabase que o projeto já usa. Isso exige mudança de código, migração e um acesso
para o revisor.

## O que volta para a equipe

Um **relatório em markdown** organizado por urgência, com o que foi sinalizado como risco
primeiro, depois discordâncias, ajustes de redação e itens fora da competência do revisor.
Mais uma **cópia de segurança em JSON** que reabre o formulário no estado em que ele parou.

O revisor **não** produz arquivo de registro pronto. Ele escreve em prosa e a conversão para
a estrutura da base é trabalho da equipe. Isso é intencional: pedir que ele preenchesse campos
estruturados foi o que tornou a primeira versão inutilizável para o perfil dele.

## Depois de aplicar a revisão

1. Converta as decisões em alteração nos arquivos das KBs.
2. Atualize `MANIFEST.json` (`version`, contagens, `next_review_due`) e `VALIDATION.md`.
3. Replique o que mudou em `supabase/functions/coach-chat/kb*.ts` — hoje a KB é copiada à mão
   para dentro da edge function, então mudança na base **não** chega ao Coach sozinha.
4. Rode os casos de teste atualizados contra o agente antes de fechar a revisão.
