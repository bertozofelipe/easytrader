// Conversão entre moedas e cripto, e valor do pip (sem DOM, para poder testar).
import { ASSETS } from '../data/assets';
import type { CryptoData, QuotesData } from './market';

/** Quanto vale 1 unidade de cada código (moeda ou símbolo cripto) em dólares. */
export type UsdTable = Map<string, number>;

const valid = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0;

export function buildUsdTable(fx: QuotesData | null | undefined, crypto: CryptoData | null | undefined): UsdTable {
  const table: UsdTable = new Map([['USD', 1]]);

  // Arquivos antigos não têm `rates`: usa os pares do cadastro (EUR, GBP, JPY, BRL).
  for (const a of ASSETS) {
    const q = a.fx && fx?.quotes.find((x) => x.symbol === a.symbol);
    if (q && valid(q.price)) table.set(a.fx!.code, a.fx!.invert ? q.price : 1 / q.price);
  }
  for (const [code, perUsd] of Object.entries(fx?.rates?.values ?? {})) {
    if (valid(perUsd)) table.set(code, 1 / perUsd);
  }
  for (const c of crypto?.coins ?? []) {
    if (valid(c.price) && !table.has(c.symbol)) table.set(c.symbol, c.price);
  }
  return table;
}

/** Converte `amount` de `from` para `to`; null se faltar cotação. */
export function convert(amount: number, from: string, to: string, table: UsdTable): number | null {
  const a = table.get(from);
  const b = table.get(to);
  return a && b ? (amount * a) / b : null;
}

// ---------- Pip ----------

export interface FxPair {
  base: string;
  quote: string;
}

/** Pares da calculadora de pip: principais, cruzados e o dólar/real. */
export const PIP_PAIRS: FxPair[] = [
  ['EUR', 'USD'], ['GBP', 'USD'], ['USD', 'JPY'], ['USD', 'CHF'], ['USD', 'CAD'], ['AUD', 'USD'], ['NZD', 'USD'],
  ['EUR', 'GBP'], ['EUR', 'JPY'], ['GBP', 'JPY'], ['EUR', 'CHF'], ['AUD', 'JPY'], ['USD', 'BRL'], ['USD', 'MXN'],
].map(([base, quote]) => ({ base, quote }));

export const pairLabel = (p: FxPair) => `${p.base}/${p.quote}`;

/** 1 pip: 0,01 nos pares cotados em iene, 0,0001 nos demais. */
export const pipSize = (p: FxPair) => (p.quote === 'JPY' ? 0.01 : 0.0001);

/** Unidades da moeda base em 1 lote de cada tamanho. */
export const LOT_UNITS = { padrao: 100_000, mini: 10_000, micro: 1_000 } as const;

export interface PipResult {
  pipSize: number;
  /** Preço do par (quote por base), pelas cotações de referência. */
  price: number | null;
  /** Valor de 1 pip por lote padrão, na moeda da conta. */
  perStandardLot: number;
  /** Valor de 1 pip na posição informada, na moeda da conta. */
  perPosition: number;
  /** Ganho ou perda do movimento informado, na moeda da conta. */
  move: number | null;
}

/**
 * Valor do pip na moeda da conta. O pip vale (tamanho do pip × unidades) na
 * moeda de cotação do par; depois converte para a moeda da conta.
 */
export function calcPip(
  { pair, lots, account, pips }: { pair: FxPair; lots: number; account: string; pips?: number | null },
  table: UsdTable,
): PipResult | null {
  const size = pipSize(pair);
  const perStandardLot = convert(size * LOT_UNITS.padrao, pair.quote, account, table);
  if (perStandardLot == null) return null;
  const perPosition = perStandardLot * lots;
  return {
    pipSize: size,
    price: convert(1, pair.base, pair.quote, table),
    perStandardLot,
    perPosition,
    move: pips != null && Number.isFinite(pips) ? perPosition * pips : null,
  };
}
