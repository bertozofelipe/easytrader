import { getJson, sleep } from '../lib/http.mjs';
import { datasetFor } from '../../src/data/assets.ts';
import { computeGauge, GAUGE_MIN_CANDLES } from '../../src/lib/gauge.ts';

// Candles diários usados no termômetro (folga sobre o mínimo da EMA 200).
const CANDLES = 400;

/** Cripto: candles diários da Binance, sem o candle do dia (ainda aberto). */
async function binanceCandles(pair) {
  const rows = await getJson(`https://data-api.binance.vision/api/v3/klines?symbol=${pair}&interval=1d&limit=${CANDLES + 1}`);
  return rows
    .filter((r) => r[6] < Date.now())
    .map((r) => ({ t: new Date(r[0]).toISOString().slice(0, 10), h: +r[2], l: +r[3], c: +r[4] }));
}

/** Ações, ETFs e índices da Cboe: histórico diário público (atrasado). */
async function cboeCandles(symbol) {
  const { data } = await getJson(`https://cdn-api.cboe.com/api/global/delayed_quotes/charts/historical/${symbol}.json`);
  return data.slice(-CANDLES).map((r) => ({ t: r.date, h: +r.high, l: +r.low, c: +r.close }));
}

/** Câmbio: referência diária do BCE, só fechamento (máxima = mínima = fechamento). */
async function frankfurterCandles(fxAssets) {
  const start = new Date(Date.now() - 600 * 86_400_000).toISOString().slice(0, 10);
  const codes = fxAssets.map((a) => a.fx.code).join(',');
  const { rates } = await getJson(`https://api.frankfurter.dev/v1/${start}..?base=USD&symbols=${codes}`);
  const dates = Object.keys(rates).sort().slice(-CANDLES);
  return Object.fromEntries(
    fxAssets.map((a) => [
      a.slug,
      dates
        .filter((d) => rates[d][a.fx.code])
        .map((d) => {
          const v = a.fx.invert ? 1 / rates[d][a.fx.code] : rates[d][a.fx.code];
          return { t: d, h: v, l: v, c: v };
        }),
    ]),
  );
}

/**
 * Termômetro técnico de cada ativo, no gráfico diário. Um ativo que falhar
 * fica de fora (listado em `failed`); só lança erro se todos falharem.
 */
export async function fetchSignals(assets) {
  const out = {};
  const failed = [];

  const fx = assets.filter((a) => a.kind === 'fx');
  let fxCandles = {};
  try {
    fxCandles = fx.length ? await frankfurterCandles(fx) : {};
  } catch (err) {
    console.warn(`  signals fx: ${err.message}`);
  }

  for (const a of assets) {
    try {
      let candles;
      if (a.kind === 'fx') candles = fxCandles[a.slug];
      else if (a.binance) {
        candles = await binanceCandles(a.binance);
        await sleep(300);
      } else {
        candles = await cboeCandles(datasetFor(a) === 'cboe' ? a.cboe : a.symbol);
        await sleep(500);
      }
      if (!candles || candles.length < GAUGE_MIN_CANDLES) throw new Error(`histórico curto (${candles?.length ?? 0})`);
      out[a.slug] = computeGauge(candles);
    } catch (err) {
      console.warn(`  signals ${a.slug}: ${err.message}`);
      failed.push(a.slug);
    }
  }

  if (!Object.keys(out).length) throw new Error('nenhum ativo calculado');
  return { source: 'Binance, Cboe, BCE (Frankfurter)', timeframe: '1d', failed, assets: out };
}
