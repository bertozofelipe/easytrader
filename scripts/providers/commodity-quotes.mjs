import { getJson } from '../lib/http.mjs';

// Cotações de commodities: futuros no Yahoo Finance (API não oficial, gratuita,
// sem chave; uma chamada para todos os símbolos). Se um metal faltar na
// resposta, usa o preço à vista da gold-api.com (gratuita e aberta), sem variação.

const YAHOO = 'https://query1.finance.yahoo.com/v7/finance/spark';
const GOLD_API = 'https://api.gold-api.com/price';

async function yahooQuotes(symbols) {
  const { spark } = await getJson(`${YAHOO}?symbols=${symbols.map(encodeURIComponent).join(',')}&range=1d&interval=1d`, { retries: 2 });
  const out = new Map();
  for (const r of spark?.result ?? []) {
    const m = r.response?.[0]?.meta;
    if (!m || !(m.regularMarketPrice > 0)) continue;
    // Grãos, boi, café e açúcar vêm em centavos de dólar.
    const k = m.currency === 'USX' ? 100 : 1;
    const round = (v) => Math.round((v / k) * 1e6) / 1e6;
    const price = round(m.regularMarketPrice);
    const prevClose = m.chartPreviousClose > 0 ? round(m.chartPreviousClose) : null;
    out.set(r.symbol, {
      price,
      prevClose,
      changePct: prevClose ? ((price - prevClose) / prevClose) * 100 : null,
      asOf: new Date(m.regularMarketTime * 1000).toISOString(),
      source: 'Yahoo Finance',
    });
  }
  return out;
}

async function spotQuote(symbol) {
  const q = await getJson(`${GOLD_API}/${symbol}`, { retries: 1 });
  if (!(q.price > 0)) throw new Error(`gold-api: ${symbol} sem preço`);
  return { price: q.price, prevClose: null, changePct: null, asOf: q.updatedAt, source: 'gold-api.com', spot: true };
}

/**
 * Se o Yahoo falhar por inteiro, o erro sobe e o coletor reaproveita o último
 * arquivo publicado (marcado como desatualizado), em vez de mostrar só os metais.
 */
export async function fetchCommodityQuotes(defs) {
  const yahoo = await yahooQuotes(defs.map((d) => d.yahoo));
  if (yahoo.size === 0) throw new Error('Yahoo não devolveu cotações');

  const failed = [];
  const quotes = [];
  for (const d of defs) {
    let q = yahoo.get(d.yahoo);
    if (!q && d.spot) q = await spotQuote(d.spot).catch((err) => (console.warn(`  commodities: ${err.message}`), null));
    if (!q) {
      failed.push(d.yahoo);
      continue;
    }
    quotes.push({ symbol: d.yahoo, ...q });
  }

  return { source: [...new Set(quotes.map((q) => q.source))].join(' + '), failed, quotes };
}
