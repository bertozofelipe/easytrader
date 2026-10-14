@AGENTS.md

## Projeto

Easytrader — portal para traders (mercado global + cripto), em português. Escopo em `ESCOPO.md`, andamento em `ETAPAS.md`.

- Restrição principal: **custo zero**. Site estático; nada de servidor próprio ou serviço pago.
- Dados de mercado chegam via GitHub Actions que gravam JSON em `/data`; chaves de API só em GitHub Secrets, nunca no front-end.
- Conteúdo é educacional: nunca escrever recomendações de compra/venda ou promessas de ganho.
- Textos voltados ao usuário em português (pt-BR) e inglês: português na raiz, inglês em `/en/`. Texto novo de interface precisa das duas versões (`src/i18n/ui.ts` ou o dicionário `T` da view em `src/views/`).
