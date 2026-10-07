import { getJson, sleep } from '../lib/http.mjs';

/**
 * Cotações de ações/ETFs dos EUA (Finnhub, plano free: 60 req/min, sem tempo real garantido).
 * Requer FINNHUB_API_KEY; sem chave o coletor é pulado.
 */
export async function fetchUsQuotes(symbols) {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) throw new Error('FINNHUB_API_KEY não configurada');

  const quotes = [];
  for (const s of symbols) {
    const q = await getJson(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(s.symbol)}&token=${token}`);
    // Finnhub devolve zeros para símbolos inválidos.
    if (!q || !q.c) {
      console.warn(`  finnhub: sem dados para ${s.symbol}`);
      continue;
    }
    quotes.push({
      symbol: s.symbol,
      name: s.name,
      kind: s.kind,
      price: q.c,
      prevClose: q.pc,
      open: q.o,
      high: q.h,
      low: q.l,
      changePct: q.dp,
      asOf: new Date(q.t * 1000).toISOString(),
      ticker: s.ticker,
    });
    await sleep(1_100);
  }
  return { source: 'Finnhub', quotes };
}
