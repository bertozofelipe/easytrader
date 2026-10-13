import { getJson, sleep } from '../lib/http.mjs';

/**
 * Índices calculados pela Cboe (ex.: VIX), cotações públicas com 15 min de atraso.
 * `last_trade_time` vem no horário de Nova York, sem fuso.
 */
export async function fetchCboeIndices(assets) {
  const quotes = [];
  for (const a of assets) {
    const { data: q } = await getJson(`https://cdn-api.cboe.com/api/global/delayed_quotes/quotes/${a.cboe}.json`);
    quotes.push({
      symbol: a.symbol,
      name: a.name,
      kind: a.kind,
      price: q.current_price,
      prevClose: q.prev_day_close,
      open: q.open,
      high: q.high,
      low: q.low,
      changePct: q.price_change_percent,
      asOf: q.last_trade_time,
      ticker: Boolean(a.ticker),
    });
    await sleep(500);
  }
  return { source: 'Cboe', quotes };
}
