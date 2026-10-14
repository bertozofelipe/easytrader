import { getJson, sleep } from '../lib/http.mjs';
import { aggregate, usSessionOpen } from '../lib/candles.mjs';
import { PREVIOUS_DATA_URL } from '../config.mjs';
import { computeGauge, GAUGE_MIN_CANDLES } from '../../src/lib/gauge.ts';

/** Timeframes intradiários do termômetro (o diário fica em signals.json). */
export const INTRADAY_TFS = [
  { id: '15m', minutes: 15, binance: '15m' },
  { id: '1h', minutes: 60, binance: '1h' },
  { id: '4h', minutes: 240, binance: '4h' },
];

const MIN = 60_000;
// Plano gratuito da Twelve Data: 8 consultas por minuto e 800 por dia.
const TWELVE_GAP_MS = 8_000;
const FX_EVERY_MS = 29 * MIN;
const STOCK_OFF_SESSION_MS = 12 * 60 * MIN;

/** Cripto: candles da Binance no timeframe, só os já fechados. */
async function binanceCandles(pair, interval) {
  const rows = await getJson(`https://data-api.binance.vision/api/v3/klines?symbol=${pair}&interval=${interval}&limit=500`);
  return rows.filter((r) => r[6] < Date.now()).map((r) => ({ t: new Date(r[6] + 1).toISOString(), h: +r[2], l: +r[3], c: +r[4] }));
}

/** Ações, ETFs e câmbio: 5.000 barras de 15 min (UTC) da Twelve Data. */
async function twelveData15m(symbol, apiKey) {
  const params = new URLSearchParams({ symbol, interval: '15min', outputsize: '5000', timezone: 'UTC', order: 'asc', apikey: apiKey });
  const d = await getJson(`https://api.twelvedata.com/time_series?${params}`, { retries: 1 });
  if (d.status !== 'ok') throw new Error(`Twelve Data: ${d.code ?? ''} ${d.message ?? 'resposta inválida'}`.slice(0, 160));
  return d.values.map((v) => ({ start: Date.parse(`${v.datetime.replace(' ', 'T')}Z`), h: +v.high, l: +v.low, c: +v.close }));
}

function gauges(byTf) {
  const out = { computedAt: new Date().toISOString() };
  for (const tf of INTRADAY_TFS) {
    const candles = byTf[tf.id];
    if (candles && candles.length >= GAUGE_MIN_CANDLES) out[tf.id] = computeGauge(candles);
  }
  if (!INTRADAY_TFS.some((tf) => out[tf.id])) throw new Error('histórico intradiário curto');
  return out;
}

/**
 * Recalcula a Twelve Data só quando vale a pena, para caber no plano gratuito:
 * ações e ETFs a cada coleta durante o pregão (e 2x por dia fora dele); câmbio a cada 30 min.
 */
function due(asset, prev, now) {
  if (!prev?.computedAt) return true;
  const age = now - new Date(prev.computedAt).getTime();
  if (asset.kind === 'fx') return age >= FX_EVERY_MS;
  return usSessionOpen(now) || age >= STOCK_OFF_SESSION_MS;
}

/**
 * Termômetro técnico em 15 min, 1H e 4H. Cripto: Binance, a cada coleta.
 * Ações, ETFs e câmbio: Twelve Data (precisa de TWELVEDATA_API_KEY); sem a
 * chave, ou fora da hora de atualizar, reaproveita o cálculo anterior. VIX: só diário.
 */
export async function fetchSignalsIntraday(assets) {
  const apiKey = process.env.TWELVEDATA_API_KEY;
  const previous = await getJson(`${PREVIOUS_DATA_URL}/signals-intraday.json`, { retries: 1 }).catch(() => null);
  const now = Date.now();
  const out = {};
  const failed = [];
  let twelveCalls = 0;

  for (const a of assets) {
    const prev = previous?.assets?.[a.slug];
    try {
      if (a.binance) {
        const byTf = {};
        for (const tf of INTRADAY_TFS) {
          byTf[tf.id] = await binanceCandles(a.binance, tf.binance);
          await sleep(200);
        }
        out[a.slug] = gauges(byTf);
      } else if (!a.cboe) {
        if (!apiKey || !due(a, prev, now)) {
          if (prev) out[a.slug] = prev;
          continue;
        }
        if (twelveCalls++) await sleep(TWELVE_GAP_MS);
        const bars = await twelveData15m(a.symbol, apiKey);
        const session = a.kind !== 'fx';
        const byTf = Object.fromEntries(INTRADAY_TFS.map((tf) => [tf.id, aggregate(bars, tf.minutes, { session, now })]));
        out[a.slug] = gauges(byTf);
      }
    } catch (err) {
      console.warn(`  signals-intraday ${a.slug}: ${err.message}`);
      failed.push(a.slug);
      if (prev) out[a.slug] = prev;
    }
  }

  if (!Object.keys(out).length) throw new Error('nenhum ativo calculado');
  console.log(`  signals-intraday: ${Object.keys(out).length} ativos, ${twelveCalls} consultas à Twelve Data${apiKey ? '' : ' (sem TWELVEDATA_API_KEY)'}`);
  return { source: 'Binance, Twelve Data', failed, twelveData: Boolean(apiKey), assets: out };
}
