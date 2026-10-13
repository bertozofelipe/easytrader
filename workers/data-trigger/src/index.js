// Cloudflare Worker com Cron Trigger: a cada 15 min pede ao GitHub para rodar
// o workflow de dados (workflow_dispatch). Necessário porque o agendamento
// nativo do GitHub Actions atrasa muito em repositórios de pouca atividade.
//
// Secret necessário: GITHUB_TOKEN (fine-grained, só este repo, Actions: read/write).

const REPO = 'bertozofelipe/easytrader';
const WORKFLOW = 'data.yml';

async function dispatch(env) {
  const res = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': 'easytrader-data-trigger',
    },
    body: JSON.stringify({ ref: 'main' }),
  });
  if (res.status !== 204) {
    throw new Error(`GitHub respondeu ${res.status}: ${await res.text()}`);
  }
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(dispatch(env));
  },

  // Sem rota pública: qualquer requisição HTTP só informa o propósito do Worker.
  async fetch() {
    return new Response('easytrader data trigger', { status: 200 });
  },
};
