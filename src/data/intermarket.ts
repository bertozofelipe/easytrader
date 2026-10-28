// Mercados acompanhados na seção de análise intermercados. Usado pelo coletor
// (scripts/providers/intermarket.mjs, via type stripping) e pelo site: só
// sintaxe TypeScript "apagável".

/** Os quatro mercados de John Murphy, mais o termômetro de risco e o Brasil. */
export type IntermarketGroup = 'acoes' | 'juros' | 'dolar' | 'commodities' | 'risco' | 'brasil';

export const INTERMARKET_GROUPS: { id: IntermarketGroup; pt: string; en: string }[] = [
  { id: 'acoes', pt: 'Ações', en: 'Stocks' },
  { id: 'juros', pt: 'Juros', en: 'Bonds' },
  { id: 'dolar', pt: 'Dólar', en: 'US dollar' },
  { id: 'commodities', pt: 'Commodities', en: 'Commodities' },
  { id: 'risco', pt: 'Risco', en: 'Risk' },
  { id: 'brasil', pt: 'Brasil', en: 'Brazil' },
];

export interface IntermarketSeries {
  id: string;
  /** Símbolo no Yahoo Finance (fechamentos diários). */
  yahoo: string;
  pt: string;
  en: string;
  /** Rótulo curto para a matriz. */
  shortPt: string;
  shortEn: string;
  group: IntermarketGroup;
  /**
   * Como medir a variação diária: `pct` = retorno percentual; `diff` = variação
   * absoluta (taxas de juros, em pontos percentuais).
   */
  mode: 'pct' | 'diff';
  /** Unidade exibida ao lado do valor. */
  unit: string;
  unitEn?: string;
  decimals: number;
  /** Página do ativo no site (slug em src/data/assets.ts), quando existe. */
  asset?: string;
}

export const INTERMARKET_SERIES: IntermarketSeries[] = [
  { id: 'spx', yahoo: '^GSPC', pt: 'S&P 500', en: 'S&P 500', shortPt: 'S&P', shortEn: 'S&P', group: 'acoes', mode: 'pct', unit: 'pts', decimals: 0, asset: 'spy' },
  { id: 'us10y', yahoo: '^TNX', pt: 'Juros de 10 anos (EUA)', en: 'US 10-year yield', shortPt: '10 anos', shortEn: '10Y', group: 'juros', mode: 'diff', unit: '%', decimals: 2 },
  { id: 'dxy', yahoo: 'DX-Y.NYB', pt: 'Índice do dólar (DXY)', en: 'US Dollar Index (DXY)', shortPt: 'DXY', shortEn: 'DXY', group: 'dolar', mode: 'pct', unit: 'pts', decimals: 2 },
  { id: 'gold', yahoo: 'GC=F', pt: 'Ouro', en: 'Gold', shortPt: 'Ouro', shortEn: 'Gold', group: 'commodities', mode: 'pct', unit: 'US$/oz', unitEn: '$/oz', decimals: 0, asset: 'gld' },
  { id: 'oil', yahoo: 'CL=F', pt: 'Petróleo WTI', en: 'WTI crude oil', shortPt: 'WTI', shortEn: 'WTI', group: 'commodities', mode: 'pct', unit: 'US$/barril', unitEn: '$/bbl', decimals: 2, asset: 'uso' },
  { id: 'copper', yahoo: 'HG=F', pt: 'Cobre', en: 'Copper', shortPt: 'Cobre', shortEn: 'Copper', group: 'commodities', mode: 'pct', unit: 'US$/lb', unitEn: '$/lb', decimals: 3 },
  { id: 'vix', yahoo: '^VIX', pt: 'VIX (volatilidade)', en: 'VIX (volatility)', shortPt: 'VIX', shortEn: 'VIX', group: 'risco', mode: 'pct', unit: 'pts', decimals: 2, asset: 'vix' },
  { id: 'btc', yahoo: 'BTC-USD', pt: 'Bitcoin', en: 'Bitcoin', shortPt: 'BTC', shortEn: 'BTC', group: 'risco', mode: 'pct', unit: 'US$', unitEn: '$', decimals: 0, asset: 'btc' },
  { id: 'ibov', yahoo: '^BVSP', pt: 'Ibovespa', en: 'Ibovespa', shortPt: 'Ibov', shortEn: 'Ibov', group: 'brasil', mode: 'pct', unit: 'pts', decimals: 0 },
  { id: 'usdbrl', yahoo: 'BRL=X', pt: 'Dólar / Real', en: 'USD/BRL', shortPt: 'USD/BRL', shortEn: 'USD/BRL', group: 'brasil', mode: 'pct', unit: 'R$', decimals: 4, asset: 'usdbrl' },
];

/** Janelas da correlação, em pregões. */
export const CORR_WINDOWS = [20, 60, 120] as const;
export type CorrWindow = (typeof CORR_WINDOWS)[number];
export const DEFAULT_WINDOW: CorrWindow = 60;

/** Pregões usados para medir a mudança da correlação ("um mês atrás"). */
export const CHANGE_LAG = 21;

/**
 * Relações clássicas entre mercados. `expected`: sinal histórico da
 * correlação; `regime` = muda de sinal conforme o motor do mercado. Os textos
 * explicativos ficam na view (src/views/IntermarketPage.astro).
 */
export interface ClassicPair {
  id: string;
  a: string;
  b: string;
  expected: 1 | -1 | 'regime';
}

export const CLASSIC_PAIRS: ClassicPair[] = [
  { id: 'dxy-gold', a: 'dxy', b: 'gold', expected: -1 },
  { id: 'dxy-oil', a: 'dxy', b: 'oil', expected: -1 },
  { id: 'us10y-spx', a: 'us10y', b: 'spx', expected: 'regime' },
  { id: 'oil-us10y', a: 'oil', b: 'us10y', expected: 1 },
  { id: 'copper-us10y', a: 'copper', b: 'us10y', expected: 1 },
  { id: 'vix-spx', a: 'vix', b: 'spx', expected: -1 },
  { id: 'btc-spx', a: 'btc', b: 'spx', expected: 1 },
  { id: 'usdbrl-ibov', a: 'usdbrl', b: 'ibov', expected: -1 },
  { id: 'dxy-usdbrl', a: 'dxy', b: 'usdbrl', expected: 1 },
];

export const seriesById = (id: string) => INTERMARKET_SERIES.find((s) => s.id === id);
export const seriesName = (s: IntermarketSeries, lang: 'pt' | 'en') => (lang === 'en' ? s.en : s.pt);
export const seriesShort = (s: IntermarketSeries, lang: 'pt' | 'en') => (lang === 'en' ? s.shortEn : s.shortPt);
