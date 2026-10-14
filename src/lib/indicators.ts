// Indicadores técnicos. Todas as séries de saída têm o mesmo tamanho da
// entrada, com null nos pontos em que ainda não há dados suficientes.

export type Series = (number | null)[];

export function sma(values: number[], period: number): Series {
  const out: Series = new Array(values.length).fill(null);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

/** EMA iniciada pela média simples dos primeiros `period` valores não nulos. */
export function ema(values: Series, period: number): Series {
  const out: Series = new Array(values.length).fill(null);
  const k = 2 / (period + 1);
  let prev: number | null = null;
  let seed: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v == null) continue;
    if (prev == null) {
      seed.push(v);
      if (seed.length === period) {
        prev = seed.reduce((a, b) => a + b, 0) / period;
        out[i] = prev;
        seed = [];
      }
      continue;
    }
    prev = v * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

export function bollinger(values: number[], period = 20, mult = 2) {
  const middle = sma(values, period);
  const upper: Series = new Array(values.length).fill(null);
  const lower: Series = new Array(values.length).fill(null);
  for (let i = period - 1; i < values.length; i++) {
    const m = middle[i]!;
    let variance = 0;
    for (let j = i - period + 1; j <= i; j++) variance += (values[j] - m) ** 2;
    const sd = Math.sqrt(variance / period);
    upper[i] = m + mult * sd;
    lower[i] = m - mult * sd;
  }
  return { middle, upper, lower };
}

/** RSI com suavização de Wilder. */
export function rsi(values: number[], period = 14): Series {
  const out: Series = new Array(values.length).fill(null);
  if (values.length <= period) return out;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = values[i] - values[i - 1];
    if (d >= 0) gain += d;
    else loss -= d;
  }
  gain /= period;
  loss /= period;
  const value = () => (loss === 0 ? 100 : 100 - 100 / (1 + gain / loss));
  out[period] = value();
  for (let i = period + 1; i < values.length; i++) {
    const d = values[i] - values[i - 1];
    gain = (gain * (period - 1) + Math.max(d, 0)) / period;
    loss = (loss * (period - 1) + Math.max(-d, 0)) / period;
    out[i] = value();
  }
  return out;
}

export function macd(values: number[], fast = 12, slow = 26, signalPeriod = 9) {
  const emaFast = ema(values, fast);
  const emaSlow = ema(values, slow);
  const line: Series = values.map((_, i) => (emaFast[i] != null && emaSlow[i] != null ? emaFast[i]! - emaSlow[i]! : null));
  const signal = ema(line, signalPeriod);
  const histogram: Series = line.map((v, i) => (v != null && signal[i] != null ? v - signal[i]! : null));
  return { line, signal, histogram };
}

/** Média simples de uma série com nulls: só a partir de `period` valores seguidos. */
function smaSeries(values: Series, period: number): Series {
  const out: Series = new Array(values.length).fill(null);
  let run = 0;
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v == null) {
      run = 0;
      sum = 0;
      continue;
    }
    run++;
    sum += v;
    if (run > period) sum -= values[i - period]!;
    if (run >= period) out[i] = sum / period;
  }
  return out;
}

/** Estocástico lento: %K suavizado e %D. */
export function stochastic(highs: number[], lows: number[], closes: number[], period = 14, smoothK = 3, smoothD = 3) {
  const raw: Series = closes.map((c, i) => {
    if (i < period - 1) return null;
    let hh = -Infinity;
    let ll = Infinity;
    for (let j = i - period + 1; j <= i; j++) {
      hh = Math.max(hh, highs[j]);
      ll = Math.min(ll, lows[j]);
    }
    return hh === ll ? 50 : ((c - ll) / (hh - ll)) * 100;
  });
  const k = smaSeries(raw, smoothK);
  return { k, d: smaSeries(k, smoothD) };
}

/** Commodity Channel Index. */
export function cci(highs: number[], lows: number[], closes: number[], period = 20): Series {
  const tp = closes.map((c, i) => (highs[i] + lows[i] + c) / 3);
  const mean = sma(tp, period);
  return tp.map((v, i) => {
    const m = mean[i];
    if (m == null) return null;
    let dev = 0;
    for (let j = i - period + 1; j <= i; j++) dev += Math.abs(tp[j] - m);
    dev /= period;
    return dev === 0 ? 0 : (v - m) / (0.015 * dev);
  });
}

/** ADX com +DI e −DI (suavização de Wilder). */
export function adx(highs: number[], lows: number[], closes: number[], period = 14) {
  const n = closes.length;
  const adxOut: Series = new Array(n).fill(null);
  const plusDi: Series = new Array(n).fill(null);
  const minusDi: Series = new Array(n).fill(null);
  let tr = 0;
  let pdm = 0;
  let mdm = 0;
  let dxSum = 0;
  let prevAdx: number | null = null;

  for (let i = 1; i < n; i++) {
    const up = highs[i] - highs[i - 1];
    const down = lows[i - 1] - lows[i];
    const curTr = Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1]));
    const curP = up > down && up > 0 ? up : 0;
    const curM = down > up && down > 0 ? down : 0;

    if (i <= period) {
      tr += curTr;
      pdm += curP;
      mdm += curM;
      if (i < period) continue;
    } else {
      tr = tr - tr / period + curTr;
      pdm = pdm - pdm / period + curP;
      mdm = mdm - mdm / period + curM;
    }

    const p = tr === 0 ? 0 : (100 * pdm) / tr;
    const m = tr === 0 ? 0 : (100 * mdm) / tr;
    plusDi[i] = p;
    minusDi[i] = m;
    const dx = p + m === 0 ? 0 : (100 * Math.abs(p - m)) / (p + m);

    // O primeiro ADX é a média dos primeiros `period` DX.
    const count = i - period + 1;
    if (count < period) dxSum += dx;
    else if (count === period) prevAdx = (dxSum + dx) / period;
    else prevAdx = (prevAdx! * (period - 1) + dx) / period;
    if (prevAdx != null) adxOut[i] = prevAdx;
  }
  return { adx: adxOut, plusDi, minusDi };
}

/** Momento: fechamento atual menos o de `period` candles atrás. */
export const momentum = (closes: number[], period = 10): Series => closes.map((c, i) => (i >= period ? c - closes[i - period] : null));
