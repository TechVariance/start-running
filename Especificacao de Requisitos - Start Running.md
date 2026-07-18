# Especificação de Requisitos de Software (SRS) — Start Running

**Plataforma:** Start Running (nome provisório)
**Responsável pelo desenvolvimento:** Variance
**Versão do documento:** 1.0
**Data:** 2 de julho de 2026
**Tipo:** Especificação de requisitos de produto — plataforma completa
**Público:** time de produto, engenharia, design (UX), stakeholders da Variance

---

## Sumário

1. Introdução
2. Visão geral do produto
3. Princípios de produto e arquitetura conceitual
4. Requisitos funcionais
5. Requisitos não-funcionais
6. Arquitetura de alto nível
7. Roadmap por fases
8. Métricas de sucesso (KPIs)
9. Riscos e mitigações
10. Glossário de métricas fisiológicas

---

## 1. Introdução

### 1.1 Propósito

Este documento especifica os requisitos funcionais e não-funcionais da plataforma **Start Running**, um aplicativo que usa inteligência artificial para **sugerir, controlar, atualizar e apoiar** corredores de rua em treinamentos personalizados. O objetivo é servir de base única e rastreável para o time da Variance transformar a visão de produto em backlog de desenvolvimento, decisões de design e critérios de aceite.

O documento cobre a **plataforma completa** (toda a visão de produto), organizada de forma que a implementação possa ser faseada — do MVP à versão madura — sem retrabalho de arquitetura.

### 1.2 Escopo do produto

Start Running é uma plataforma de **coaching de corrida por IA** que:

- Ingere dados de treino de múltiplas fontes (relógios GPS, apps, entrada manual);
- Calcula métricas fisiológicas de forma **canônica e consistente**, independentemente da marca do dispositivo;
- Gera, ajusta e explica planos de treino personalizados para provas de rua (5 km a ultramaratona);
- Integra nutrição, fortalecimento, prevenção de lesões e estratégia de prova;
- Oferece um coach conversacional por IA com acesso aos dados reais do atleta;
- Entrega uma experiência premium para um público hoje mal atendido: o **corredor amador competitivo**.

**Fora de escopo (v1 da plataforma):** hardware proprietário (relógios/sensores), telemedicina/consulta médica formal, e-commerce de produtos físicos, e modalidades fora da corrida (ciclismo, natação, triatlo) — previstos apenas como evolução futura.

### 1.3 Definições e convenções

- **RF-x** — requisito funcional. **RNF-x** — requisito não-funcional. **RN-x** — regra de negócio.
- **Prioridade (MoSCoW):** `Must` (essencial ao MVP), `Should` (importante, pós-MVP próximo), `Could` (desejável), `Won't (agora)` (fora do horizonte atual).
- **Série temporal bruta:** registro ponto a ponto do treino (FC, pace, potência, cadência, GPS por segundo).
- **Métrica derivada:** valor calculado a partir da série bruta (ex.: TSS, CTL, ACWR).
- Glossário completo de métricas fisiológicas na **Seção 10**.

### 1.4 Referências

- *Pesquisa de Mercado — App de Corrida com IA* (Variance, jul/2026).
- Registro de pesquisa inicial e decisões de arquitetura do projeto (memória do projeto Start Running).

---

## 2. Visão geral do produto

### 2.1 Contexto de mercado (resumo)

O Brasil tem entre 14 e 15 milhões de corredores (crescimento de ~15% em 12 meses até nov/2025), um mercado de corridas de rua que movimenta cerca de R$ 1,1 bilhão e um número de provas oficiais que cresceu 85% em 2025. A concorrência de apps de IA no Brasil (Zyla, Pacer, AI Runner) concentra-se na faixa de R$ 30–40/mês, com **leitura de dados rasa** e foco em iniciante/intermediário. Globalmente, o setor divide-se entre produtos de **UX polida e fisiologia rasa** (Runna, Nike Run Club) e **engines profundas com interface datada** (TrainAsONE, Athletica). O segmento de **atleta competitivo com leitura fisiológica séria + experiência premium** segue órfão — é o alvo do Start Running.

### 2.2 Proposta de valor

> Ler o treino de verdade. Start Running ingere a série temporal bruta de qualquer relógio e calcula carga, forma e prontidão com **uma única metodologia**, entregando planos que evoluem com o atleta de verdade — não com o pace que ele declarou no cadastro.

Três pilares diferenciadores:

