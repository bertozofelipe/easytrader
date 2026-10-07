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
- 👤 Criar repositório público `easytrader` no GitHub e fazer o push
- 👤 Conectar o repositório ao Cloudflare Pages (build: `npm run build`, saída: `dist`)

## Etapa 1 — Núcleo de dados ⬜ (~2 semanas)

- ⬜ Pasta `scripts/` com um *provider* por fonte (CoinGecko primeiro)
- ⬜ GitHub Action agendada (cron) que gera `data/*.json` e faz commit
- ⬜ Cotações de cripto (top 50) e principais índices/moedas
- ⬜ Faixa de cotações (ticker) na home com selo "atualizado em"
- 👤 Criar contas gratuitas em Twelve Data e Finnhub e salvar as chaves em GitHub Secrets

## Etapa 2 — Cripto e ativos ⬜ (~2 semanas)

- ⬜ Painel `/cripto`: top moedas, dominância BTC, Fear & Greed, maiores altas/baixas
- ⬜ Lista `/ativos` com variação do dia
- ⬜ Página por ativo `/ativos/[ticker]` com gráfico (Lightweight Charts)

## Etapa 3 — Notícias e calendário ⬜ (~2 semanas)

- ⬜ Coletor de RSS → `data/noticias.json`, com filtros por categoria
- ⬜ Calendário econômico (widget TradingView) + explicação dos eventos principais
- ⬜ Destaques do dia na home

## Etapa 4 — Indicadores técnicos ⬜ (~2 semanas)

- ⬜ Indicadores no gráfico do ativo (SMA/EMA, RSI, MACD, Bollinger, ATR)
- ⬜ Resumo técnico por ativo
- ⬜ Biblioteca `/indicadores` com uma página por indicador

## Etapa 5 — Escola v1 e ferramentas ⬜ (~3 semanas, conteúdo pode andar em paralelo)

- ⬜ Trilha "Fundamentos" com 8–10 aulas
- ⬜ Glossário com ~50 termos
- ⬜ Calculadora de tamanho de posição / risco-retorno
- ⬜ Watchlist salva no navegador

## Etapa 6 — Lançamento ⬜ (~1 semana)

- ⬜ Analytics sem cookies (Cloudflare Web Analytics)
- ⬜ Revisão de SEO, performance e acessibilidade
- ⬜ Revisar termos e privacidade
- ⬜ Newsletter (Buttondown/Substack grátis)
- 👤 Opcional: comprar domínio próprio

## Depois do lançamento

Screener, comparador, diário de trade, mais trilhas da escola, alertas, i18n, monetização.
