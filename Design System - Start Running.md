# Design System — Start Running

**Marca:** Start Running · *powered by Variance*
**Direção visual:** Bold & Energético — performance, movimento, alto contraste
**Versão:** 1.0 · 2 de julho de 2026
**Companion visual:** `Design System - Start Running.html` (living style guide interativo)

---

## 1. Fundamentos de marca

### 1.1 Essência

Start Running é sobre **momentum** — o impulso de dar o próximo passo e a energia de evoluir de verdade. A marca fala com o corredor competitivo (persona Brunno) e com quem está começando, sempre de forma **direta, prática e motivadora**. Nada de jargão gratuito; a profundidade fisiológica existe, mas é traduzida com clareza.

### 1.2 Personalidade

| Atributo | É | Não é |
|---|---|---|
| Energético | vibrante, com impulso | agitado, poluído |
| Direto | claro, objetivo, prático | seco, frio |
| Confiável | preciso, baseado em dado | pretensioso, hermético |
| Motivador | encoraja o próximo passo | agressivo, culpabilizador |

### 1.3 Conceito de logo

Wordmark **START RUNNING** em tipografia condensada pesada, com um **mark de movimento** — três traços/chevrons acelerando para a frente (`›››`) que remetem a velocidade e progressão. O mark pode ser usado isolado como app icon.