1. **Motor fisiológico canônico** — métricas comparáveis entre marcas, recalibradas a partir do executado.
2. **Experiência premium** — UX de primeira linha para um público exigente.
3. **Coach conversacional com dados reais** — IA que explica o "porquê" de cada decisão.

### 2.3 Personas

**Persona primária — Brunno (o competitivo órfão).** Atleta amador competitivo, corre meias, maratonas e ultras pelo mundo, busca constantemente bater PRs. Agenda profissional intensa. Usa Garmin/Coros, Strava, entende de limiar e zonas. Frustra-se com apps que prescrevem o mesmo treino conservador por semanas. Disposição a pagar acima da média por profundidade real. **Necessidades:** leitura fina do executado, recalibração de zonas/paces, periodização séria, estratégia de prova, prevenção de lesão.

**Persona secundária — Intermediário em ascensão.** Corre há 1–3 anos, terminou meias, quer sua primeira maratona ou sub-2h nos 21 km. Tem relógio GPS, começa a se interessar por dados. **Necessidades:** estrutura confiável, progressão que respeite a rotina, orientação de nutrição e recuperação, explicação acessível.

**Persona terciária — Iniciante conectado.** Entrou na corrida no último ano (perfil de massa: mais jovem, forte presença feminina e de Classe C). Pode ter só o celular. **Necessidades:** baixa fricção, plano simples (run/walk), motivação, comunidade, segurança.

**Persona de apoio — Treinador/assessoria (B2B2C).** Usa a plataforma para escalar o acompanhamento de vários atletas mantendo a metodologia própria. **Necessidades:** visão de carteira, capacidade de sobrepor julgamento humano ao motor, comunicação com o atleta.

### 2.4 Premissas

- O atleta autoriza a conexão de pelo menos uma fonte de dados (Strava, Garmin) ou registra treinos manualmente.
- Há conectividade intermitente aceitável; o app deve tolerar sincronização assíncrona.
- A metodologia de treino (periodização) é definida por especialistas e codificada no motor — a IA personaliza e entrega em escala, não substitui a base metodológica.

### 2.5 Restrições

- **Privacidade/LGPD:** dados de saúde são sensíveis; tratamento sujeito à Lei 13.709/2018 (ver RNF de segurança).
- **Limites de API de terceiros:** cotas e políticas de Strava, Garmin, Apple, etc., podem restringir frequência e granularidade de ingestão.
- **Escopo clínico:** o app não emite diagnóstico nem prescrição médica; recomenda avaliação profissional quando indicado.
- **Plataformas:** iOS e Android como alvo primário; web como complemento.

---

## 3. Princípios de produto e arquitetura conceitual

Estes princípios são vinculantes e restringem as decisões de todas as demais seções.

### 3.1 Princípio central: ingestão bruta + cálculo canônico

**PC-1.** A plataforma deve ingerir as **séries temporais brutas** (FC, pace, potência, cadência, GPS ponto a ponto) e calcular **todas** as métricas derivadas internamente, com uma **única metodologia**, para garantir comparabilidade entre dispositivos de marcas diferentes.

**PC-2.** Scores proprietários de fabricantes (Body Battery, Training Readiness, Recovery Pro, etc.) entram **apenas como sinais secundários**, nunca como base de cálculo das métricas canônicas.

**PC-3.** Sempre que possível, puxar o **arquivo FIT original** (registro a registro) em vez do JSON resumido da API.

### 3.2 Modelo de dados em camadas

A lógica do app deve **degradar com elegância**: funcionar com o mínimo e enriquecer conforme o atleta tem mais sensores.

- **Camada 0 — Perfil do atleta** (input + medições pontuais): idade, sexo, peso, altura, FC máx, FC repouso, LTHR e pace de limiar, VO2máx, Critical Speed/Power, histórico de lesões, PRs por distância, nível/volume habitual/disponibilidade, prova-alvo/data/meta.
- **Camada 1 — Núcleo universal** (todo relógio GPS + FC entrega): tempo total e em movimento, distância, pace médio e por km (splits), FC média/máx, tempo em cada zona, cadência, elevação e grade, GAP (pace ajustado ao relevo), temperatura, tipo de treino (planejado vs executado).
- **Camada 2 — Dinâmica e potência** (depende de sensor): potência de corrida (W e Normalized Power), GCT e equilíbrio L/R, oscilação vertical e vertical ratio, comprimento da passada, leg stiffness.
- **Camada 3 — Carga e prontidão** (calculada pela plataforma): TRIMP/rTSS/hrTSS, CTL (~42d), ATL (~7d), TSB, ACWR (zona ~0,8–1,3), Efficiency Factor, decoupling/cardiac drift, HRV (RMSSD + baseline), sono, tendência de FC repouso, SpO2.
- **Camada 4 — Subjetivo e contexto** (input do atleta): sRPE, sintomas (dor, rigidez, humor, motivação, estresse), superfície, calçado, clima.

