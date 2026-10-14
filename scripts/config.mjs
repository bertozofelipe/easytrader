// Configuração dos coletores. A lista de ativos vem de src/data/assets.ts
// (fonte única, compartilhada com o site).
import { ASSETS, datasetFor } from '../src/data/assets.ts';
import { CURRENCIES } from '../src/data/currencies.ts';

export const REPO = 'bertozofelipe/easytrader';
export const DATA_BRANCH = 'data';
export const PREVIOUS_DATA_URL = `https://raw.githubusercontent.com/${REPO}/${DATA_BRANCH}`;

export const CRYPTO_TOP_N = 50;

// Moedas que aparecem no ticker (ids da CoinGecko).
export const TICKER_CRYPTO = ASSETS.filter((a) => a.kind === 'crypto' && a.ticker).map((a) => a.coingecko);

// Ações e ETFs dos EUA (Finnhub).
export const US_SYMBOLS = ASSETS.filter((a) => datasetFor(a) === 'us').map((a) => ({
  symbol: a.symbol,
  name: a.name,
  kind: a.kind,
  ticker: Boolean(a.ticker),
}));

// Pares de moedas (Frankfurter). invert = true quando exibido como XXX/USD.
export const FX_PAIRS = ASSETS.filter((a) => a.kind === 'fx').map((a) => ({
  code: a.fx.code,
  label: a.symbol,
  invert: a.fx.invert,
  ticker: Boolean(a.ticker),
}));

// Moedas extras para o conversor e a calculadora de pip.
export const FX_CURRENCIES = CURRENCIES.map((c) => c.code);

// Índices calculados pela Cboe (VIX).
export const CBOE_ASSETS = ASSETS.filter((a) => datasetFor(a) === 'cboe');
