// Ativos coletados pelos jobs de dados. Editar aqui para incluir/remover.

export const REPO = 'bertozofelipe/easytrader';
export const DATA_BRANCH = 'data';
export const PREVIOUS_DATA_URL = `https://raw.githubusercontent.com/${REPO}/${DATA_BRANCH}`;

export const CRYPTO_TOP_N = 50;

// Moedas que aparecem no ticker (ids da CoinGecko).
export const TICKER_CRYPTO = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple'];

// Índices são representados por ETFs que os replicam (disponíveis no plano free da Finnhub).
export const US_SYMBOLS = [
  { symbol: 'SPY', name: 'S&P 500', kind: 'index', ticker: true },
  { symbol: 'QQQ', name: 'Nasdaq 100', kind: 'index', ticker: true },
  { symbol: 'DIA', name: 'Dow Jones', kind: 'index', ticker: false },
  { symbol: 'IWM', name: 'Russell 2000', kind: 'index', ticker: false },
  { symbol: 'GLD', name: 'Ouro', kind: 'commodity', ticker: true },
  { symbol: 'USO', name: 'Petróleo WTI', kind: 'commodity', ticker: false },
  { symbol: 'AAPL', name: 'Apple', kind: 'stock', ticker: false },
  { symbol: 'MSFT', name: 'Microsoft', kind: 'stock', ticker: false },
  { symbol: 'NVDA', name: 'Nvidia', kind: 'stock', ticker: false },
  { symbol: 'AMZN', name: 'Amazon', kind: 'stock', ticker: false },
  { symbol: 'GOOGL', name: 'Alphabet', kind: 'stock', ticker: false },
  { symbol: 'META', name: 'Meta', kind: 'stock', ticker: false },
  { symbol: 'TSLA', name: 'Tesla', kind: 'stock', ticker: false },
];

// Pares de moedas (fonte: BCE via Frankfurter, atualização diária).
// invert = true quando a cotação é exibida como XXX/USD (ex.: EUR/USD).
export const FX_PAIRS = [
  { code: 'EUR', label: 'EUR/USD', invert: true, ticker: true },
  { code: 'GBP', label: 'GBP/USD', invert: true, ticker: false },
  { code: 'JPY', label: 'USD/JPY', invert: false, ticker: false },
  { code: 'BRL', label: 'USD/BRL', invert: false, ticker: true },
];
