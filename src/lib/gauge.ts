// Termômetro técnico: resume médias móveis e osciladores do gráfico diário em
// um viés (forte alta … forte baixa). Descreve o que os indicadores mostram;
// não é recomendação de compra ou venda.
//
// Roda no coletor (Node, type stripping) e no site: imports com extensão .ts
// e só sintaxe TypeScript "apagável".
import { adx, bollinger, cci, ema, macd, momentum, rsi, sma, stochastic, type Series } from './indicators.ts';

export type Vote = 1 | 0 | -1;
export type Rating = 'forte-alta' | 'alta' | 'neutro' | 'baixa' | 'forte-baixa';

export interface Candle {
  /** Data do fechamento (AAAA-MM-DD). */
  t: string;
  h: number;
  l: number;
  c: number;
}

export interface GaugeItem {
  /** Ex.: "sma20", "ema200", "rsi", "stoch". */
  id: string;
  /** Valor principal do indicador. */
  value: number;
  /** Valor auxiliar quando ajuda a ler (ex.: %D do estocástico, sinal do MACD). */
  aux?: number;
  vote: Vote;
}

export interface GaugeGroup {
  /** Média dos votos, de −1 a +1. */
  score: number;
  rating: Rating;
  up: number;
  neutral: number;
  down: number;
  items: GaugeItem[];
}

export interface Gauge {
  /** Data do último candle usado. */
  asOf: string;
  close: number;
  score: number;
  rating: Rating;
  ma: GaugeGroup;
  osc: GaugeGroup;
}

export const MA_PERIODS = [10, 20, 30, 50, 100, 200];
/** Candles necessários para a EMA 200 estabilizar. */
export const GAUGE_MIN_CANDLES = 260;

/** Faixas da nota (−1 a +1). */
export function ratingFor(score: number): Rating {
  if (score >= 0.5) return 'forte-alta';
  if (score > 0.1) return 'alta';
  if (score <= -0.5) return 'forte-baixa';
  if (score < -0.1) return 'baixa';
  return 'neutro';
}

const last = (s: Series) => s[s.length - 1];
const sign = (x: number): Vote => (x > 0 ? 1 : x < 0 ? -1 : 0);

function group(items: GaugeItem[]): GaugeGroup {
  const up = items.filter((i) => i.vote === 1).length;
  const down = items.filter((i) => i.vote === -1).length;
  const score = items.length ? (up - down) / items.length : 0;
  return { score, rating: ratingFor(score), up, down, neutral: items.length - up - down, items };
}

/** Calcula o termômetro a partir de candles diários fechados (mais antigo primeiro). */
export function computeGauge(candles: Candle[]): Gauge | null {
  if (candles.length < GAUGE_MIN_CANDLES) return null;
  const h = candles.map((x) => x.h);
  const l = candles.map((x) => x.l);
  const c = candles.map((x) => x.c);
  const close = c[c.length - 1];

  // Médias móveis: preço acima = viés de alta; abaixo = viés de baixa.
  const ma: GaugeItem[] = [];
  for (const [kind, fn] of [['sma', sma], ['ema', ema]] as const) {
    for (const p of MA_PERIODS) {
      const v = last(fn(c, p));
      if (v != null) ma.push({ id: `${kind}${p}`, value: v, vote: sign(close - v) });
    }
  }

  // Osciladores e momento.
  const osc: GaugeItem[] = [];
  const r = last(rsi(c, 14));
  if (r != null) osc.push({ id: 'rsi', value: r, vote: r >= 55 ? 1 : r <= 45 ? -1 : 0 });

  const st = stochastic(h, l, c);
  const k = last(st.k);
  const d = last(st.d);
  if (k != null && d != null) osc.push({ id: 'stoch', value: k, aux: d, vote: sign(k - d) });

  const cc = last(cci(h, l, c, 20));
  if (cc != null) osc.push({ id: 'cci', value: cc, vote: cc > 100 ? 1 : cc < -100 ? -1 : 0 });

  const ad = adx(h, l, c, 14);
  const a = last(ad.adx);
  const pdi = last(ad.plusDi);
  const mdi = last(ad.minusDi);
  if (a != null && pdi != null && mdi != null) {
    // ADX abaixo de 20: sem tendência definida.
    osc.push({ id: 'adx', value: a, aux: pdi - mdi, vote: a < 20 ? 0 : sign(pdi - mdi) });
  }

  const mo = last(momentum(c, 10));
  if (mo != null) osc.push({ id: 'mom', value: mo, vote: sign(mo) });

  const m = macd(c);
  const line = last(m.line);
  const sig = last(m.signal);
  if (line != null && sig != null) osc.push({ id: 'macd', value: line, aux: sig, vote: sign(line - sig) });

  const b = bollinger(c);
  const up = last(b.upper);
  const low = last(b.lower);
  if (up != null && low != null && up > low) {
    const pctB = (close - low) / (up - low);
    osc.push({ id: 'bb', value: pctB * 100, vote: pctB > 0.8 ? 1 : pctB < 0.2 ? -1 : 0 });
  }

  const maGroup = group(ma);
  const oscGroup = group(osc);
  // Os dois grupos pesam igual: 12 médias não abafam 7 osciladores.
  const score = (maGroup.score + oscGroup.score) / 2;
  return { asOf: candles[candles.length - 1].t, close, score, rating: ratingFor(score), ma: maGroup, osc: oscGroup };
}
