#!/usr/bin/env node
// Coleta dados de mercado e grava JSON em OUT_DIR (padrão: .data-out).
// Se uma fonte falhar, reaproveita o último arquivo publicado no branch `data`
// marcado com "stale": true, para o site nunca ficar sem dados.
//
// Uso: node scripts/fetch-data.mjs [--out .data-out]

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CRYPTO_TOP_N, FX_PAIRS, PREVIOUS_DATA_URL, TICKER_CRYPTO, US_SYMBOLS } from './config.mjs';
import { getJson } from './lib/http.mjs';
import { fetchCrypto } from './providers/coingecko.mjs';
import { fetchFearGreed } from './providers/alternative.mjs';
import { fetchFx } from './providers/frankfurter.mjs';
import { fetchUsQuotes } from './providers/finnhub.mjs';

const outFlag = process.argv.indexOf('--out');
const OUT_DIR = outFlag > -1 ? process.argv[outFlag + 1] : '.data-out';

const DATASETS = {
  crypto: () => fetchCrypto({ topN: CRYPTO_TOP_N }),
  sentiment: () => fetchFearGreed(),
  fx: () => fetchFx(FX_PAIRS),
  us: () => fetchUsQuotes(US_SYMBOLS),
};

async function collect(name, fn) {
  const started = Date.now();
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
    if (q.ticker) items.push({ id: q.symbol, label: q.name, sub: q.symbol, price: q.price, changePct: q.changePct, kind: q.kind });
  }
  for (const id of TICKER_CRYPTO) {
    const c = crypto?.coins.find((x) => x.id === id);
    if (c) items.push({ id: c.id, label: c.symbol, sub: c.name, price: c.price, changePct: c.change24h, kind: 'crypto' });
  }
  for (const q of fx?.quotes ?? []) {
    if (q.ticker) items.push({ id: q.symbol, label: q.symbol, sub: 'Câmbio', price: q.price, changePct: q.changePct, kind: 'fx' });
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
