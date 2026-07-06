# Glossário de termos e KPIs — Start Running

Referência única de vocabulário da plataforma: o que cada termo/índice significa, **como o Start Running calcula** (metodologia canônica versionada — `METHODOLOGY_VERSION engine-2026.07`) e **como as outras plataformas tratam** o mesmo conceito.

Princípios que regem este glossário (SRS §2):

- **PC-1/PC-2 — cálculo canônico:** toda métrica é calculada internamente a partir da série temporal bruta; scores proprietários de fabricante **nunca** são base de cálculo. Por isso as métricas do Start Running são comparáveis entre marcas de relógio.
- **PC-5 — qualidade antes do cálculo:** toda derivada carrega um nível de **confiança**; abaixo de 0,6 a UI sinaliza e a recalibração ignora a sessão.
- **RNF-9.2 — versionamento:** mudou a fórmula ⇒ nova versão de metodologia + recálculo retroativo. O histórico nunca é sobrescrito.

## Legenda do comparativo

| Símbolo | Significado |
|---|---|
| ✓ | usa o conceito com esse nome (ou nome próprio equivalente, indicado) |
| ≈ | tem equivalente **proprietário** (fórmula fechada, não comparável) |
| ✗ | não usa / não expõe ao usuário |

Plataformas comparadas: **TrainingPeaks (TP)**, **Strava**, **Garmin Connect**, **Polar Flow**, **COROS (EvoLab)**, **intervals.icu**, e — onde fizer sentido — Whoop, Oura e Apple Watch. O comparativo reflete o comportamento público dessas plataformas; nomes comerciais podem mudar.

---

## 1. Fundamentos do dado

### Série temporal bruta (raw series)
**O que é:** a gravação original do dispositivo, ponto a ponto (tipicamente 1 Hz): FC, posição, distância, altitude, cadência etc. No Start Running, o arquivo original (FIT/TCX/GPX) é imutável e é **a fonte da verdade** — toda métrica pode ser recalculada a partir dele (ADR-0006).
**Cálculo:** não se aplica (é o insumo).
**Comparativo:** TP ✓ · Strava ✓ · Garmin ✓ · Polar ✓ · COROS ✓ — todas armazenam a série, mas a maioria **não** permite recalcular o histórico quando muda a metodologia; o Start Running recalcula e versiona.

### Série canônica
**O que é:** a série bruta normalizada para um vocabulário único, independente da marca do relógio (mesmos campos, mesmas unidades). É sobre ela que todo o motor calcula.
**Cálculo:** parse FIT > TCX > GPX (riqueza decrescente); coordenadas, unidades e canais normalizados.
**Comparativo:** conceito interno em todas; nenhuma expõe. Diferencial do Start Running é calcular **tudo** sobre ela (PC-1), e não misturar scores prontos do fabricante.

### Camadas do dado (0–4)
**O que é:** organização do modelo de dados do atleta: **0** perfil e limiares · **1** núcleo universal da sessão (pace, FC, distância, elevação) · **2** dinâmica/potência (depende de sensor) · **3** derivadas calculadas (cargas, zonas, tendências) · **4** subjetivo e contexto (sRPE, dor, humor).
**Cálculo:** não se aplica (taxonomia).
**Comparativo:** taxonomia própria do Start Running; sem equivalente público nas demais.

### Confiança do dado (confidence)
**O que é:** número 0–1 que acompanha **toda** métrica derivada e mede quanto dá para confiar na sessão: sensor usado, buracos, spikes, densidade de amostragem. Abaixo de **0,6** a UI exibe "baixa confiança" e o motor **não** recalibra limiares com a sessão (PC-5, RNF-7.1).
**Cálculo:** média ponderada — fração de amostras limpas (peso 0,50), densidade de amostragem (0,25) e fonte da FC (0,25; cinta = 1,0, óptico = 0,8). Antes disso, a limpeza remove FC fora de [30, 230] bpm ou salto > 20 bpm/s, interpola buracos ≤ 5 s, marca gaps > 10 s e suaviza drift de GPS (> 12 m/s implícito).
**Comparativo:** TP ✗ · Strava ✗ · Garmin ✗ · Polar ✗ · COROS ✗ — nenhuma expõe confiança por sessão. **Diferencial do Start Running.**