### 3.3 Sistema de zonas configurável

**PC-4.** O sistema de zonas **não pode ser fixo**. O atleta/treinador deve poder escolher o modelo (3, 5 ou 7 zonas) e a âncora (%FCmax, Karvonen %FCR, %LTHR, %pace de limiar ou %potência crítica). O padrão para atleta sério é trabalhar por **limiar**, não por %FCmax.

### 3.4 Qualidade do dado como pré-requisito

**PC-5.** Antes de qualquer cálculo, a plataforma deve validar e limpar o dado: marcar a fonte de FC (cinta peitoral vs óptica) e ponderar a confiança; tratar drift de GPS; remover/interpolar spikes, dropouts e gaps. Nenhuma métrica derivada é exibida sobre dado não validado sem sinalização de baixa confiança.

---

## 4. Requisitos funcionais

Os requisitos estão agrupados por módulo (épico). Cada requisito traz **ID**, **prioridade MoSCoW** e, quando cabível, **regras de negócio (RN)** e **critérios de aceite**. As histórias de usuário seguem o formato *"Como [persona], quero [ação] para [benefício]"*.

### Módulo 1 — Onboarding e perfil do atleta (Camada 0)

| ID | Prioridade | Requisito |
|---|---|---|
| RF-1.1 | Must | Onboarding conversacional/guiado que capture nível autoavaliado, objetivo, distância-alvo, data da prova e dias disponíveis por semana (checkboxes). |
| RF-1.2 | Must | Captura do perfil da Camada 0: idade, sexo, peso, altura, FC repouso, PRs por distância, volume habitual e disponibilidade semanal. |
| RF-1.3 | Should | Captura de dados avançados quando disponíveis: FC máx (medida vs estimada), LTHR/pace de limiar, VO2máx, Critical Speed/Power. |
| RF-1.4 | Must | Registro de histórico de lesões e restrições, com impacto direto nas regras de prescrição. |
| RF-1.5 | Must | Questionário de prontidão para atividade física (PAR-Q ou equivalente) e triagem de risco cardiovascular, com encaminhamento a avaliação profissional quando indicado. |
| RF-1.6 | Should | Edição do perfil a qualquer tempo, com recálculo das derivações dependentes (zonas, paces-alvo). |
| RF-1.7 | Could | Importação inicial do histórico de treinos das fontes conectadas para "aquecer" o modelo do atleta. |

**RN-1.1** O onboarding deve ser concluível em menos de 5 minutos no caminho do iniciante (sem exigir dados de laboratório).
**RN-1.2** Campos avançados (LTHR, VO2máx, CS/CP) são opcionais; sua ausência não bloqueia a geração de plano, apenas reduz a precisão até haver dados suficientes.
**Critério de aceite:** ao final do onboarding, o sistema gera zonas provisórias e um plano inicial mesmo com apenas os campos `Must`.

### Módulo 2 — Integrações e ingestão de dados

| ID | Prioridade | Requisito |
|---|---|---|
| RF-2.1 | Must | Conector de ingestão via Strava (atividade, FC, GPS, pace). |
| RF-2.2 | Must | Conector Garmin (Connect/Health), priorizando o arquivo FIT original e dados ricos (HRV, sono, VO2máx quando permitido). |
| RF-2.3 | Should | Conectores adicionais: Apple HealthKit, Polar AccessLink, Coros, Suunto. |
| RF-2.4 | Must | Upload manual de arquivos FIT/TCX/GPX (ordem de riqueza FIT > TCX > GPX). |
| RF-2.5 | Must | Registro manual de treino (sem dispositivo): distância, tempo, sRPE, sensações — atende o iniciante e a Camada 4. |
| RF-2.6 | Must | Deduplicação de atividades quando a mesma sessão chega por mais de uma fonte. |
| RF-2.7 | Should | Sincronização assíncrona com reprocessamento automático quando um dado melhor da mesma sessão chega depois. |
| RF-2.8 | Could | Webhook/near-real-time para refletir treino recém-concluído em minutos. |

