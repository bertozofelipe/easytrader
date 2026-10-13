// Dados de mercado publicados pelo GitHub Actions no branch `data`.
// raw.githubusercontent.com libera CORS e faz cache de 5 min.
import type { AssetKind } from '../data/assets';

export type { AssetKind };

export const DATA_URL = 'https://raw.githubusercontent.com/bertozofelipe/easytrader/data';

// Considera os dados desatualizados após esse tempo.
export const STALE_AFTER_MS = 60 * 60 * 1000;

interface Dataset {
  updatedAt: string;
  stale?: boolean;
  source?: string;
}

export interface TickerItem {
  id: string;
  slug?: string;
  label: string;
  sub: string;
  price: number;
  changePct: number | null;
  kind: AssetKind;
}

export interface TickerData extends Dataset {
  items: TickerItem[];
}

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  rank: number;
  price: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  change1h: number | null;
  change24h: number | null;
  change7d: number | null;
  ath: number;
  athChangePct: number;
  sparkline7d: number[];
}

export interface CryptoData extends Dataset {
  coins: Coin[];
  global: {
    totalMarketCap: number | null;
    totalVolume: number | null;
    marketCapChange24h: number | null;
    btcDominance: number | null;
    ethDominance: number | null;
    activeCryptocurrencies: number | null;
  };
}

export interface SentimentData extends Dataset {
  current: { date: string; value: number; label: string };
  history: { date: string; value: number; label: string }[];
}

export interface Quote {
  symbol: string;
  name: string;
  kind: AssetKind;
  price: number;
  prevClose: number;
  open?: number;
  high?: number;
  low?: number;
  changePct: number | null;
  asOf: string;
}

export interface QuotesData extends Dataset {
  quotes: Quote[];
}

const cache = new Map<string, Promise<unknown>>();

/**
 * Busca um JSON de dados. No build, o resultado é memorizado para não repetir
 * a requisição em cada página; em caso de erro devolve null (a página renderiza
 * sem dados e o navegador tenta de novo).
 */
export function loadData<T>(name: string): Promise<T | null> {
  if (!cache.has(name)) {
    cache.set(
      name,
      fetch(`${DATA_URL}/${name}.json`, { signal: AbortSignal.timeout(10_000) })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    );
  }
  return cache.get(name) as Promise<T | null>;
}

/** Versão para o navegador: sempre busca a versão mais recente. */
export async function fetchLatest<T>(name: string): Promise<T | null> {
  try {
    const res = await fetch(`${DATA_URL}/${name}.json`, { cache: 'no-cache' });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

export const isStale = (iso: string) => Date.now() - new Date(iso).getTime() > STALE_AFTER_MS;

export type NewsCategory = 'mercados' | 'brasil' | 'forex' | 'cripto';

export interface NewsItem {
  title: string;
  link: string;
  summary: string;
  image: string | null;
  date: string;
  source: string;
  category: NewsCategory;
  lang: 'pt' | 'en';
}

export interface NewsData extends Dataset {
  failed: string[];
  items: NewsItem[];
}
