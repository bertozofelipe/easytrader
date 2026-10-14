# easytrader-data-trigger

Worker do Cloudflare que roda a cada 15 minutos e dispara o workflow [`data.yml`](../../.github/workflows/data.yml). O agendamento do próprio GitHub atrasa horas em repositórios com pouca atividade; disparos via API não sofrem esse atraso. Custo: zero (Cron Triggers estão no plano gratuito).

## Instalação (uma vez)

1. **Token do GitHub:** em github.com → Settings → Developer settings → Personal access tokens → *Fine-grained tokens* → Generate new token.
   - Repository access: *Only select repositories* → `easytrader`
   - Permissions → Repository → **Actions: Read and write**
   - Validade: até 1 ano (anote a data para renovar)
2. **Publicar o Worker** (na raiz do projeto):

   ```sh
   npx wrangler login
   npx wrangler deploy --config workers/data-trigger/wrangler.jsonc
   npx wrangler secret put GITHUB_TOKEN --config workers/data-trigger/wrangler.jsonc
   ```

   O último comando pede o token; cole quando solicitado.

   **Alternativa sem terminal (painel do Cloudflare)**, na mesma conta do site:
   Workers & Pages → Create → Worker `easytrader-data-trigger` → *Edit code*, colar `src/index.js` → Deploy;
   Settings → Trigger events → Cron `*/15 * * * *`;
   Settings → Variables and Secrets → Add, **Type: Secret** (não *Text*), nome `GITHUB_TOKEN`.
   Se o painel sugerir copiar o token para o `wrangler.jsonc`, ignore: o repositório é público.

## Renovar o token

Gere um novo token (mesmas permissões) antes do vencimento e substitua o secret `GITHUB_TOKEN` no Worker (painel ou `wrangler secret put`). Apague o token antigo no GitHub.

## Conferir

- Cloudflare → Workers & Pages → `easytrader-data-trigger` → *Logs* / *Cron events*.
- GitHub → Actions → "Dados de mercado": execuções com evento `workflow_dispatch` a cada ~15 min.