**RN-2.1** O MVP deve ancorar a ingestão em **uma ou duas fontes ricas (FIT via Strava + Garmin)** para calibrar o modelo canônico antes de expandir conectores.
**RN-2.2** Toda atividade ingerida registra **fonte, dispositivo e tipo de sensor de FC** (peitoral vs óptico) para ponderação de confiança.

### Módulo 3 — Motor de métricas / cálculo canônico (Camadas 1–3)

| ID | Prioridade | Requisito |
|---|---|---|
| RF-3.1 | Must | Pipeline de limpeza e validação de dado (spikes, dropouts, gaps, drift de GPS) com flag de confiança por sessão (PC-5). |
| RF-3.2 | Must | Cálculo da Camada 1 (núcleo universal): splits, tempo-em-zona, cadência, GAP, elevação. |
| RF-3.3 | Must | Cálculo de carga interna por sessão: TRIMP/rTSS/hrTSS. |
| RF-3.4 | Must | Cálculo de CTL (~42d), ATL (~7d) e TSB (forma/frescor). |
| RF-3.5 | Must | Cálculo de ACWR (aguda:crônica) com alerta na saída da zona segura (~0,8–1,3). |
| RF-3.6 | Should | Efficiency Factor e decoupling/cardiac drift para avaliar economia aeróbia e durabilidade. |
| RF-3.7 | Should | Processamento de HRV (RMSSD, baseline + desvio diário), sono e tendência de FC repouso. |
| RF-3.8 | Could | Cálculo da Camada 2 (dinâmica/potência): Normalized Power, GCT, oscilação vertical, leg stiffness. |
| RF-3.9 | Must | Motor de zonas configurável (3/5/7 zonas; âncoras %FCmax, %FCR, %LTHR, %pace limiar, %potência) — PC-4. |
| RF-3.10 | Should | Recalibração automática de LTHR/pace de limiar a partir do executado e de testes de campo. |

**RN-3.1** Todas as métricas de carga/prontidão são **computadas pela plataforma**, nunca importadas de scores proprietários (PC-2).
**RN-3.2** Cada métrica derivada exibe sua janela de cálculo e nível de confiança do dado subjacente.
**Critério de aceite:** dois treinos idênticos gravados em relógios de marcas diferentes produzem métricas canônicas equivalentes dentro de uma tolerância definida.

### Módulo 4 — Geração de planos de treino

| ID | Prioridade | Requisito |
|---|---|---|
| RF-4.1 | Must | Geração de plano periodizado ancorado na prova-alvo, com fases (base, volume, intensidade, polimento, recuperação). |
| RF-4.2 | Must | Distribuição semanal de treinos respeitando dias disponíveis e volume habitual. |
| RF-4.3 | Must | Treinos-chave da semana com descrição detalhada e prescrição de zonas (FC ou pace). |
| RF-4.4 | Must | Volume total e progressão explícitos, com teto de progressão seguro (respeitando ACWR). |
| RF-4.5 | Must | Inclusão de treinos de fortalecimento (força, propriocepção, pliometria) no plano — ver Módulo 11. |
| RF-4.6 | Should | Suporte a múltiplas distâncias-alvo (5 km a ultramaratona) e a provas encadeadas (calendário de temporada). |
| RF-4.7 | Should | Regeneração/adaptação do plano quando muda a disponibilidade, a data da prova ou o objetivo. |

**RN-4.1** A prescrição de paces e zonas deriva do **executado e dos limiares recalibrados**, não do pace declarado no onboarding (correção explícita do erro estrutural dos concorrentes).
**RN-4.2** A progressão de volume não pode empurrar o ACWR para fora da zona segura sem alerta e justificativa.
**RN-4.3** Longões e regenerativos não têm teto de distância fixo arbitrário; o teto deriva do perfil e da fase, não de uma regra genérica.

### Módulo 5 — Leitura e análise do treino executado

| ID | Prioridade | Requisito |
|---|---|---|
| RF-5.1 | Must | Comparação planejado vs executado por sessão (aderência a pace, zona, duração). |
| RF-5.2 | Must | Feedback automático por treino (100% das sessões) com leitura de carga e qualidade. |
| RF-5.3 | Should | Análise de tendência de evolução (EF, decoupling, paces por zona ao longo do tempo) — confirmar evolução real, não só volume. |
| RF-5.4 | Should | Detecção de sinais de overreaching/overtraining a partir de HRV, FC repouso, sono e TSB. |
| RF-5.5 | Could | Análise de durabilidade em longões (decoupling < 5% = bom) e de execução de tiros. |

