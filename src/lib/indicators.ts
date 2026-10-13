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

// ---------- Leitura dos indicadores (educacional) ----------

export type Bias = 'alta' | 'baixa' | 'neutro';

export interface Reading {
  id: string;
  label: string;
  value: string;
  bias: Bias;
  explanation: string;
}

const last = (s: Series) => s[s.length - 1];
const fmt = (n: number, d = 2) => n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

/**
 * Lê os indicadores no último candle diário. Descreve o que cada indicador
 * mostra; não é sinal de compra ou venda.
 */
export function readIndicators(closes: number[]): Reading[] {
  const price = closes[closes.length - 1];
  const out: Reading[] = [];

  for (const period of [20, 50, 200]) {
    const m = last(sma(closes, period));
    if (m == null) continue;
    const diff = ((price - m) / m) * 100;
    out.push({
      id: `sma${period}`,
      label: `Média móvel ${period} dias`,
      value: fmt(m),
      bias: Math.abs(diff) < 0.5 ? 'neutro' : diff > 0 ? 'alta' : 'baixa',
      explanation: `Preço ${fmt(Math.abs(diff))}% ${diff >= 0 ? 'acima' : 'abaixo'} da média de ${period} dias.`,
    });
  }

  const r = last(rsi(closes, 14));
  if (r != null) {
    out.push({
      id: 'rsi',
      label: 'RSI (14)',
      value: fmt(r, 1),
      bias: r >= 55 ? 'alta' : r <= 45 ? 'baixa' : 'neutro',
      explanation:
        r >= 70
          ? 'Acima de 70: zona de sobrecompra, movimento de alta esticado.'
          : r <= 30
            ? 'Abaixo de 30: zona de sobrevenda, movimento de baixa esticado.'
            : `Entre 30 e 70: sem extremo; ${r >= 50 ? 'força compradora predominante' : 'força vendedora predominante'}.`,
    });
  }

  const m = macd(closes);
  const line = last(m.line);
  const signal = last(m.signal);
  if (line != null && signal != null) {
    out.push({
      id: 'macd',
      label: 'MACD (12, 26, 9)',
      value: fmt(line),
      bias: line > signal ? 'alta' : line < signal ? 'baixa' : 'neutro',
      explanation: `Linha MACD ${line > signal ? 'acima' : 'abaixo'} da linha de sinal${line > 0 ? ' e acima de zero' : ' e abaixo de zero'}.`,
    });
  }

  const b = bollinger(closes);
  const up = last(b.upper);
  const low = last(b.lower);
  if (up != null && low != null) {
    const pos = (price - low) / (up - low);
    out.push({
      id: 'bollinger',
      label: 'Bandas de Bollinger (20, 2)',
      value: `${fmt(pos * 100, 0)}%`,
      bias: pos > 0.8 ? 'alta' : pos < 0.2 ? 'baixa' : 'neutro',
      explanation:
        pos > 1
          ? 'Preço acima da banda superior: movimento forte e esticado.'
          : pos < 0
            ? 'Preço abaixo da banda inferior: movimento forte e esticado.'
            : `Preço a ${fmt(pos * 100, 0)}% do caminho entre a banda inferior e a superior.`,
    });
  }

  return out;
}
