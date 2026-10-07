const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * GET JSON com timeout e retentativas (backoff simples; respeita 429).
 */
export async function getJson(url, { headers = {}, retries = 3, timeoutMs = 20_000 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { accept: 'application/json', 'user-agent': 'easytrader-data-bot', ...headers },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) return await res.json();
      lastError = new Error(`HTTP ${res.status} em ${redact(url)}`);
      if (res.status !== 429 && res.status < 500) break;
    } catch (err) {
      lastError = err;
    }
    if (attempt < retries) await sleep(2 ** attempt * 2_000);
  }
  throw lastError;
}

export { sleep };

// Esconde tokens que vão na query string antes de logar.
const redact = (url) => url.replace(/(token|apikey|api_key)=[^&]+/gi, '$1=***');