**Critério de aceite:** após cada sincronização, o atleta recebe uma leitura textual e visual da sessão em até X minutos (ver RNF de performance), com destaque para desvios relevantes.

### Módulo 6 — Prescrição adaptativa e ajuste dinâmico

| ID | Prioridade | Requisito |
|---|---|---|
| RF-6.1 | Must | Ajuste semanal do plano com recalibração de carga e volume para prevenir lesão. |
| RF-6.2 | Should | Ajuste diário da intensidade do dia em função de prontidão (HRV, sono, TSB, sRPE). |
| RF-6.3 | Should | Realocação de treinos perdidos e replanejamento após interrupções (viagem, doença, lesão leve). |
| RF-6.4 | Must | Transparência do ajuste: o app mostra o "raciocínio da IA" para cada mudança relevante. |

**RN-6.1** Nenhum ajuste que aumente carga é aplicado sem checar ACWR e sinais de prontidão.
**RN-6.2** O atleta pode aceitar, recusar ou pedir explicação de qualquer ajuste sugerido.

### Módulo 7 — Nutrição integrada

| ID | Prioridade | Requisito |
|---|---|---|
| RF-7.1 | Should | Recomendações nutricionais integradas ao planejamento de treino, baseadas em evidência (sem modismos). |
| RF-7.2 | Should | Periodização nutricional: carboidratos em treinos longos, recuperação pós-treino, hidratação. |
| RF-7.3 | Could | Estratégia nutricional de prova (carga de carboidrato, ingestão durante a prova por distância). |
| RF-7.4 | Won't (agora) | Contagem detalhada de calorias/macros como diário alimentar completo. |

**RN-7.1** Recomendações nutricionais são orientativas e não substituem nutricionista; sinalizar quando encaminhar a profissional.

### Módulo 8 — Prevenção, recuperação e gestão de risco

| ID | Prioridade | Requisito |
|---|---|---|
| RF-8.1 | Must | Em toda recomendação de treino intenso, incluir sinais de overtraining a monitorar e estratégias de recuperação ativa. |
| RF-8.2 | Must | Alertas de risco de lesão baseados em ACWR, salto de carga e histórico de lesões. |
| RF-8.3 | Should | Orientação de quando buscar avaliação profissional (fisioterapeuta, médico do esporte). |
| RF-8.4 | Could | Registro e acompanhamento de sintomas de dor/lesão com adaptação do plano. |

### Módulo 9 — Coach conversacional (IA)

| ID | Prioridade | Requisito |
|---|---|---|
| RF-9.1 | Should | Interface conversacional em que o atleta pode perguntar sobre seus treinos, plano e métricas, com respostas ancoradas nos **dados reais** dele. |
| RF-9.2 | Should | Memória de contexto do atleta (objetivos, histórico, preferências) entre conversas. |
| RF-9.3 | Could | Explicação sob demanda de qualquer métrica ("o que é meu TSB e por que caiu?"). |
| RF-9.4 | Could | Ajuste de plano via linguagem natural ("viajo semana que vem, remaneja meus treinos"). |

**RN-9.1** O coach conversacional nunca inventa dado: quando não há informação suficiente, declara a limitação.
**RN-9.2** Respostas com implicação de saúde incluem ressalva e, quando aplicável, encaminhamento profissional.

### Módulo 10 — Provas e estratégia de corrida

| ID | Prioridade | Requisito |
|---|---|---|
| RF-10.1 | Should | Estratégia de pace e distribuição de esforço para a prova-alvo. |
| RF-10.2 | Could | Perfil do percurso e pontos críticos de provas específicas (nacionais e internacionais). |
| RF-10.3 | Could | Logística integrada ao desempenho em provas internacionais: fuso horário, aclimatação, alimentação no destino. |

### Módulo 11 — Fortalecimento e treino complementar

| ID | Prioridade | Requisito |
|---|---|---|
| RF-11.1 | Must | Biblioteca de exercícios de força, propriocepção e pliometria com vídeo/descrição. |
| RF-11.2 | Must | Prescrição de sessões de fortalecimento integradas ao calendário e à fase do plano. |
| RF-11.3 | Could | Adaptação dos exercícios ao histórico de lesões e ao equipamento disponível. |

### Módulo 12 — Comunidade e social

| ID | Prioridade | Requisito |
|---|---|---|
| RF-12.1 | Should | Comunidade e suporte (grupos, canal de comunicação) — retenção vem tanto de comunidade quanto de algoritmo. |
| RF-12.2 | Could | Grupos por objetivo/prova e desafios coletivos. |
| RF-12.3 | Could | Compartilhamento de conquistas e integração social (feed, kudos). |

