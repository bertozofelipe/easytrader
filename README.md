# Easytrader

O dia a dia do trader em um só lugar: notícias, calendário econômico, análise de ativos, indicadores técnicos e uma escola de trading. Foco em mercado global e cripto, em português.

Site 100% estático (Astro + Tailwind), com custo zero de infraestrutura. Veja o [escopo](ESCOPO.md) e as [etapas](ETAPAS.md).

## Rodando localmente

Requer Node 22.12+.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # gera ./dist
npm run preview  # serve o build
npm run check    # checagem de tipos
```

## Estrutura

```text
src/
  pages/        rotas do site
  layouts/      layout base (header, footer, SEO)
  components/   componentes reutilizáveis
  content/      escola (aulas) e glossário em Markdown
  data/         dados estáticos (trilhas etc.)
  config.ts     nome, navegação e links
public/         arquivos estáticos
.github/        CI (e, em breve, jobs de dados)
```

## Dados de mercado

O workflow [`data.yml`](.github/workflows/data.yml) roda a cada 15 min, executa `scripts/fetch-data.mjs` e publica os JSON no branch `data` (sempre um único commit). O site lê de `https://raw.githubusercontent.com/bertozofelipe/easytrader/data/<arquivo>.json`.

| Arquivo | Conteúdo | Fonte |
|---|---|---|
| `crypto.json` | Top 50 cripto + dados globais (dominância, market cap) | CoinGecko |
| `sentiment.json` | Fear & Greed (30 dias) | alternative.me |
| `fx.json` | EUR/USD, GBP/USD, USD/JPY, USD/BRL (diário) | BCE via Frankfurter |
| `us.json` | ETFs de índices, ouro, petróleo e ações dos EUA | Finnhub (requer chave) |
| `ticker.json` | Itens da faixa de cotações | derivado dos anteriores |
| `status.json` | Situação de cada coleta | — |

Secrets do repositório (Settings → Secrets and variables → Actions): `FINNHUB_API_KEY` (obrigatória para dados dos EUA) e `COINGECKO_API_KEY` (opcional, chave demo).

Para rodar localmente: `npm run data -- --out .data-out` (com `FINNHUB_API_KEY` no ambiente, se tiver).

Ativos coletados ficam em [`scripts/config.mjs`](scripts/config.mjs).

## Escrevendo conteúdo

- **Aula nova:** crie `src/content/escola/<trilha>/<slug>.md` com `title`, `description`, `trilha` e `ordem` no frontmatter.
- **Termo novo:** crie `src/content/glossario/<slug>.md` com `termo`, `resumo` e `relacionados` (slugs de outros termos).

## Aviso

Conteúdo educacional e informativo. Não constitui recomendação de investimento.
