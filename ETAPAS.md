# Easytrader — Etapas

Acompanhamento do desenvolvimento. Detalhes de cada módulo em [ESCOPO.md](ESCOPO.md).

Legenda: ✅ feito · 🔄 em andamento · ⬜ a fazer · 👤 depende de ação sua

## Etapa 0 — Setup ✅ (06/10/2026)

- ✅ Projeto Astro 7 + Tailwind 4 + sitemap
- ✅ Layout base: header com menu (desktop e mobile), footer, SEO (title, description, Open Graph, canonical)
- ✅ Tema escuro com tokens de cor (alta/baixa/alerta)
- ✅ Aviso de risco em todas as páginas + páginas de aviso de risco, termos, privacidade (rascunhos), sobre e 404
- ✅ Páginas iniciais de todas as seções, com o que vem em cada etapa
- ✅ Escola e glossário com coleções de conteúdo em Markdown (1 aula e 2 termos de exemplo)
- ✅ CI no GitHub Actions (checagem de tipos + build)
- ✅ Repositório git local com o primeiro commit
- ✅ Repositório público no GitHub: https://github.com/bertozofelipe/easytrader
- ✅ Deploy automático no Cloudflare (Workers): https://easytrader.lf-bertozo.workers.dev

## Etapa 1 — Núcleo de dados ✅ (13/10/2026)

- ✅ `scripts/` com um *provider* por fonte: CoinGecko, alternative.me (Fear & Greed), Frankfurter (câmbio BCE), Finnhub (EUA)
- ✅ GitHub Action a cada 15 min publicando os JSON no branch órfão `data` (1 commit, sem rebuild do site)
- ✅ Fallback: se uma fonte falhar, reaproveita o último JSON publicado marcado como `stale`
- ✅ Top 50 cripto + dados globais, Fear & Greed, câmbio (EUR, GBP, JPY, BRL)
- ✅ Faixa de cotações em todas as páginas, atualizada no navegador a cada 5 min, com "atualizado há X min"
- ✅ Finnhub ativa (secret `FINNHUB_API_KEY`): ETFs de índices, ouro, petróleo e 7 ações dos EUA
- ✅ Worker com Cron Trigger em `workers/data-trigger/` (o cron do GitHub rodava em média a cada ~5,5 h)
- ✅ Worker publicado pelo painel do Cloudflare com o secret `GITHUB_TOKEN`; disparando a cada 15 min desde 14/10/2026
- 👤 Renovar o token do GitHub antes de vencer (validade de 1 ano, até ~10/2027)

## Etapa 2 — Cripto e ativos ✅ (13/10/2026)

- ✅ Cadastro único de ativos em `src/data/assets.ts` (site e coletores usam a mesma lista)
- ✅ Painel `/cripto`: valor de mercado, volume, dominância BTC/ETH, Fear & Greed com 30 dias, maiores altas/baixas, top 50 com mini-gráfico de 7 dias
- ✅ Lista `/ativos` por grupo (índices/commodities, ações EUA, câmbio, cripto)
- ✅ 29 páginas `/ativos/[slug]`: cotação e estatísticas; cripto com gráfico próprio (Lightweight Charts + candles da Binance, 1H/4H/1D/1S); ações, ETFs e câmbio com widget do TradingView
- ✅ Itens da faixa de cotações levam à página do ativo
- ✅ Tudo atualiza no navegador a cada 5 min

## Etapa 3 — Notícias e calendário ✅ (13/10/2026)

- ✅ Coletor de RSS sem dependências → `news.json` (10 feeds: 4 em português, 6 em inglês; últimas 48 h; sem duplicadas)
- ✅ `/noticias` com filtros por categoria (mercados globais, Brasil, forex, cripto) e idioma, lembrados no navegador
- ✅ `/calendario` com widget do TradingView (EUA, zona do euro, Reino Unido, Japão, China, Brasil) + guia de 9 eventos (Payroll, CPI, FOMC, PCE, PIB, PMI, seguro-desemprego, BCE, Copom)
- ✅ Home com destaques do dia: últimas notícias (metade em português), mercado agora, medo e ganância, atalho para a agenda
- ⬜ Opcional: fonte de forex em português

## Etapa 4 — Indicadores técnicos ✅ (13/10/2026)

- ✅ Biblioteca própria de indicadores (`src/lib/indicators.ts`): SMA, EMA, Bollinger, RSI (Wilder) e MACD, conferidos com valores de referência
- ✅ Gráfico cripto com MM 20/50/200, Bollinger, RSI e MACD (painéis próprios), liga/desliga lembrado no navegador
- ✅ "Leitura dos indicadores" no diário para cada cripto (viés de alta/baixa/neutro, sem recomendação)
- ✅ Ações, ETFs e câmbio: indicadores pelo botão do gráfico do TradingView
- ✅ `/indicadores` com 8 guias: médias móveis, RSI, MACD, Bollinger, estocástico, ATR, volume, suporte e resistência
- ✅ VIX (Cboe, pontos do índice, 15 min de atraso) em "Índices e commodities"

