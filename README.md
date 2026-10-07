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

## Escrevendo conteúdo

- **Aula nova:** crie `src/content/escola/<trilha>/<slug>.md` com `title`, `description`, `trilha` e `ordem` no frontmatter.
- **Termo novo:** crie `src/content/glossario/<slug>.md` com `termo`, `resumo` e `relacionados` (slugs de outros termos).

## Aviso

Conteúdo educacional e informativo. Não constitui recomendação de investimento.