### Versão de metodologia (methodology version)
**O que é:** carimbo (ex.: `engine-2026.07`) gravado em toda métrica derivada, identificando a fórmula usada. Permite auditar e recalcular o histórico quando a metodologia evolui.
**Cálculo:** não se aplica (metadado).
**Comparativo:** nenhuma plataforma consumer expõe. **Diferencial do Start Running.**

---

## 2. Perfil e limiares (Camada 0)

### FCmáx (frequência cardíaca máxima)
**O que é:** maior FC que o atleta atinge. Âncora do modelo de zonas de quem ainda não tem limiar medido.
**Cálculo:** preferimos valor **medido** (teste ou pico real observado) a estimado; estimativa inicial por idade apenas como ponto de partida (RF-1.3).
**Comparativo:** TP ✓ · Strava ✓ · Garmin ✓ (auto-detecta) · Polar ✓ · COROS ✓ — universal.

### FC de repouso
**O que é:** FC em repouso absoluto; base do método de Karvonen e sinal de recuperação (tendência de alta pode indicar fadiga/doença).
**Comparativo:** Garmin ✓ · Polar ✓ · Whoop ✓ · Oura ✓ · Apple Watch ✓ — universal em wearables; TP/Strava recebem o valor, não medem.

### LTHR (Lactate Threshold Heart Rate)
**O que é:** FC no limiar de lactato — a intensidade máxima sustentável por ~1 h. É a âncora de zonas preferida do atleta sério (PC-4): estável dia a dia e independe de GPS.
**Cálculo:** teste de campo (ex.: 30 min forte, média dos 20 finais) ou recalibração automática a partir do executado (RF-3.10, Fase 2), sempre com procedência e confiança.
**Comparativo:** TP ✓ (base das zonas Friel/Coggan) · Garmin ✓ (auto-detecção com cinta) · COROS ✓ · Polar ≈ · Strava ✗ (não usa LTHR; zonas por %FCmáx).

### Pace de limiar (threshold pace)
**O que é:** o ritmo do limiar funcional — equivalente de corrida do FTP do ciclismo. Âncora das zonas de pace e do rTSS.
**Cálculo:** teste de campo ou recalibração pelo executado (Fase 2); referência típica: pace sustentável por ~45–60 min.
**Comparativo:** TP ✓ · COROS ✓ (Threshold Pace) · Garmin ≈ (usa VO2max/estimativas Firstbeat) · Strava ✗ · Polar ≈.

### VO2max
**O que é:** consumo máximo de oxigênio (ml/kg/min) — teto aeróbio. Bom para tendência de longo prazo, ruim para prescrição diária.
**Cálculo:** o Start Running trata como **estimativa com confiança**, derivada da relação pace×FC em sessões de alta qualidade (Fase 2); nunca como número mágico.
**Comparativo:** Garmin ✓ (Firstbeat) · Polar ✓ · COROS ✓ · Apple Watch ✓ · TP ✗ · Strava ✗. Atenção: cada fabricante estima com fórmula fechada — valores **não são comparáveis entre marcas**, exatamente o problema que o PC-1 resolve.

### Velocidade/Potência crítica (CS/CP)
**O que é:** modelo fisiológico do limiar (velocidade ou potência sustentável em equilíbrio); âncora alternativa de zonas para quem treina com potência.
**Cálculo:** ajuste do modelo hiperbólico a esforços máximos de durações distintas (Fase 2/3).
**Comparativo:** COROS ≈ (running power próprio) · Garmin ≈ (Running Power) · Stryd ✓ (referência de CP em corrida) · TP ✓ (via potência) · Strava ✗ · Polar ≈.

---

## 3. Zonas de treino (PC-4)

