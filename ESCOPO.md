# Site do Trader — Escopo de Planejamento

> Rascunho v0.2 — 06/10/2026.

## 0. Decisões tomadas

| Tema | Decisão |
|---|---|
| Mercado | **Global + cripto** (índices e ações EUA, forex, commodities, cripto) |
| Equipe | Solo (Felipe) |
| Orçamento | **Custo próximo de zero** (só domínio opcional, ~US$ 10/ano) |
| Monetização | Indefinida — o projeto nasce sem depender dela |
| Código | Repositório **GitHub** |
| Idioma | Português (BR) primeiro; estrutura pronta para i18n depois |
| Conteúdo da escola | Markdown/MDX no próprio repositório (sem CMS) |

## 1. Visão

Portal central para o trader acompanhar o mercado, estudar e analisar ativos em um só lugar: notícias, calendário econômico, análise de ativos, indicadores técnicos e uma escola básica de trading.

**Proposta de valor:** reduzir o número de abas abertas no dia a dia e baixar a barreira de entrada para iniciantes, em português.

## 2. Público-alvo

| Perfil | Necessidade principal |
|---|---|
| Iniciante | Aprender do zero, entender termos, evitar erros comuns |
| Day trader / swing trader | Dados rápidos: agenda, notícias, gráficos, níveis |
| Trader/investidor de cripto | Visão de mercado cripto + macro global num só lugar |

**Cobertura inicial enxuta:** principais índices (S&P 500, Nasdaq, Dow, DXY, Ibovespa como referência), ~30 ações EUA populares, forex majors, ouro/petróleo e top ~50 criptos.

## 3. Módulos (funcionalidades)

### 3.1 Notícias
- Agregador de feeds RSS com filtro por categoria (macro, ações, cripto, commodities, forex).
- Exibir título + trecho + link para a fonte (direitos autorais).
- Destaques do dia na home.

### 3.2 Calendário Econômico
- Eventos com data/hora (fuso de Brasília), país, impacto, anterior/previsão/realizado.
- MVP via widget gratuito do TradingView; versão própria depois, se necessário.
- Calendário de eventos cripto (unlocks, upgrades, halving) como fase posterior.

### 3.3 Análise de Ativos
- Página por ativo: cotação, gráfico, variação, volume, resumo técnico.
- Watchlist pessoal (localStorage).
- Screener básico e comparador (fase posterior).
- Painel cripto: Fear & Greed, dominância do BTC, top altas/baixas.

### 3.4 Indicadores de Análise Técnica
- Gráfico interativo com SMA/EMA, RSI, MACD, Bollinger, estocástico, volume, ATR, suporte/resistência.
- Resumo técnico por ativo (sinais por indicador).
- Biblioteca explicativa: o que cada indicador mede e como interpretar.

### 3.5 Escola Básica de Trading
- Trilhas: Fundamentos → Análise técnica → Gestão de risco → Psicologia → Operacional (corretoras/exchanges, ordens, custos).
- Aulas em texto + imagens, quiz opcional.
- Glossário de termos.

### 3.6 Ferramentas auxiliares
- Calculadora de risco/tamanho de posição, stop e alvo, risco-retorno.
- Conversor de moedas/cripto, calculadora de pip.
- Diário de trade simples (localStorage / export CSV) — fase posterior.

## 4. Priorização (MoSCoW)

| Prioridade | Itens |
|---|---|
| **Must (MVP)** | Calendário econômico (widget), notícias (RSS), página de ativo com gráfico + indicadores, escola (trilha inicial + glossário), páginas legais, deploy automático |
| **Should** | Watchlist local, resumo técnico, calculadora de risco, newsletter |
| **Could** | Login real, alertas por e-mail, screener, comparador, diário de trade, quiz |
| **Won't (por ora)** | Execução de ordens, sinais/recomendações personalizadas, copy trade, app nativo, dados em tempo real pagos |

## 5. Roadmap sugerido (solo, tempo parcial)

