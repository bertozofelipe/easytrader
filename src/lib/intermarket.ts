// Cálculos da análise intermercados (build e navegador) a partir de
// intermarket.json: variações diárias, correlação de Pearson em janela móvel e
// a mudança da correlação no último mês.
import { CHANGE_LAG, INTERMARKET_SERIES, type ClassicPair, type CorrWindow } from '../data/intermarket';
import type { IntermarketData } from './market';

export type Returns = Record<string, (number | null)[]>;

/** Variação diária de cada série: retorno percentual ou, nos juros, diferença em pontos. */
export function dailyReturns(data: IntermarketData): Returns {
  const out: Returns = {};
  for (const s of INTERMARKET_SERIES) {
    const v = data.series[s.id];
    if (!v) continue;
    out[s.id] = v.map((x, i) => {
      const prev = v[i - 1];
      if (i === 0 || x == null || prev == null) return null;
      return s.mode === 'diff' ? x - prev : x / prev - 1;
    });
  }
  return out;
}

/** Fração mínima de dias com as duas séries para a correlação valer. */
const MIN_COVERAGE = 0.8;

/** Correlação de Pearson das variações nos `window` pregões que terminam em `end`. */
export function correlation(a: (number | null)[], b: (number | null)[], window: number, end: number): number | null {
  const start = end - window + 1;
  if (start < 1) return null;
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = start; i <= end; i++) {
    if (a[i] != null && b[i] != null) {
      xs.push(a[i]!);
      ys.push(b[i]!);
    }
  }
  if (xs.length < window * MIN_COVERAGE) return null;
  const n = xs.length;
  const mx = xs.reduce((s, x) => s + x, 0) / n;
  const my = ys.reduce((s, y) => s + y, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : null;
}

export interface PairCorr {
  a: string;
  b: string;
  now: number | null;
  /** Correlação na mesma janela, CHANGE_LAG pregões antes. */
  before: number | null;
  change: number | null;
}

export function pairCorr(r: Returns, a: string, b: string, window: CorrWindow): PairCorr {
  const end = lastIndex(r);
  const now = r[a] && r[b] ? correlation(r[a], r[b], window, end) : null;
  const before = r[a] && r[b] ? correlation(r[a], r[b], window, end - CHANGE_LAG) : null;
  return { a, b, now, before, change: now != null && before != null ? now - before : null };
}

/** Último índice do calendário (o pregão mais recente). */
export const lastIndex = (r: Returns) => Math.max(0, ...Object.values(r).map((v) => v.length - 1));

/** Todas as combinações de séries disponíveis, na ordem do cadastro. */
export function allPairs(r: Returns, window: CorrWindow): PairCorr[] {
  const ids = INTERMARKET_SERIES.map((s) => s.id).filter((id) => r[id]);
  const out: PairCorr[] = [];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) out.push(pairCorr(r, ids[i], ids[j], window));
  return out;
}

/** Pares cuja correlação mais mudou no último mês. */
export const biggestChanges = (pairs: PairCorr[], n = 6) =>
  pairs
    .filter((p) => p.change != null)
    .sort((x, y) => Math.abs(y.change!) - Math.abs(x.change!))
    .slice(0, n);

/** Correlação móvel do par ao longo do histórico, para o gráfico. */
export function rollingCorrelation(r: Returns, dates: string[], a: string, b: string, window: number): { time: string; value: number }[] {
  if (!r[a] || !r[b]) return [];
  const out: { time: string; value: number }[] = [];
  for (let end = window; end < dates.length; end++) {
    const v = correlation(r[a], r[b], window, end);
    if (v != null) out.push({ time: dates[end], value: v });
  }
  return out;
}

export type Strength = 'forte' | 'moderada' | 'fraca' | 'nula';

export function strength(r: number): Strength {
  const x = Math.abs(r);
  if (x >= 0.7) return 'forte';
  if (x >= 0.4) return 'moderada';
  if (x >= 0.2) return 'fraca';
  return 'nula';
}

/** A relação clássica está valendo agora? `regime`: o sinal indica qual motor domina. */
export type ClassicStatus = 'em-linha' | 'invertida' | 'fraca' | 'regime-pos' | 'regime-neg';

export function classicStatus(p: ClassicPair, r: number): ClassicStatus {
  if (Math.abs(r) < 0.2) return 'fraca';
  if (p.expected === 'regime') return r > 0 ? 'regime-pos' : 'regime-neg';
  return Math.sign(r) === p.expected ? 'em-linha' : 'invertida';
}

/** Data (AAAA-MM-DD) do último pregão com dados. */
export const lastDate = (data: IntermarketData) => data.dates[data.dates.length - 1];
