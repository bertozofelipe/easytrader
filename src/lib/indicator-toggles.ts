// Indicadores disponíveis no gráfico (sem importar a biblioteca de gráficos,
// para poder ser usado também no build).
export type IndicatorId = 'sma20' | 'sma50' | 'sma200' | 'bollinger' | 'rsi' | 'macd';

/** `guide` = slug da página em /indicadores. */
export const INDICATOR_TOGGLES: { id: IndicatorId; label: string; color: string; guide: string }[] = [
  { id: 'sma20', label: 'MM 20', color: '#f59e0b', guide: 'medias-moveis' },
  { id: 'sma50', label: 'MM 50', color: '#a855f7', guide: 'medias-moveis' },
  { id: 'sma200', label: 'MM 200', color: '#38bdf8', guide: 'medias-moveis' },
  { id: 'bollinger', label: 'Bollinger', color: '#94a3b8', guide: 'bandas-de-bollinger' },
  { id: 'rsi', label: 'RSI', color: '#e879f9', guide: 'rsi' },
  { id: 'macd', label: 'MACD', color: '#3b82f6', guide: 'macd' },
];

export const DEFAULT_INDICATORS: IndicatorId[] = ['sma20', 'sma50'];