## Etapa 5 — Escola v1 e ferramentas 🔄 (ferramentas prontas em 13/10/2026; aulas adiadas)

- ⬜ Trilha "Fundamentos" com 8–10 aulas
- ⬜ Glossário com ~50 termos
- ✅ `/ferramentas`: calculadora de tamanho de posição e risco-retorno (compra ou venda pelo lado do stop, exposição/alavancagem, acerto mínimo para empatar, preenche a entrada com a cotação de qualquer ativo do cadastro; lembra capital e risco)
- ✅ Watchlist no navegador: estrela nas listas de `/ativos` e botão "Acompanhar" na página do ativo; bloco "Sua lista" em `/ativos` e na home (só aparece se tiver ativos), sincronizado entre abas
- ✅ Conversor entre 11 moedas (referência do BCE) e as 50 maiores cripto, com inversão e par lembrado no navegador
- ✅ Calculadora de pip: 14 pares (principais, cruzados, USD/BRL e USD/MXN), valor por lote padrão/mini/micro na moeda da conta e valor de um movimento em pips
- ✅ `fx.json` passou a trazer `rates` (1 USD = x moeda) para as 11 moedas, usado pelas duas ferramentas

## Termômetro técnico ✅ (14/10/2026)

- ✅ Histórico diário: Binance (cripto), Cboe (ações, ETFs e VIX, sem chave), BCE/Frankfurter (câmbio, só fechamentos)
- ✅ `signals.json` no branch `data`, recalculado a cada 4 h pelo coletor (19 indicadores × 30 ativos, ~40 KB)
- ✅ Indicadores novos conferidos com a biblioteca `technicalindicators`: estocástico, CCI, ADX (+DI/−DI), momento
- ✅ Faixas: forte alta · alta · neutro · baixa · forte baixa (viés, sem "compra/venda": conteúdo educacional e regra da CVM para recomendações)
- ✅ Página do ativo: mostrador do resumo + médias móveis e osciladores, tabela dos 19 indicadores e "Como é calculado" (substitui a "Leitura dos indicadores" só de cripto)
- ✅ `/ativos`: etiqueta do viés em cada ativo
- ✅ Timeframes 15 min, 1H, 4H e diário no termômetro (seletor lembrado no navegador); intradiário em `signals-intraday.json`, recalculado a cada coleta
- ✅ Cripto intradiário pela Binance; ações, ETFs e câmbio pela Twelve Data (barras de 15 min agrupadas em 1H/4H, conferidas com as barras nativas); VIX só diário
- 👤 Criar conta gratuita na Twelve Data e cadastrar o secret `TWELVEDATA_API_KEY` no GitHub (sem ele, ações/ETFs/câmbio mostram só o diário). Uso estimado: ~570 de 800 consultas/dia

## Idiomas (português e inglês) 🔄 (primeira leva em 14/10/2026)

- ✅ Português na raiz, inglês em `/en/` com endereços traduzidos (`/en/news`, `/en/calendar`, `/en/assets`, `/en/crypto`, `/en/tools`…); rotas em `src/i18n/index.ts`
- ✅ Seletor PT | EN no topo (leva à mesma página no outro idioma); `hreflang`, `og:locale` e `<html lang>` por idioma
- ✅ Corpo das páginas em `src/views/` (um componente por página, usado pelas duas rotas); textos comuns em `src/i18n/ui.ts`
- ✅ Números, datas, "US$"/"$" e tempo relativo no formato de cada idioma; calculadoras leem "10.000"/"10,000" conforme o idioma
- ✅ Em inglês: home, notícias (padrão: só em inglês), calendário, ativos (30 páginas), cripto, ferramentas, termômetro, sobre, aviso de risco, termos e privacidade
- ✅ Calendário: seletor "Português | English" só do widget, lembrado no navegador; `/calendario` abre em português e `/en/calendar` em inglês
- ✅ 8 guias de indicadores em inglês (`/en/indicators/moving-averages`…) e glossário (`/en/glossary`); coleções `indicatorsEn` e `glossaryEn`, ligadas ao português pelo campo `pt` / mesmo id
- ✅ Guia dos 9 eventos do calendário em inglês (`EVENTS_EN` em `src/data/eventos.ts`, horários no fuso local de cada mercado)
- ⬜ Sitemap com alternâncias de idioma (o plugin só pareia URLs com o mesmo caminho; os nossos são traduzidos)

## Etapa 6 — Lançamento ⬜ (~1 semana)

- ⬜ Analytics sem cookies (Cloudflare Web Analytics)
- ⬜ Revisão de SEO, performance e acessibilidade
- ⬜ Revisar termos e privacidade
- ⬜ Newsletter (Buttondown/Substack grátis)
- 👤 Opcional: comprar domínio próprio

## Depois do lançamento

Screener, comparador, diário de trade, mais trilhas da escola, alertas, i18n, monetização.