### Módulo 13 — Gamificação e engajamento

| ID | Prioridade | Requisito |
|---|---|---|
| RF-13.1 | Should | Metas, streaks e marcos de progresso que reforcem a disciplina sem incentivar overtraining. |
| RF-13.2 | Could | Desafios e recompensas no app (ecossistema gamificado). |

**RN-13.1** Mecânicas de engajamento não podem incentivar comportamento de risco (treinar doente, ignorar sinais de fadiga).

### Módulo 14 — Notificações e lembretes

| ID | Prioridade | Requisito |
|---|---|---|
| RF-14.1 | Must | Lembretes de treino e notificações de feedback pós-treino. |
| RF-14.2 | Should | Alertas de prontidão/risco (ex.: "sua carga aguda subiu; considere aliviar hoje"). |
| RF-14.3 | Could | Preferências granulares de canal e frequência de notificação. |

### Módulo 15 — Dashboard e visualizações

| ID | Prioridade | Requisito |
|---|---|---|
| RF-15.1 | Must | Painel com carga (CTL/ATL/TSB), volume semanal e progressão. |
| RF-15.2 | Should | Gráficos de tempo-em-zona, splits e tendências (EF, decoupling, VO2máx estimado). |
| RF-15.3 | Should | Calendário de treinos com planejado vs executado. |
| RF-15.4 | Could | Visão de prontidão diária consolidada. |

### Módulo 16 — Monetização e assinatura

| ID | Prioridade | Requisito |
|---|---|---|
| RF-16.1 | Must | Gestão de assinatura com teste grátis, planos mensal e anual, via lojas (App Store/Google Play). |
| RF-16.2 | Should | Camadas de produto (ex.: essencial vs premium com enrichment de dinâmica/potência e HRV). |
| RF-16.3 | Should | Integração com canal de benefício corporativo (ex.: Wellhub) como via de distribuição. |
| RF-16.4 | Could | Cupom/trial estendido e gestão de churn (win-back). |

### Módulo 17 — Painel do treinador (B2B2C)

| ID | Prioridade | Requisito |
|---|---|---|
| RF-17.1 | Could | Visão de carteira de atletas com indicadores de carga, prontidão e aderência. |
| RF-17.2 | Could | Capacidade de o treinador sobrepor ajuste humano ao motor e comunicar-se com o atleta. |
| RF-17.3 | Won't (agora) | Marketplace de treinadores. |

### Módulo 18 — Administração e configurações

| ID | Prioridade | Requisito |
|---|---|---|
| RF-18.1 | Must | Gestão de conta, consentimentos (LGPD), conexões de dados e exclusão de dados/conta. |
| RF-18.2 | Must | Configuração de unidades, idioma, modelo de zonas e preferências de treino. |
| RF-18.3 | Should | Exportação dos próprios dados (portabilidade). |
| RF-18.4 | Must | Painel administrativo interno para suporte, gestão de conteúdo (biblioteca de exercícios) e observabilidade do motor. |

---

## 5. Requisitos não-funcionais

### 5.1 Desempenho
- **RNF-1.1 (Must)** — A leitura de uma sessão sincronizada (limpeza + cálculo de métricas + feedback) deve ficar pronta em até **2 minutos** após a ingestão, no caso típico.
- **RNF-1.2 (Must)** — Telas principais (dashboard, plano, treino) devem carregar em até **2 segundos** em rede móvel típica.
- **RNF-1.3 (Should)** — A geração/adaptação de plano deve responder em até **10 segundos**.

### 5.2 Escalabilidade e confiabilidade
- **RNF-2.1 (Must)** — Arquitetura preparada para processar ingestão em lote e picos pós-prova (muitos atletas sincronizando ao mesmo tempo) sem degradar a leitura.
- **RNF-2.2 (Must)** — Disponibilidade-alvo de **99,5%** mensal para os serviços principais.
- **RNF-2.3 (Should)** — Reprocessamento idempotente: reprocessar uma sessão não duplica dado nem corrompe séries de carga.

