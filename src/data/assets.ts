// Cadastro único de ativos. Usado pelo site (páginas /ativos/[slug]) e pelos
// coletores em scripts/ (Node importa este .ts direto via type stripping),
// então use só sintaxe TypeScript "apagável" (sem enum/namespace).

export type AssetKind = 'crypto' | 'index' | 'commodity' | 'stock' | 'fx';

export interface Asset {
  slug: string;
  name: string;
  /** Nome em inglês, quando difere. */
  nameEn?: string;
  symbol: string;
  kind: AssetKind;
  /** Símbolo para o widget do TradingView (ativos sem gráfico próprio). */
  tv?: string;
  /** Id na CoinGecko (cripto). */
  coingecko?: string;
  /** Par na Binance para candles (cripto). */
  binance?: string;
  /** Aparece na faixa de cotações. */
  ticker?: boolean;
  /** Para índices/commodities via ETF: o que o ETF replica. */
  tracks?: string;
  tracksEn?: string;
  /** Símbolo na Cboe para índices calculados por ela (ex.: _VIX). */
  cboe?: string;
  /** Texto "Sobre" específico (substitui o texto padrão do tipo). */
  about?: string;
  aboutEn?: string;
  /** Código da moeda na Frankfurter e se a cotação é XXX/USD. */
  fx?: { code: string; invert: boolean };
}

const crypto = (coingecko: string, symbol: string, name: string, ticker = false): Asset => ({
  slug: symbol.toLowerCase(),
  name,
  symbol,
  kind: 'crypto',
  coingecko,
  binance: `${symbol}USDT`,
  ticker,
});

