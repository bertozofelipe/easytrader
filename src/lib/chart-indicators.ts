// Desenha indicadores técnicos num gráfico da Lightweight Charts.
import { HistogramSeries, LineSeries, LineStyle, type IChartApi, type ISeriesApi, type LineSeriesPartialOptions, type SeriesType, type UTCTimestamp } from 'lightweight-charts';
import { bollinger, macd, rsi, sma, type Series } from './indicators';
import { INDICATOR_TOGGLES, type IndicatorId } from './indicator-toggles';

export { DEFAULT_INDICATORS, INDICATOR_TOGGLES, type IndicatorId } from './indicator-toggles';

export interface Candle {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const color = (id: IndicatorId) => INDICATOR_TOGGLES.find((t) => t.id === id)!.color;

const toLine = (candles: Candle[], values: Series) =>
  values.flatMap((v, i) => (v == null ? [] : [{ time: candles[i].time, value: v }]));

/**
 * Adiciona as séries dos indicadores ativos. Osciladores (RSI, MACD) vão em
 * painéis próprios abaixo do preço. Devolve como removê-los e quantos painéis
 * extras foram criados.
 */
export function drawIndicators(chart: IChartApi, candles: Candle[], active: Set<IndicatorId>) {
  const added: ISeriesApi<SeriesType>[] = [];
  const closes = candles.map((c) => c.close);
  const line = (values: Series, opts: LineSeriesPartialOptions, pane = 0) => {
    const s = chart.addSeries(LineSeries, { lineWidth: 1, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false, ...opts }, pane);
    s.setData(toLine(candles, values));
    added.push(s);
    return s;
  };

  for (const [id, period] of [['sma20', 20], ['sma50', 50], ['sma200', 200]] as const) {
    if (active.has(id)) line(sma(closes, period), { color: color(id), lineWidth: 2 });
  }

  if (active.has('bollinger')) {
    const b = bollinger(closes);
    const c = color('bollinger');
    line(b.upper, { color: c });
    line(b.middle, { color: c, lineStyle: LineStyle.Dashed });
    line(b.lower, { color: c });
  }

  let pane = 0;
  if (active.has('rsi')) {
    pane++;
    const s = line(rsi(closes), { color: color('rsi'), lastValueVisible: true }, pane);
    s.createPriceLine({ price: 70, color: '#64748b', lineStyle: LineStyle.Dashed, lineWidth: 1, axisLabelVisible: false, title: '' });
    s.createPriceLine({ price: 30, color: '#64748b', lineStyle: LineStyle.Dashed, lineWidth: 1, axisLabelVisible: false, title: '' });
  }

  if (active.has('macd')) {
    pane++;
    const m = macd(closes);
    const hist = chart.addSeries(HistogramSeries, { priceLineVisible: false, lastValueVisible: false }, pane);
    hist.setData(m.histogram.flatMap((v, i) => (v == null ? [] : [{ time: candles[i].time, value: v, color: v >= 0 ? '#22c55e88' : '#ef444488' }])));
    added.push(hist);
    line(m.line, { color: color('macd'), lastValueVisible: true }, pane);
    line(m.signal, { color: '#f97316' }, pane);
  }

  const panes = chart.panes();
  panes[0]?.setStretchFactor(3);
  for (let i = 1; i < panes.length; i++) panes[i].setStretchFactor(1);

  return {
    oscillators: pane,
    clear() {
      for (const s of added) chart.removeSeries(s);
      // Remove painéis que ficaram vazios (de trás para frente para não mudar os índices).
      const all = chart.panes();
      for (let i = all.length - 1; i > 0; i--) if (all[i].getSeries().length === 0) chart.removePane(i);
    },
  };
}