### Modelo de zonas (3/5/7)
**O que é:** partição da intensidade em faixas. O Start Running **não fixa** o modelo: 3 zonas (Fácil/Moderado/Forte), 5 (Recuperação/Endurance/Tempo/Limiar/VO2max) ou 7 (com Sweet Spot e Anaeróbico), à escolha do atleta.
**Cálculo:** frações fixas da âncora por modelo (ex.: modelo 5 por LTHR: Z2 = 81–90 % LTHR; zona de limiar = 96–103 %). Mudar o modelo recomputa apenas tempo-em-zona — sem re-parse do bruto.
**Comparativo:** Garmin ✓ (5, configurável) · Polar ✓ (5 fixas) · TP ✓ (5–7 por limiar) · Strava ✓ (5 por %FCmáx) · COROS ✓. Modelo **selecionável 3/5/7 + 5 âncoras** é diferencial do Start Running.

### Âncora de zona
**O que é:** a referência que define os limites: **%FCmáx**, **Karvonen (%FC de reserva)**, **%LTHR**, **%pace de limiar** ou **%potência crítica**. Padrão do atleta com limiar conhecido: por limiar, não %FCmáx.
**Cálculo — Karvonen:** FC alvo = FCrep + fração × (FCmáx − FCrep).
**Comparativo:** Garmin ✓ (%FCmáx, %FCR, %LTHR) · TP ✓ (limiar) · Polar parcial · Strava ✗ (só %FCmáx) · COROS ✓ (limiar/pace).

### Tempo em zona (time in zone)
**O que é:** segundos da sessão em cada zona — a leitura de distribuição de intensidade (base do treino polarizado). Alimenta a ZoneBar, componente-assinatura da UI.
**Cálculo:** soma de Δt por amostra dentro da faixa; amostras marcadas como **gap** pela limpeza são excluídas e Δt é limitado a 10 s (buracos não inflam zona).
**Comparativo:** ✓ em todas (TP, Strava, Garmin, Polar, COROS). A diferença do Start Running: exclusão explícita de dado ruim (PC-5) e recomputação barata ao trocar a configuração.

---

## 4. Métricas de sessão (Camada 1–2 / RF-3.2)

### Pace
**O que é:** tempo por quilômetro (min/km) — o idioma do corredor.
**Cálculo:** derivado ponto a ponto de Δdistância/Δtempo (com piso de movimento de 0,5 m/s); médias usam tempo em movimento.
**Comparativo:** universal ✓.

### GAP — Grade Adjusted Pace (pace ajustado ao grade)
**O que é:** o pace "equivalente no plano": quanto valeria seu ritmo se o percurso fosse plano. Corrigir subida/descida é essencial para comparar esforço entre percursos e para o rTSS.
**Cálculo:** modelo de custo energético de **Minetti** sobre o grade suavizado: C(i) = 155,4i⁵ − 30,4i⁴ − 43,3i³ + 46,3i² + 19,5i + 3,6 J/kg/m (i = inclinação, limitada a ±30 %). GAP = pace × C(0)/C(i). Subida ⇒ GAP mais rápido que o pace real.
**Comparativo:** Strava ✓ (GAP, assinatura) · TP ✓ (NGP — Normalized Graded Pace, fórmula própria) · COROS ≈ (Effort Pace) · Garmin ✗ (não expõe) · Polar ✗.

### Splits por km
**O que é:** leitura km a km: pace, GAP, FC média e ganho de elevação de cada quilômetro.
**Cálculo:** particiona a série pela distância acumulada; pace do split = tempo do trecho / distância do trecho.
**Comparativo:** universal ✓ (todas mostram splits; GAP por split só Strava e Start Running).

### Ganho de elevação
**O que é:** metros acumulados de subida na sessão.
**Cálculo:** soma dos Δaltitude positivos sobre altitude **suavizada** (janela móvel), com piso de ruído — barômetro/GPS oscilando não vira "montanha".
**Comparativo:** universal ✓ (cada uma com sua suavização; valores divergem entre plataformas justamente por isso).