**Assinatura "powered by Variance":** o lockup acompanha a marca em contextos institucionais (rodapé, splash, materiais). O badge contém o **logo oficial da Variance** — o mark de mandala de pontos (rosa #FF3A5E) + o wordmark "Var**ia**nce" (com "ia" em rosa, demais letras em branco). Regra de aplicação: o logo Variance vive dentro de um **chip preto arredondado** (fundo #000, raio 8–9px), o que garante legibilidade sobre qualquer fundo (claro ou escuro) e preserva a leitura branco+rosa do wordmark. Start Running é sempre o protagonista visual; Variance aparece como endosso discreto, menor, precedido de "powered by" em caixa alta leve.

> O living style guide já usa o **arquivo oficial** da Variance (`variance_logo_branco_rosa_sem_fundo.png`, fundo transparente, branco+rosa), referenciado dentro do chip preto. A cor do logo (#FF3A5E) coincide propositalmente com a primária Ignite, unificando as duas marcas. Para telas escaláveis (splash, alta resolução), prefira a versão **SVG** do logo quando disponível. Mantenha o arquivo do logo na mesma pasta do `.html` para o caminho relativo resolver.

**Área de proteção:** margem mínima ao redor do logo = altura do "S" do wordmark. **Tamanho mínimo:** wordmark 120px de largura em tela; mark isolado 24px.

**Não fazer:** distorcer, rotacionar, aplicar gradiente não-oficial, trocar as cores da marca, colocar o wordmark sobre foto de baixo contraste sem overlay.

---

## 2. Cor

A paleta é **bold**: uma cor de marca quente e enérgica (Ignite), um azul elétrico de suporte (Pulse), um acento de alta energia (Volt) e uma base neutra de alto contraste (Ink + neutros).

### 2.1 Cores de marca

| Token | Hex | Uso |
|---|---|---|
| `--ignite` (primária) | **#FF3A5E** | CTAs, marca, estados "go", destaques de ação — alinhada ao rosa da marca Variance |
| `--ignite-600` | #E82550 | hover/press da primária |
| `--ignite-400` | #FF6E85 | ícones/detalhes sobre escuro |
| `--ignite-100` | #FFE0E6 | tint de fundo, chips |
| `--pulse` (secundária) | **#1E5BFF** | links, esforço/pace, info, seleção |
| `--pulse-600` | #1246D6 | hover/press |
| `--pulse-100` | #DEE8FF | tint de fundo |
| `--volt` (acento) | **#D6FF3D** | PRs, conquistas, "energia", realces pontuais |
| `--volt-600` | #A8CC00 | volt como texto sobre fundo claro (contraste) |

> **Regra de acento:** Volt é tempero, não base. Usar em no máximo ~10% de uma tela, para picos de energia (PR batido, meta atingida, streak).

### 2.2 Neutros (base Ink)

| Token | Hex |
|---|---|
| `--n0` | #FFFFFF |
| `--n50` | #F5F7FA |
| `--n100` | #E9EEF4 |
| `--n200` | #D6DEE8 |
| `--n300` | #B4C0CE |
| `--n400` | #8A99AB |
| `--n500` | #64748B |
| `--n600` | #48566A |
| `--n700` | #303C4D |
| `--n800` | #1B2530 |
| `--n900 / --ink` | #0B0F14 |

### 2.3 Cores semânticas

| Token | Hex | Significado |
|---|---|---|
| `--success` | #17B26A | no plano / prontidão boa / on track |
| `--warning` | #F5A524 | atenção / carga subindo |
| `--danger` | #E02749 | risco de lesão / erro / fora da zona segura |
| `--info` | #1E5BFF | informação neutra (= Pulse) |

> **Nota:** com a primária alinhada ao rosa Variance (#FF3A5E), `--danger` é um **crimson mais profundo e saturado** (#E02749) — próximo em matiz, mas distinguível por escuridão. Para nunca confundir "ação da marca" com "alerta", todo estado de perigo é **sempre acompanhado de ícone + rótulo** (nunca só cor), e ações destrutivas usam texto/ícone de alerta explícito.

### 2.4 Sistema de zonas de treino (base 5 zonas)

Cor é semântica de esforço. O modelo é **configurável (3/5/7 zonas)** conforme PC-4 da especificação; a base de 5 zonas:

| Zona | Nome | Hex |
|---|---|---|
| Z1 | Recuperação | #3FA9F5 |
| Z2 | Endurance | #17B26A |
| Z3 | Tempo | #F5C518 |
| Z4 | Limiar | #FF7A1F |
| Z5 | Anaeróbico/Máx | #E02749 |

Sequência frio→quente para leitura intuitiva de intensidade. Cada zona tem um par de texto acessível para rótulos.

### 2.5 Modo claro e escuro

- **Claro:** superfícies `--n0`/`--n50`, texto `--ink`, bordas `--n100`.
- **Escuro (data-first):** superfícies `--ink`/`--n800`, texto `--n50`, acentos Ignite/Volt ganham brilho. O modo escuro é o "palco" natural para dashboards de dado.

### 2.6 Contraste e acessibilidade de cor

- Texto normal ≥ **4,5:1**; texto grande/UI ≥ **3:1** (WCAG AA).
- Ignite (#FF3A5E) sobre branco: usar para elementos grandes/ícones; para texto pequeno preferir `--ignite-600` ou texto branco sobre Ignite.
- Nunca comunicar estado **só** por cor: acompanhar com ícone, rótulo ou padrão (importante para daltônicos e para o sistema de zonas).

---

## 3. Tipografia

Dupla atlética: um display condensado forte + um sans neutro e legível para dado.

| Papel | Família | Pesos | Observação |
|---|---|---|---|
| Display / Números grandes | **Archivo** (variável) | 700–900 | headlines, métricas em destaque; usar `font-variant-numeric: tabular-nums` |
| Texto / UI | **Inter** | 400–700 | corpo, rótulos, dados tabulares |

Fallback: `system-ui, -apple-system, Segoe UI, Roboto, sans-serif`.

### 3.1 Escala tipográfica (base 16px)

| Token | Tamanho/linha | Família / peso | Uso |
|---|---|---|---|
| Display XL | 56 / 60 | Archivo 800 | número-herói (pace, tempo de prova) |
| Display L | 44 / 48 | Archivo 800 | destaque de tela |
| H1 | 32 / 38 | Archivo 700 | título de tela |
| H2 | 26 / 32 | Archivo 700 | seção |
| H3 | 21 / 28 | Archivo 700 | subseção / card title |
| Title | 18 / 24 | Inter 600 | títulos de item |
| Body L | 17 / 26 | Inter 400 | leitura confortável |
| Body | 15 / 22 | Inter 400 | padrão de UI |
| Small | 13 / 18 | Inter 400 | apoio |
| Label | 12 / 16 | Inter 600, UPPERCASE, tracking +0,06em | rótulos, chips, eixos |

**Regras:** números de métrica sempre com `tabular-nums` para não "dançar"; máximo de duas famílias; evitar mais de 3 tamanhos por tela; unidades (km, min/km, bpm) em peso/tom mais leve que o número.

---

## 4. Espaçamento, grid e layout

**Base 4px.** Escala: `2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80`.

- **Grid mobile-first**, baseline 390px; margens laterais de 20px (`space-5`).
- **Gutter** entre cards: 12–16px. **Padding interno de card:** 16–20px.
- Ritmo vertical em múltiplos de 4/8. Toque mínimo: **44×44px**.

---

## 5. Forma: raio e elevação

**Raio:**

| Token | Valor | Uso |
|---|---|---|
| `--r-sm` | 8px | chips, inputs |
| `--r-md` | 12px | cards, campos |
| `--r-lg` | 16px | cards grandes, modais |
| `--r-xl` | 24px | folhas/bottom sheets |
| `--r-pill` | 999px | botões, tabs, badges |

Botões em **pill** reforçam a sensação atlética/dinâmica.

**Elevação:**

| Token | Sombra |
|---|---|
| `--e1` | 0 1px 2px rgba(11,15,20,.06) |
| `--e2` | 0 4px 12px rgba(11,15,20,.08) |
| `--e3` | 0 12px 32px rgba(11,15,20,.14) |
| `--glow-ignite` | 0 6px 24px rgba(255,58,94,.38) |

O **glow Ignite** é reservado para o CTA primário e momentos de energia — não usar em massa.

---

## 6. Iconografia

- Grade **24px**, traço **2px**, cantos e caps **arredondados** (linguagem amigável e atlética).
- Estilo **outline** por padrão; versão preenchida para estado ativo (ex.: tab selecionada).
- Ícones de métrica (FC, pace, carga, prontidão) formam um subconjunto consistente e reconhecível.
- Cor herda o texto; acento só quando o ícone é a informação (ex.: cor de zona).

---

## 7. Componentes

### 7.1 Botões

| Variante | Aparência | Uso |
|---|---|---|
| Primário | fundo Ignite, texto branco, pill, `--glow-ignite` no foco | ação principal (1 por tela) |
| Secundário | fundo Ink/`--n900` (ou branco no dark), texto contrastante | ação de apoio |
| Contorno | borda `--n200`, texto `--ink` | ação terciária |
| Ghost | sem fundo, texto Pulse | ações inline/links de ação |
| Perigo | fundo `--danger` | ações destrutivas |

Tamanhos: **sm** (36px), **md** (44px, padrão), **lg** (52px). Estados: default, hover, press (escurece 8–10%), focus (anel Pulse 2px + offset), disabled (opacidade 40%), loading (spinner). Ícone opcional à esquerda/direita.

### 7.2 Cards

- **Metric card:** rótulo (Label), número grande (Display/Archivo tabular), unidade leve, variação (▲▼ com cor semântica).
- **Workout card:** tipo de treino, chips de zona, distância/tempo, status planejado vs executado.
- **Plan card / calendário:** dia, treinos-chave, indicador de aderência.
- **Readiness card:** score consolidado com escala vermelho→verde.

Padrão: raio `--r-lg`, elevação `--e2`, padding 16–20px.

### 7.3 Chips e tags

Pill, altura 24–28px. Tipos: **zona** (cor da zona + rótulo), **status** (planejado/executado/perdido), **filtro** (selecionável). Sempre com rótulo textual além da cor.

### 7.4 Formulários

Campos raio `--r-md`, altura 48px, borda `--n200`, foco borda Pulse + anel. Label acima (Inter 600). Mensagens de erro em `--danger` com ícone. Toggles/checkboxes para dias disponíveis no onboarding. Suporte a unidades métricas/imperiais.

### 7.5 Barra de zonas / distribuição

Componente-assinatura: barra horizontal segmentada mostrando **tempo em cada zona** com as cores Z1–Z5, com legenda e percentuais. Usado na leitura do treino executado.

### 7.6 Data viz (crítico para o produto)

Diretrizes para gráficos de carga e evolução:

- **Carga (CTL/ATL/TSB):** CTL como área/linha calma (`--pulse`), ATL como linha (`--n500`), TSB como barra divergente (positivo verde/`--success`, negativo `--warning`/`--danger`).
- **ACWR:** faixa segura (~0,8–1,3) sombreada em `--success` translúcido; fora da faixa em `--warning`/`--danger`.
- **Splits/pace:** barras por km; usar cor de zona quando aplicável.
- **Regras:** eixos e rótulos em `--n500`/Label; grid discreto; números tabulares; nunca depender só de cor (usar rótulos/padrões); estados de "dado de baixa confiança" sinalizados (hachura/opacidade) conforme PC-5.

### 7.7 Navegação

- **Tab bar inferior** (mobile), 5 destinos máx: Hoje, Plano, Treinos, Coach, Perfil. Ícone outline → filled no ativo, rótulo Label, indicador Ignite.
- **Top app bar** com título de tela e ação contextual.
- **Bottom sheet** (raio `--r-xl`) para ações e detalhes.

### 7.8 Feedback e alertas

- **Toast** para confirmações rápidas.
- **Alert/banner** para prontidão e risco: info (Pulse), atenção (`--warning`), risco (`--danger`), sempre com ícone + texto + ação sugerida.
- **Estados vazios** motivadores ("Conecte seu relógio e comece a ler seus treinos de verdade").
- **Badges/conquistas:** acento Volt, reservados a marcos reais (PR, meta, streak).

---

## 8. Movimento

- **Durações:** rápida 120ms (micro), base 200ms (transições), lenta 320ms (folhas/telas).
- **Easing padrão (momentum):** `cubic-bezier(.2,.8,.2,1)`.
- **Celebração:** leve overshoot em conquistas (PR/meta) — energia, sem exagero.
- **Princípios:** movimento reforça direção/progresso (para frente/para cima); nunca bloqueia a leitura do dado; respeitar `prefers-reduced-motion`.

---

## 9. Voz e tom

Direto, prático e motivador — a voz do técnico que respeita o atleta.

- **Faz:** frases curtas, verbo no imperativo amistoso ("Bora pro treino de hoje"), explica o dado quando pedido, celebra evolução real.
- **Evita:** jargão despejado sem contexto, tom culpabilizador ("você falhou"), promessas vazias.
- **Exemplos:**
  - Prontidão baixa: *"Sua variabilidade caiu e o sono foi curto. Hoje pega leve — troquei o tiro por um rodado tranquilo."*
  - PR: *"Novo recorde nos 10k. Seu Efficiency Factor subiu — é evolução de verdade, não só volume."*
  - Risco de carga: *"Sua carga aguda passou da zona segura. Vamos segurar o volume esta semana pra te manter inteiro."*

---

## 10. Acessibilidade (resumo)

- Contraste AA (4,5:1 texto / 3:1 UI e gráficos).
- Estado nunca só por cor (ícone + rótulo + padrão).
- Alvos de toque ≥ 44px; foco visível (anel Pulse).
- Tipografia escalável; suporte a leitor de tela; `prefers-reduced-motion`.
- Sistema de zonas com rótulos e ordem consistentes para daltônicos.

---

## 11. Tokens — referência rápida (CSS)

```css
:root {
  /* Marca */
  --ignite:#FF3A5E; --ignite-600:#E82550; --ignite-400:#FF6E85; --ignite-100:#FFE0E6;
  --variance-pink:#FF3A5E;
  --pulse:#1E5BFF;  --pulse-600:#1246D6;  --pulse-100:#DEE8FF;
  --volt:#D6FF3D;   --volt-600:#A8CC00;
  /* Neutros */
  --n0:#FFFFFF; --n50:#F5F7FA; --n100:#E9EEF4; --n200:#D6DEE8; --n300:#B4C0CE;
  --n400:#8A99AB; --n500:#64748B; --n600:#48566A; --n700:#303C4D; --n800:#1B2530;
  --n900:#0B0F14; --ink:#0B0F14;
  /* Semânticas */
  --success:#17B26A; --warning:#F5A524; --danger:#E02749; --info:#1E5BFF;
  /* Zonas */
  --z1:#3FA9F5; --z2:#17B26A; --z3:#F5C518; --z4:#FF7A1F; --z5:#E02749;
  /* Raio */
  --r-sm:8px; --r-md:12px; --r-lg:16px; --r-xl:24px; --r-pill:999px;
  /* Elevação */
  --e1:0 1px 2px rgba(11,15,20,.06);
  --e2:0 4px 12px rgba(11,15,20,.08);
  --e3:0 12px 32px rgba(11,15,20,.14);
  --glow-ignite:0 6px 24px rgba(255,58,94,.38);
  /* Espaçamento (base 4) */
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px; --space-5:20px;
  --space-6:24px; --space-8:32px; --space-10:40px; --space-12:48px; --space-16:64px;
  /* Motion */
  --dur-fast:120ms; --dur-base:200ms; --dur-slow:320ms;
  --ease-momentum:cubic-bezier(.2,.8,.2,1);
  /* Tipografia */
  --font-display:"Archivo",system-ui,sans-serif;
  --font-text:"Inter",system-ui,sans-serif;
}
```

---

*Design system vivo. Componentes e tokens evoluem com o produto; toda mudança de token deve ser refletida simultaneamente neste `.md` e no living style guide `.html`.*
