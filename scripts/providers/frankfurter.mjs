import { getJson } from '../lib/http.mjs';

/**
 * Câmbio de referência do BCE (Frankfurter). Atualiza uma vez por dia útil.
 * Busca os últimos ~10 dias para calcular a variação contra o dia útil anterior.
 * `rates` traz o último valor de cada moeda de `currencies` (1 USD = x moeda),
 * usado pelo conversor e pela calculadora de pip.
 */
export async function fetchFx(pairs, currencies = []) {
  const start = new Date(Date.now() - 10 * 86_400_000).toISOString().slice(0, 10);
  const codes = [...new Set([...pairs.map((p) => p.code), ...currencies])].filter((c) => c !== 'USD').join(',');
  const { rates } = await getJson(`https://api.frankfurter.dev/v1/${start}..?base=USD&symbols=${codes}`);

  const dates = Object.keys(rates).sort();
  if (dates.length < 2) throw new Error('Frankfurter: histórico insuficiente');
  const [prevDate, lastDate] = dates.slice(-2);

  const quotes = pairs.map((p) => {
    const value = (d) => (p.invert ? 1 / rates[d][p.code] : rates[d][p.code]);
    const price = value(lastDate);
    const prev = value(prevDate);
    return {
      symbol: p.label,
      name: p.label,
      kind: 'fx',
      price,
      prevClose: prev,
      changePct: ((price - prev) / prev) * 100,
      asOf: lastDate,
      ticker: p.ticker,
    };
  });

  return { source: 'BCE (Frankfurter)', quotes, rates: { base: 'USD', date: lastDate, values: rates[lastDate] } };
}