export const ASSETS: Asset[] = [
  // Índices e commodities (via ETFs, plano free da Finnhub)
  { slug: 'spy', name: 'S&P 500', symbol: 'SPY', kind: 'index', tv: 'AMEX:SPY', tracks: 'S&P 500', ticker: true },
  { slug: 'qqq', name: 'Nasdaq 100', symbol: 'QQQ', kind: 'index', tv: 'NASDAQ:QQQ', tracks: 'Nasdaq 100', ticker: true },
  { slug: 'dia', name: 'Dow Jones', symbol: 'DIA', kind: 'index', tv: 'AMEX:DIA', tracks: 'Dow Jones Industrial Average' },
  { slug: 'vix', name: 'Índice de volatilidade', nameEn: 'Volatility Index', symbol: 'VIX', kind: 'index', cboe: '_VIX', tv: 'TVC:VIX', about: 'O VIX é calculado pela Cboe a partir dos preços das opções do S&P 500 e mede a volatilidade que o mercado espera para os próximos 30 dias. É conhecido como "índice do medo" porque costuma subir quando as ações caem: abaixo de 20 indica mercado calmo; acima de 30, estresse elevado. Os valores são pontos do índice, com 15 minutos de atraso.', aboutEn: 'The VIX is calculated by Cboe from S&P 500 option prices and measures the volatility the market expects over the next 30 days. It is known as the "fear index" because it tends to rise when stocks fall: below 20 suggests a calm market; above 30, elevated stress. Values are index points, delayed 15 minutes.' },
  { slug: 'iwm', name: 'Russell 2000', symbol: 'IWM', kind: 'index', tv: 'AMEX:IWM', tracks: 'Russell 2000' },
  { slug: 'gld', name: 'Ouro', nameEn: 'Gold', symbol: 'GLD', kind: 'commodity', tv: 'AMEX:GLD', tracks: 'preço do ouro', tracksEn: 'gold price', ticker: true },
  { slug: 'uso', name: 'Petróleo WTI', nameEn: 'WTI Crude Oil', symbol: 'USO', kind: 'commodity', tv: 'AMEX:USO', tracks: 'petróleo WTI', tracksEn: 'WTI crude oil' },

  // Ações dos EUA
  { slug: 'aapl', name: 'Apple', symbol: 'AAPL', kind: 'stock', tv: 'NASDAQ:AAPL' },
  { slug: 'msft', name: 'Microsoft', symbol: 'MSFT', kind: 'stock', tv: 'NASDAQ:MSFT' },
  { slug: 'nvda', name: 'Nvidia', symbol: 'NVDA', kind: 'stock', tv: 'NASDAQ:NVDA' },
  { slug: 'amzn', name: 'Amazon', symbol: 'AMZN', kind: 'stock', tv: 'NASDAQ:AMZN' },
  { slug: 'googl', name: 'Alphabet', symbol: 'GOOGL', kind: 'stock', tv: 'NASDAQ:GOOGL' },
  { slug: 'meta', name: 'Meta', symbol: 'META', kind: 'stock', tv: 'NASDAQ:META' },
  { slug: 'tsla', name: 'Tesla', symbol: 'TSLA', kind: 'stock', tv: 'NASDAQ:TSLA' },

  // Câmbio (referência diária do BCE)
  { slug: 'eurusd', name: 'Euro / Dólar', nameEn: 'Euro / US Dollar', symbol: 'EUR/USD', kind: 'fx', tv: 'FX:EURUSD', fx: { code: 'EUR', invert: true }, ticker: true },
  { slug: 'gbpusd', name: 'Libra / Dólar', nameEn: 'British Pound / US Dollar', symbol: 'GBP/USD', kind: 'fx', tv: 'FX:GBPUSD', fx: { code: 'GBP', invert: true } },
  { slug: 'usdjpy', name: 'Dólar / Iene', nameEn: 'US Dollar / Japanese Yen', symbol: 'USD/JPY', kind: 'fx', tv: 'FX:USDJPY', fx: { code: 'JPY', invert: false } },
  { slug: 'usdbrl', name: 'Dólar / Real', nameEn: 'US Dollar / Brazilian Real', symbol: 'USD/BRL', kind: 'fx', tv: 'FX_IDC:USDBRL', fx: { code: 'BRL', invert: false }, ticker: true },

  // Cripto (gráfico próprio com candles da Binance)
  crypto('bitcoin', 'BTC', 'Bitcoin', true),
  crypto('ethereum', 'ETH', 'Ethereum', true),
  crypto('solana', 'SOL', 'Solana', true),
  crypto('binancecoin', 'BNB', 'BNB', true),
  crypto('ripple', 'XRP', 'XRP', true),
  crypto('cardano', 'ADA', 'Cardano'),
  crypto('dogecoin', 'DOGE', 'Dogecoin'),
  crypto('tron', 'TRX', 'TRON'),
  crypto('avalanche-2', 'AVAX', 'Avalanche'),
  crypto('chainlink', 'LINK', 'Chainlink'),
  crypto('polkadot', 'DOT', 'Polkadot'),
  crypto('litecoin', 'LTC', 'Litecoin'),
];

export type DatasetName = 'us' | 'fx' | 'crypto' | 'cboe';

/** Em qual arquivo de dados está a cotação do ativo. */
export function datasetFor(a: Asset): DatasetName {
  if (a.kind === 'crypto') return 'crypto';
  if (a.kind === 'fx') return 'fx';
  if (a.cboe) return 'cboe';
  return 'us';
}

/** Nome do ativo no idioma (sem tradução: o nome original). */
export const assetName = (a: Asset, lang: 'pt' | 'en') => (lang === 'en' && a.nameEn) || a.name;

export const assetBySlug = (slug: string) => ASSETS.find((a) => a.slug === slug);
export const assetByCoingecko = (id: string) => ASSETS.find((a) => a.coingecko === id);

/** Agrupamento da página /ativos (títulos e notas em src/i18n/ui.ts). */
export const ASSET_GROUPS: { id: string; kinds: AssetKind[] }[] = [
  { id: 'indices', kinds: ['index', 'commodity'] },
  { id: 'acoes', kinds: ['stock'] },
  { id: 'cambio', kinds: ['fx'] },
  { id: 'cripto', kinds: ['crypto'] },
];