### 5.3 Segurança e privacidade (LGPD)
- **RNF-3.1 (Must)** — Dados de saúde são **dados pessoais sensíveis** (Lei 13.709/2018). Coleta mediante **consentimento explícito, informado e granular**, com finalidade declarada.
- **RNF-3.2 (Must)** — Criptografia em trânsito (TLS) e em repouso para dados pessoais e de saúde.
- **RNF-3.3 (Must)** — Direitos do titular: acesso, correção, portabilidade e **exclusão** de dados/conta, atendidos dentro do prazo legal.
- **RNF-3.4 (Must)** — Gestão segura de tokens de terceiros (Strava/Garmin) com escopo mínimo e revogação pelo usuário.
- **RNF-3.5 (Should)** — Registro de auditoria de acessos a dados sensíveis e política de retenção/minimização.

### 5.4 Usabilidade e UX (diferencial premium)
- **RNF-4.1 (Must)** — Padrão de UX de primeira linha: fluxos claros, onboarding de baixa fricção, hierarquia visual que não intimide o iniciante nem subestime o competitivo.
- **RNF-4.2 (Must)** — Toda métrica avançada exibida deve ter explicação acessível sob demanda (tooltip/definição), reduzindo a barreira de fisiologia.
- **RNF-4.3 (Should)** — Modo escuro e legibilidade de gráficos em tela pequena.

### 5.5 Acessibilidade
- **RNF-5.1 (Should)** — Conformidade com diretrizes de acessibilidade (contraste, leitor de tela, tamanho de fonte ajustável) tendendo a WCAG 2.1 AA.

### 5.6 Compatibilidade e plataformas
- **RNF-6.1 (Must)** — Apps nativos ou híbridos para **iOS e Android** com paridade de recursos essenciais.
- **RNF-6.2 (Should)** — Acesso web complementar (dashboard e gestão).
- **RNF-6.3 (Must)** — Suporte aos formatos FIT, TCX e GPX.

### 5.7 Confiabilidade do dado
- **RNF-7.1 (Must)** — Toda métrica derivada carrega um **nível de confiança** derivado da qualidade do dado bruto (PC-5); dados de baixa confiança são sinalizados, nunca silenciosamente usados como verdade.

### 5.8 Internacionalização
- **RNF-8.1 (Should)** — Arquitetura preparada para múltiplos idiomas (pt-BR no lançamento) e unidades métricas/imperiais.

### 5.9 Observabilidade e manutenção
- **RNF-9.1 (Must)** — Telemetria de produto e monitoramento do motor de métricas (erros de ingestão, taxa de dado descartado, latência de cálculo).
- **RNF-9.2 (Should)** — Versionamento da metodologia de cálculo: mudanças no motor são versionadas e rastreáveis, sem quebrar históricos.

### 5.10 Conformidade e limites clínicos
- **RNF-10.1 (Must)** — O produto não emite diagnóstico nem prescrição médica; textos e alertas respeitam esse limite e encaminham a profissional quando indicado.

---

## 6. Arquitetura de alto nível

> Nível conceitual (requisitos de produto). O detalhamento de stack, modelo de dados físico e contratos de API fica para o documento de arquitetura técnica.

**Componentes principais:**

1. **Apps cliente** (iOS, Android, web) — apresentação, onboarding, dashboard, coach conversacional.
2. **Camada de integração/ingestão** — conectores (Strava, Garmin, HealthKit, Polar, Coros, Suunto), upload de arquivos, webhooks; normaliza para o **modelo canônico**.
3. **Pipeline de qualidade de dado** — validação, limpeza, deduplicação, marcação de confiança (PC-5).
4. **Motor de métricas canônico** — cálculo das Camadas 1–3 e do sistema de zonas configurável; núcleo do diferencial competitivo.
5. **Motor de treino** — periodização, geração e adaptação de planos, regras de progressão e prevenção.
6. **Serviço de IA/coach** — camada conversacional e explicativa, ancorada nos dados do atleta.
7. **Serviços de plataforma** — contas, consentimento/LGPD, assinatura/billing, notificações, comunidade, conteúdo.
8. **Data store** — perfil (Camada 0), séries brutas, métricas derivadas versionadas, planos e histórico.

**Fluxo essencial:** dispositivo → conector → normalização → qualidade de dado → motor de métricas (canônico) → motor de treino → apresentação/coach → feedback e ajuste → volta ao atleta.

**Princípio arquitetural vinculante:** a série bruta é a fonte da verdade; métricas derivadas são recomputáveis a partir dela (permite corrigir/evoluir a metodologia sem perder histórico).

---

## 7. Roadmap por fases

Embora a especificação cubra a plataforma completa, a implementação deve ser faseada.