### Cadência
**O que é:** passos por minuto (spm). Referência prática: 165–185 spm para a maioria; quedas ao longo da sessão sugerem fadiga.
**Comparativo:** universal ✓.

### Dinâmica de corrida (GCT, oscilação vertical, stride) — Fase 3
**O que é:** tempo de contato com o solo (ms), oscilação vertical (mm), balanço E/D e comprimento de passada — Camada 2, depende de sensor (cinta com acelerômetro/pod).
**Comparativo:** Garmin ✓ (Running Dynamics) · COROS ✓ (pod) · Polar ✓ · Strava ✗ · TP parcial (exibe se vier no arquivo).

### EF — Efficiency Factor (Fase 2)
**O que é:** quanto de velocidade você produz por batimento — eficiência aeróbia. Tendência de alta em sessões comparáveis = evolução real da base.
**Cálculo:** EF = velocidade GAP média (ou potência) ÷ FC média do trecho aeróbio estável.
**Comparativo:** TP ✓ (EF) · intervals.icu ✓ · Garmin ✗ · Strava ✗ · Polar ✗.

### Decoupling / deriva cardíaca (Pa:HR) — Fase 2
**O que é:** quanto a relação pace÷FC piora da 1ª para a 2ª metade de um esforço constante. < 5 % indica boa durabilidade aeróbia; alto = base insuficiente, calor ou desidratação.
**Cálculo:** (EF₁ − EF₂) / EF₁, em %.
**Comparativo:** TP ✓ (Pa:Hr) · intervals.icu ✓ · demais ✗.

---

## 5. Carga de treino por sessão (RF-3.3)

> Degradação elegante: a plataforma calcula **todas** as cargas possíveis com o dado disponível e usa a melhor da hierarquia **hrTSS > rTSS > TRIMP > sRPE**. Quem só tem celular participa do modelo desde o dia 1 (via sRPE).

### TRIMP (Training Impulse, Banister)
**O que é:** carga interna clássica da literatura: pondera cada minuto pela fração da FC de reserva com peso exponencial — minutos intensos "custam" muito mais.
**Cálculo:** TRIMP = Σ Δt(min) × HRr × 0,64 × e^(k·HRr), onde HRr = (FC − FCrep)/(FCmáx − FCrep); k = 1,92 (homens) / 1,67 (mulheres).
**Comparativo:** Polar ≈ (Cardio Load é TRIMP-based) · Strava ≈ (Relative Effort deriva de zonas de FC) · Runalyze ✓ · Garmin ✗ (usa EPOC/Firstbeat) · TP ✗ (usa TSS).

### hrTSS (Training Stress Score por FC)
**O que é:** carga na escala TSS (100 = 1 h no limiar) usando FC — a melhor opção quando há FC confiável + LTHR.
**Cálculo:** hrTSS = horas × IF² × 100, com IF = FC média ÷ LTHR.
**Comparativo:** TP ✓ (criadora da família TSS) · intervals.icu ✓ · Suunto ✓ (TSS licenciado) · Garmin ✗ · Strava ✗ · Polar ✗.

### rTSS (running TSS)
**O que é:** TSS por ritmo: usa o **GAP** contra o pace de limiar — funciona sem FC, desde que haja GPS decente.
**Cálculo:** rTSS = horas em movimento × IF² × 100, com IF = velocidade GAP ÷ velocidade de limiar.
**Comparativo:** TP ✓ (rTSS/NGP) · intervals.icu ✓ · demais ✗.

### sRPE (session RPE, Foster)
**O que é:** carga subjetiva: percepção de esforço da sessão (0–10) × minutos. É o caminho do **registro manual** (RF-2.5) — o iniciante sem sensor entra no mesmo modelo de carga.
**Cálculo:** sRPE = RPE × duração em minutos.
**Comparativo:** TP parcial (aceita RPE manual) · plataformas consumer ✗ em geral. Tratar sRPE como **cidadão de primeira classe** no modelo de carga é diferencial do Start Running.