| Fase | Duração estimada | Entrega |
|---|---|---|
| 0. Setup | 1 sem | Repo GitHub, Astro + Tailwind, deploy automático, layout base, aviso de risco/termos |
| 1. Núcleo de dados | 2 sem | Coletores + Actions cron, JSON de cripto e índices, ticker na home |
| 2. Páginas-chave | 3–4 sem | Calendário (widget), notícias (RSS), página de ativo com gráfico + indicadores |
| 3. Escola v1 | 3 sem | Trilha "Fundamentos" (8–10 aulas) + glossário (50 termos) + biblioteca de indicadores |
| 4. Ferramentas | 2 sem | Calculadora de risco, watchlist em localStorage |
| 5. Lançamento | 1 sem | Analytics, SEO/sitemap, newsletter, divulgação |
| 6. Evolução | contínuo | Screener, diário de trade, mais aulas, i18n |

Total até o MVP: **~12–14 semanas** em ritmo solo e parcial. Conteúdo da escola é o gargalo e pode rodar em paralelo.

## 6. Arquitetura e stack (custo zero)

**Princípio:** site 100% estático, sem servidor próprio. Dados atualizados por jobs agendados no GitHub Actions que gravam JSON no repositório; o navegador só lê arquivos estáticos.

```
GitHub Actions (cron) -> busca APIs gratuitas -> grava /data/*.json -> commit
                                                                  |
Cloudflare Pages / GitHub Pages <- build (Astro) <----------------+
        |
        +- navegador: HTML estático + JS (gráficos, widgets, localStorage)
```

- **Front-end:** **Astro** (conteúdo + SEO, ideal para escola/glossário em Markdown) com ilhas em React/Preact para gráficos e calculadoras.
- **Estilo:** Tailwind, tema escuro por padrão.
- **Gráficos:** TradingView **Lightweight Charts** (open source) para dados próprios; widgets gratuitos do TradingView (calendário, mapa de calor, resumo técnico, ticker) para entregar rápido.
- **Indicadores técnicos:** calculados no cliente com biblioteca JS (ex.: `technicalindicators`) a partir de candles.
- **Dados:** JSON versionado em `/data`, atualizado por GitHub Actions (cron a cada 15–60 min). Repositório público = minutos de Actions ilimitados.
- **Conta/watchlist (MVP):** `localStorage`, sem login. Login só se houver necessidade real (Supabase free ou Cloudflare D1).
- **Hospedagem:** **Cloudflare Pages** (grátis, banda ilimitada, CDN) com deploy automático do GitHub; GitHub Pages como alternativa.
- **Serverless (se precisar):** Cloudflare Workers free (100 mil req/dia) para proxy/cache.
- **Analytics:** Cloudflare Web Analytics ou Plausible; sem cookies, sem banner.
- **Domínio:** opcional; começar em `*.pages.dev`.

### Estrutura do repositório

```
/src/pages         páginas (home, calendário, ativos, escola...)
/src/content       escola, glossário, indicadores (Markdown)
/src/components    gráficos, calculadoras, widgets
/data              JSON gerado pelos jobs (cotações, notícias)
/scripts           coletores de dados (Node), um provider por fonte
/.github/workflows cron de dados + CI
```

## 7. Fontes de dados (gratuitas)

| Dado | Fonte recomendada | Observação |
|---|---|---|
| Cripto (preços, candles, market cap) | **CoinGecko** (free), **Binance** API pública | Sem custo; respeitar rate limit |
| Ações/índices EUA, forex, commodities | **Twelve Data**, **Finnhub**, **Alpha Vantage** (planos free) | Limites baixos; cache obrigatório; dados com delay |
| Calendário econômico | **Widget TradingView** | Zero manutenção; alternativa: Finnhub free |
| Notícias | **RSS** (Reuters, CoinDesk, Cointelegraph, FXStreet...) | Só título + trecho + link |
| Fear & Greed, dominância BTC | Alternative.me, CoinGecko | APIs públicas simples |
| Resumo técnico | Widgets TradingView | Gratuitos, com marca TradingView |

**Cache:** os Actions buscam em lote e gravam JSON; o site nunca chama APIs com chave. Chaves ficam em *GitHub Secrets*.

**Risco:** free tiers mudam ou têm limites. Mitigação: um *provider* por fonte em `scripts/providers/`, fácil de trocar; dados sempre com selo "atualizado em" e aviso de delay.