**Fase 1 — MVP (fundação canônica).**
Onboarding (Camada 0 essencial) + ingestão ancorada em **Strava + Garmin (FIT)** + registro manual/sRPE (Camada 4) + motor da **Camada 1** + geração e leitura de treino + carga interna básica + assinatura. Entrega útil: pace, tempo-em-zona, volume, progressão semanal e carga interna. *Módulos 1, 2 (parcial), 3 (parcial), 4, 5, 11 (básico), 16, 18.*

**Fase 2 — Inteligência de carga e prontidão.**
Camada 3 completa (TSS/CTL/ATL/TSB, ACWR, EF, decoupling) assim que houver limiares limpos por atleta; recalibração de LTHR/pace; ajuste diário por prontidão (HRV/sono); prevenção avançada; dashboards de tendência. *Módulos 3 (completo), 6, 8, 15.*

**Fase 3 — Enriquecimento premium e experiência.**
Camada 2 (dinâmica/potência), coach conversacional, nutrição integrada, estratégia de provas, comunidade, gamificação, painel do treinador. *Módulos 2 (demais conectores), 7, 9, 10, 12, 13, 17.*

---

## 8. Métricas de sucesso (KPIs)

- **Ativação:** % de novos usuários que concluem onboarding e conectam ≥1 fonte de dados.
- **Aderência:** % de treinos planejados executados por semana.
- **Qualidade da leitura:** % de sessões processadas com dado de alta confiança; latência média de feedback.
- **Evolução do atleta:** melhora de EF/paces por zona e de PRs ao longo do tempo (prova de que o motor entrega evolução real).
- **Retenção:** retenção D30/D90 e churn mensal, por segmento (competitivo vs iniciante).
- **Monetização:** conversão trial→pago, LTV, receita por canal (direto vs Wellhub).
- **NPS/satisfação**, com recorte pelo público competitivo (o segmento-alvo).

---

## 9. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Dependência de APIs de terceiros (cotas, mudança de política, verticalização da Strava) | Alto | Ancorar em FIT original; multi-fonte; abstrair conectores; upload manual como fallback. |
| Complexidade do motor canônico atrasar o lançamento | Alto | Faseamento: Camada 1 no MVP, Camada 3 depois; validar metodologia com poucas fontes primeiro. |
| Qualidade de dado ruim gerar leitura equivocada | Alto | Pipeline de qualidade (PC-5) e sinalização de confiança antes de qualquer exibição. |
| Baixa disposição a pagar no público de massa | Médio | Camadas de produto; canal Wellhub para volume; premium para o competitivo. |
| Responsabilidade em saúde (lesão, evento cardíaco) | Alto | Triagem de risco, limites clínicos claros, encaminhamento a profissional, consentimento LGPD. |
| Concorrência de UX (Runna/Strava) e de preço (Zyla/Pacer) | Médio | Diferenciar pela profundidade fisiológica + UX premium no nicho competitivo órfão. |

---

## 10. Glossário de métricas fisiológicas

- **LTHR** — Lactate Threshold Heart Rate; FC de limiar, âncora preferida para zonas de atleta sério.
- **VO2máx** — consumo máximo de oxigênio; benchmark de capacidade aeróbia.
- **Critical Speed / Critical Power (CS/CP)** — velocidade/potência sustentável de limiar; base de modelagem de capacidade.
- **TRIMP / rTSS / hrTSS** — quantificadores de **carga interna** de uma sessão.
- **CTL** (~42 dias) — Chronic Training Load; "fitness" acumulado.
- **ATL** (~7 dias) — Acute Training Load; fadiga aguda.
- **TSB** (CTL − ATL) — Training Stress Balance; forma/frescor, usado no polimento.
- **ACWR** — Acute:Chronic Workload Ratio; razão de risco de lesão (zona segura ~0,8–1,3).
- **Efficiency Factor (EF)** — pace ou potência ÷ FC; economia aeróbia.
- **Decoupling / cardiac drift** — descolamento entre FC e pace/potência ao longo do esforço; durabilidade aeróbia (< 5% = bom).
- **HRV (RMSSD)** — variabilidade da frequência cardíaca; estado autonômico/prontidão.
- **GAP** — Grade Adjusted Pace; pace ajustado ao relevo.
- **Normalized Power** — potência normalizada, corrige variações do esforço.
- **GCT** — Ground Contact Time; tempo de contato com o solo.
- **sRPE** — session RPE (RPE 0–10 × duração em minutos); carga interna sem sensor.

---

*Documento vivo. Requisitos marcados como `Should`/`Could`/`Won't (agora)` devem ser revisados a cada fase à luz de aprendizado de produto e restrições técnicas.*