### Carga diária (daily load)
**O que é:** soma das cargas das sessões do dia (na melhor unidade disponível de cada uma) — insumo de CTL/ATL/ACWR.
**Cálculo:** função determinística das sessões do período — reprocessar nunca duplica (RNF-2.3).
**Comparativo:** interno em todas (✓ conceitualmente).

---

## 6. Séries de carga e forma (RF-3.4/3.5)

### CTL — Chronic Training Load ("fitness")
**O que é:** carga crônica: média exponencial de ~42 dias. Representa a base construída; sobe devagar, cai devagar.
**Cálculo:** EWMA — CTL_hoje = CTL_ontem + (carga_hoje − CTL_ontem)/42.
**Comparativo:** TP ✓ (PMC) · Strava ≈ ("Fitness") · intervals.icu ✓ · Garmin ≈ (Load Focus/4 semanas) · Polar ≈ (Tolerance) · COROS ≈ (Base Fitness).

### ATL — Acute Training Load (fadiga)
**O que é:** carga aguda: média exponencial de ~7 dias. Sobe rápido com sequência pesada; é a "fadiga fresca".
**Cálculo:** EWMA com constante 7 d (mesma forma do CTL).
**Comparativo:** TP ✓ · Strava ≈ ("Fatigue") · intervals.icu ✓ · Polar ≈ (Strain) · COROS ≈ (Load Impact).

### TSB — Training Stress Balance (forma/frescor)
**O que é:** CTL − ATL: o saldo entre base e fadiga. Negativo = bloco de construção; positivo às vésperas da prova = frescor. O Start Running reporta o TSB **com que o atleta acordou** (usa CTL/ATL de ontem — o treino de hoje ainda não conta).
**Cálculo:** TSB_hoje = CTL_ontem − ATL_ontem.
**Comparativo:** TP ✓ (Form) · Strava ≈ ("Form") · intervals.icu ✓ · Garmin ✗ (usa Training Status próprio) · Polar ≈ (Status do Training Load Pro).

### ACWR — Acute:Chronic Workload Ratio
**O que é:** razão entre a carga da última semana e a média das últimas 4 — o sinal clássico de risco de lesão por picos de carga (Gabbett). **Zona segura ~0,8–1,3**; fora dela a plataforma alerta e o motor de treino ajusta o plano (RF-8.2).
**Cálculo:** média de carga 7 d ÷ média de carga 28 d, dia a dia.
**Comparativo:** Garmin ✓ (Load Ratio) · intervals.icu ✓ · TP ✗ (usa ramp rate) · Strava ✗ · Polar ≈ (Cardio Load Status) · COROS ≈.

---

## 7. Prontidão e recuperação (RF-3.7 / RF-6.x — Fase 2)

### HRV / RMSSD (variabilidade da frequência cardíaca)
**O que é:** variação batimento a batimento (RMSSD, em ms) — proxy do estado do sistema nervoso autônomo. O valor absoluto importa menos que o **desvio da própria baseline**.
**Cálculo:** RMSSD medido no sono/repouso (wearable ou cinta); baseline = média móvel de ~7–28 d; o sinal usado é o desvio relativo.
**Comparativo:** Whoop ✓ (núcleo do Recovery) · Oura ✓ · Garmin ✓ (HRV Status) · Polar ✓ (Nightly Recharge) · Apple Watch ✓ · TP/Strava recebem de terceiros.

### Prontidão (readiness)
**O que é:** score diário consolidado (0–100) que responde "dá para treinar forte hoje?", combinando desvio de HRV, sono, FC de repouso e TSB. Guia o **ajuste diário** do plano (RF-6.2): prontidão baixa ⇒ o tiro de hoje vira rodado.
**Cálculo:** combinação ponderada dos sinais com a confiança de cada um (metodologia canônica, Fase 2); sempre acompanhada do "porquê" em linguagem de técnico.
**Comparativo:** Oura ✓ (Readiness) · Whoop ✓ (Recovery) · Garmin ✓ (Training Readiness) · Polar ≈ · Strava ✗ · TP ✗. Todos proprietários e fechados; o do Start Running é aberto e explicado.

