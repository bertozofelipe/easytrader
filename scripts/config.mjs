// Configuração dos coletores. A lista de ativos vem de src/data/assets.ts
// (fonte única, compartilhada com o site).
import { ASSETS } from '../src/data/assets.ts';

export const REPO = 'bertozofelipe/easytrader';
export const DATA_BRANCH = 'data';
export const PREVIOUS_DATA_URL = `https://raw.githubusercontent.com/${REPO}/${DATA_BRANCH}`;

export const CRYPTO_TOP_N = 50;

// Moedas que aparecem no ticker (ids da CoinGecko).
export const TICKER_CRYPTO = ASSETS.filter((a) => a.kind === 'crypto' && a.ticker).map((a) => a.coingecko);

// Ações e ETFs dos EUA (Finnhub).
export const US_SYMBOLS = ASSETS.filter((a) => ['index', 'commodity', 'stock'].includes(a.kind)).map((a) => ({
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