## 8. Aspectos legais e de compliance

- Conteúdo **educacional e informativo**; sem sinais, sem recomendação personalizada, sem promessa de ganho.
- **Aviso de risco** visível em todo o site: "Não constitui recomendação de investimento". Cripto: destacar volatilidade e risco de perda total.
- Publicar recomendações de valores mobiliários no Brasil exige credenciamento (Resolução CVM 20); manter o caráter educacional e validar com advogado se mudar de rumo.
- **LGPD:** política de privacidade e termos de uso; analytics sem cookies evita banner de consentimento.
- **Direitos autorais:** não replicar notícias na íntegra; respeitar licenças e atribuição dos provedores de dados e widgets.
- Afiliados futuros exigem transparência de publicidade.

## 9. Monetização

**Decisão:** sem monetização por enquanto. Construir audiência primeiro (SEO + conteúdo). Preparação sem custo:
- Espaços de anúncio reservados no layout (desligados).
- Newsletter (Buttondown/Substack free) para capturar e-mails.
- Página `/parceiros` pronta para afiliados de exchanges/corretoras.
- Reavaliar com ~5 mil visitas/mês.

Opções futuras: display ads, afiliados (exchanges, corretoras, ferramentas), newsletter patrocinada, plano premium (alertas, screener), cursos.

## 10. Requisitos não funcionais

- Mobile-first e responsivo; tema escuro/claro.
- Performance: LCP < 2,5 s; tudo estático e em CDN.
- SEO: páginas por ativo, glossário e aulas indexáveis (principal canal de aquisição).
- Acessibilidade (WCAG AA).
- Segurança: HTTPS, chaves só em Secrets, nenhuma chave no front-end.
- Resiliência: se uma API falhar, o job mantém o último JSON válido.

## 11. Métricas de sucesso

- Visitantes únicos/mês e retorno semanal.
- Páginas por sessão e tempo na página.
- Inscritos na newsletter.
- Aulas concluídas / páginas da escola mais lidas.
- Posições orgânicas no Google para termos-alvo.

## 12. Riscos principais

| Risco | Impacto | Mitigação |
|---|---|---|
| Limites/mudanças das APIs gratuitas | Alto | Cache via Actions, providers trocáveis, selo de delay |
| Questões regulatórias | Alto | Conteúdo educacional, disclaimers, consulta jurídica |
| Mercado saturado (TradingView, Investing, CoinMarketCap) | Médio | Nicho: português, didático, macro + cripto juntos |
| Escopo crescer demais (projeto solo) | Médio | Seguir MoSCoW, lançar MVP enxuto |
| Produção de conteúdo da escola | Médio | Começar com 10 aulas essenciais; usar IA como rascunho, sempre revisado |
| Cron de Actions pode atrasar | Baixo | Mostrar sempre "atualizado em" |

## 13. Próximos passos

1. Definir o nome do projeto e criar o repositório no GitHub (público recomendado, por causa dos minutos ilimitados de Actions).
2. Gerar o esqueleto Astro + Tailwind e conectar deploy ao Cloudflare Pages.
3. Prova de conceito: Action cron buscando CoinGecko -> `data/crypto.json` -> gráfico na home.
4. Cadastrar contas gratuitas nas APIs (Twelve Data, Finnhub) e guardar chaves em GitHub Secrets.
5. Pesquisar 3–5 concorrentes e fechar o diferencial.
6. Escrever as primeiras 3 aulas e 20 termos do glossário.

**Ainda em aberto:** nome do projeto; repositório público ou privado.

## 14. Estrutura do site (sitemap inicial)

```
/                      Home (resumo do dia: agenda, destaques, índices, cripto)
/noticias              Lista + filtros
/calendario            Calendário econômico
/ativos                Busca / screener
/ativos/[ticker]       Página do ativo (gráfico + indicadores)
/cripto                Painel cripto (Fear & Greed, dominância, top moedas)
/indicadores           Biblioteca de indicadores técnicos
/escola                Trilhas
/escola/[trilha]/[aula]
/glossario
/ferramentas           Calculadoras
/sobre  /termos  /privacidade  /aviso-de-risco
```