### Sono
**O que é:** duração e qualidade do sono — o maior modulador de recuperação. Entra na prontidão e nos alertas.
**Comparativo:** wearables ✓ (Garmin, Polar, Whoop, Oura, Apple) · TP/Strava ✗.

---

## 8. Plano e KPIs de produto

### Periodização (Base → Build → Peak → Taper)
**O que é:** organização do plano em fases com objetivos distintos: construir base aeróbia → intensidade específica → pico → polimento pré-prova.
**Comparativo:** TP ✓ (Annual Training Plan) · Garmin ✓ (Coach/DSW) · demais parcial. No Start Running o plano se **replaneja** com prontidão e ACWR (RF-6.x).

### Aderência planejado × executado
**O que é:** KPI de quanto o atleta cumpriu o plano: sessões feitas, e quão perto do prescrito (duração, intensidade, zonas). Alimenta o replanejamento e o feedback do coach (RF-5.1).
**Cálculo:** match sessão-a-sessão (janela temporal + tipo) e distância entre prescrito e executado por dimensão.
**Comparativo:** TP ✓ (compliance) · Garmin parcial (execution score em treinos guiados) · Strava ✗ · Polar parcial.

### PR / Recorde pessoal
**O que é:** melhor marca do atleta por distância (5k, 10k, 21k...). No DS, é um dos poucos momentos que usam o acento **Volt** — celebração reservada a marcos reais.
**Cálculo:** melhores janelas móveis por distância dentro das sessões válidas (confiança ≥ 0,6).
**Comparativo:** Strava ✓ (estimated best efforts) · Garmin ✓ · universal em algum grau.

### Streak / consistência
**O que é:** semanas consecutivas cumprindo o volume/frequência planejados. KPI de hábito — o preditor mais honesto de evolução de amador.
**Comparativo:** Strava ✓ (semanas ativas) · Garmin parcial (badges) · TP ✗ formalmente.

---

## Tabela-resumo do comparativo

| Termo/KPI | Start Running | TP | Strava | Garmin | Polar | COROS | intervals.icu |
|---|---|---|---|---|---|---|---|
| Confiança do dado por sessão | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Versão de metodologia | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Zonas 3/5/7 + 5 âncoras | ✓ | parcial | ✗ | parcial | ✗ | parcial | parcial |
| GAP | ✓ (Minetti) | ✓ (NGP) | ✓ | ✗ | ✗ | ≈ | ✓ |
| TRIMP | ✓ | ✗ | ≈ | ✗ | ≈ | ✗ | ✓ |
| hrTSS / rTSS | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| sRPE como carga plena | ✓ | parcial | ✗ | ✗ | ✗ | ✗ | ✓ |
| CTL / ATL / TSB | ✓ | ✓ | ≈ | ≈ | ≈ | ≈ | ✓ |
| ACWR + alerta | ✓ | ✗ | ✗ | ✓ | ≈ | ≈ | ✓ |
| EF / decoupling | ✓ (F2) | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| HRV / prontidão | ✓ (F2, aberto) | ✗ | ✗ | ≈ | ≈ | ≈ | parcial |
| VO2max | ✓ (F2, c/ confiança) | ✗ | ✗ | ≈ | ≈ | ≈ | ✓ |
| Aderência plano×executado | ✓ | ✓ | ✗ | parcial | parcial | parcial | ✓ |

**Leitura estratégica:** as plataformas de fabricante (Garmin/Polar/COROS) entregam scores **fechados e não comparáveis entre marcas**; as de análise (TP/intervals.icu) são abertas porém técnicas e sem coaching adaptativo consumer. O Start Running ocupa o meio: metodologia **aberta, canônica e versionada**, com confiança explícita e linguagem de técnico (DS §9).

---

*Documento vivo: novos termos entram junto com as fases do roadmap (SRS §7). Fórmulas refletem `engine-2026.07` — mudanças de metodologia atualizam este glossário no mesmo PR (RNF-9.2).*
