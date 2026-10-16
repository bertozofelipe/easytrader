#!/usr/bin/env node
// Coleta dados de mercado e grava JSON em OUT_DIR (padrão: .data-out).
// Se uma fonte falhar, reaproveita o último arquivo publicado no branch `data`
// marcado com "stale": true, para o site nunca ficar sem dados.
//
// Uso: node scripts/fetch-data.mjs [--out .data-out]

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ASSETS } from '../src/data/assets.ts';
import { CBOE_ASSETS, CRYPTO_TOP_N, FX_CURRENCIES, FX_PAIRS, PREVIOUS_DATA_URL, TICKER_CRYPTO, US_SYMBOLS } from './config.mjs';
import { getJson } from './lib/http.mjs';
import { fetchCrypto } from './providers/coingecko.mjs';
import { fetchFearGreed } from './providers/alternative.mjs';
import { fetchFx } from './providers/frankfurter.mjs';
import { fetchUsQuotes } from './providers/finnhub.mjs';
import { fetchNews } from './providers/rss.mjs';
import { fetchCommodityQuotes } from './providers/commodity-quotes.mjs';
import { COMMODITY_QUOTES } from '../src/data/commodities.ts';
import { fetchCboeIndices } from './providers/cboe.mjs';
import { fetchSignals } from './providers/history.mjs';
import { fetchSignalsIntraday } from './providers/intraday.mjs';
import { FEEDS, NEWS_MAX_AGE_HOURS, NEWS_MAX_TOTAL, NEWS_PER_FEED } from './feeds.mjs';

const outFlag = process.argv.indexOf('--out');
const OUT_DIR = outFlag > -1 ? process.argv[outFlag + 1] : '.data-out';

const DATASETS = {
  crypto: () => fetchCrypto({ topN: CRYPTO_TOP_N }),
  sentiment: () => fetchFearGreed(),
  fx: () => fetchFx(FX_PAIRS, FX_CURRENCIES),
  us: () => fetchUsQuotes(US_SYMBOLS),
  cboe: () => fetchCboeIndices(CBOE_ASSETS),
  commodities: () => fetchCommodityQuotes(COMMODITY_QUOTES),
  news: () => fetchNews(FEEDS, { maxAgeHours: NEWS_MAX_AGE_HOURS, perFeed: NEWS_PER_FEED, maxTotal: NEWS_MAX_TOTAL }),
  signals: () => fetchSignals(ASSETS),
  'signals-intraday': () => fetchSignalsIntraday(ASSETS),
};

// Conjuntos baseados em candles diários: recalcula só quando a versão
// publicada passou dessa idade (poupa as APIs; o resultado muda pouco no dia).
const MAX_AGE_HOURS = { signals: 4 };
// FORCE=signals,... recalcula esses conjuntos mesmo dentro do prazo (disparo manual do workflow).
const FORCE = new Set((process.env.FORCE ?? '').split(',').map((s) => s.trim()).filter(Boolean));

async function collect(name, fn) {
  const started = Date.now();
  if (MAX_AGE_HOURS[name] && !FORCE.has(name)) {
    const previous = await getJson(`${PREVIOUS_DATA_URL}/${name}.json`, { retries: 1 }).catch(() => null);
    const ageH = previous && (Date.now() - new Date(previous.updatedAt).getTime()) / 3_600_000;
    if (previous && !previous.stale && ageH < MAX_AGE_HOURS[name]) {
      console.log(`↺ ${name}: versão publicada tem ${ageH.toFixed(1)} h, reaproveitada`);
      return { name, ok: true, payload: previous };
    }
  }
  try {
    const data = await fn();
    console.log(`✔ ${name} (${Date.now() - started} ms)`);
    return { name, ok: true, payload: { updatedAt: new Date().toISOString(), stale: false, ...data } };
  } catch (err) {
    console.warn(`✖ ${name}: ${err.message}`);
    try {
      const previous = await getJson(`${PREVIOUS_DATA_URL}/${name}.json`, { retries: 1 });
      console.warn(`  ↳ usando versão anterior de ${previous.updatedAt}`);
      return { name, ok: false, error: err.message, payload: { ...previous, stale: true } };
    } catch {
      return { name, ok: false, error: err.message, payload: null };
    }
  }
}

function buildTicker({ crypto, us, fx }) {
  const items = [];
  for (const q of us?.quotes ?? []) {
    // Preço é do ETF, não do índice: o rótulo deixa isso explícito.
    if (q.ticker) items.push({ id: q.symbol, slug: q.symbol.toLowerCase(), label: `${q.name} (${q.symbol})`, sub: `ETF ${q.symbol}`, price: q.price, changePct: q.changePct, kind: q.kind });
  }
  for (const id of TICKER_CRYPTO) {
    const c = crypto?.coins.find((x) => x.id === id);
    if (c) items.push({ id: c.id, slug: c.symbol.toLowerCase(), label: c.symbol, sub: c.name, price: c.price, changePct: c.change24h, kind: 'crypto' });
  }
  for (const q of fx?.quotes ?? []) {
    if (q.ticker) items.push({ id: q.symbol, slug: q.symbol.replace('/', '').toLowerCase(), label: q.symbol, sub: 'Câmbio', price: q.price, changePct: q.changePct, kind: 'fx' });
  }
  return { updatedAt: new Date().toISOString(), items };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  // Sequencial para não estourar limites das APIs gratuitas.
  const results = [];
  for (const [name, fn] of Object.entries(DATASETS)) results.push(await collect(name, fn));

  const byName = Object.fromEntries(results.map((r) => [r.name, r.payload]));
  for (const r of results) {
    if (r.payload) await writeJson(`${r.name}.json`, r.payload);
  }
  await writeJson('ticker.json', buildTicker(byName));
  await writeJson('status.json', {
    updatedAt: new Date().toISOString(),
    datasets: results.map((r) => ({ name: r.name, ok: r.ok, error: r.error ?? null, dataUpdatedAt: r.payload?.updatedAt ?? null })),
  });

  const failed = results.filter((r) => !r.ok).map((r) => r.name);
  console.log(failed.length ? `Concluído com falhas: ${failed.join(', ')}` : 'Concluído sem falhas.');
  // Só falha o job se nada foi coletado nem recuperado.
  if (results.every((r) => !r.payload)) process.exit(1);
}

const writeJson = (file, data) => writeFile(join(OUT_DIR, file), JSON.stringify(data));

main();
