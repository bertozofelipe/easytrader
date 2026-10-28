import { getJson } from '../lib/http.mjs';

// Fechamentos diários dos mercados da análise intermercados: Yahoo Finance
// (API não oficial, gratuita, sem chave; uma chamada para todos os símbolos).
// O calendário é o dos pregões do S&P 500; cada série traz o fechamento de cada
// data ou null (feriado local). O último ponto pode ser o pregão em andamento.

const YAHOO = 'https://query1.finance.yahoo.com/v7/finance/spark';
const RANGE = '2y';

// Data no fuso da bolsa (o deslocamento atual da API ignora o horário de verão passado).
const localDate = (ts, timeZone) => new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date(ts * 1000));

export async function fetchIntermarket(series) {
  const symbols = series.map((s) => s.yahoo);
  const { spark } = await getJson(`${YAHOO}?symbols=${symbols.map(encodeURIComponent).join(',')}&range=${RANGE}&interval=1d`, { retries: 2 });

  const bySymbol = new Map();
  for (const r of spark?.result ?? []) {
    const x = r.response?.[0];
    const closes = x?.indicators?.quote?.[0]?.close;
    if (!x?.timestamp || !closes) continue;
    const tz = x.meta?.exchangeTimezoneName ?? 'UTC';
    const byDate = new Map();
    x.timestamp.forEach((ts, i) => closes[i] > 0 && byDate.set(localDate(ts, tz), closes[i]));
    bySymbol.set(r.symbol, byDate);
  }

  const master = bySymbol.get(series[0].yahoo);
  if (!master?.size) throw new Error(`Yahoo não devolveu ${series[0].yahoo}`);
  const dates = [...master.keys()].sort();

  const failed = [];
  const out = {};
  for (const s of series) {
    const byDate = bySymbol.get(s.yahoo);
    if (!byDate?.size) {
      failed.push(s.id);
      continue;
    }
    out[s.id] = dates.map((d) => (byDate.has(d) ? Math.round(byDate.get(d) * 1e4) / 1e4 : null));
  }

  return { source: 'Yahoo Finance', failed, dates, series: out };
}
