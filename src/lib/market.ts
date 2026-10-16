// Dados de mercado publicados pelo GitHub Actions no branch `data`.
// raw.githubusercontent.com libera CORS e faz cache de 5 min.
import type { AssetKind, DatasetName } from '../data/assets';
import type { Gauge } from './gauge';

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
  /** Só em fx.json: 1 USD = values[código] (referência do BCE do dia `date`). */
  rates?: { base: 'USD'; date: string; values: Record<string, number> };
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

/** Termômetro técnico por ativo (slug), no gráfico diário. */
export interface SignalsData extends Dataset {
  timeframe: '1d';
  failed: string[];
  assets: Record<string, Gauge>;
}

export type IntradayTf = '15m' | '1h' | '4h';
export type GaugeTf = IntradayTf | '1d';
export const GAUGE_TFS: GaugeTf[] = ['15m', '1h', '4h', '1d'];

/** Termômetro em 15 min, 1H e 4H (signals-intraday.json); `asOf` é o fechamento do candle (ISO). */
export interface SignalsIntradayData extends Dataset {
  failed: string[];
  /** Coletor com chave da Twelve Data (ações, ETFs e câmbio). */
  twelveData: boolean;
  assets: Record<string, Partial<Record<IntradayTf, Gauge>> & { computedAt: string }>;
}

export type NewsCategory = 'mercados' | 'brasil' | 'forex' | 'cripto' | 'commodities';

export interface NewsItem {
  title: string;
  link: string;
  summary: string;
  image: string | null;
  date: string;
  source: string;
  category: NewsCategory;
  lang: 'pt' | 'en';
  /** Id em src/data/commodities.ts, quando a matéria trata de uma commodity. */
  commodity?: string;
}

export interface NewsData extends Dataset {
  failed: string[];
  items: NewsItem[];
}

/** Arquivos de dados de cotação, por nome (ver datasetFor). */
export type Datasets = { crypto?: CryptoData | null } & Partial<Record<Exclude<DatasetName, 'crypto'>, QuotesData | null>>;

const QUOTE_DATASETS: DatasetName[] = ['us', 'fx', 'crypto', 'cboe'];

/** Build: carrega os arquivos de cotação pedidos (padrão: todos). */
export async function loadDatasets(names: DatasetName[] = QUOTE_DATASETS): Promise<Datasets> {
  const values = await Promise.all(names.map((n) => loadData(n)));
  return Object.fromEntries(names.map((n, i) => [n, values[i]])) as Datasets;
}

/** Navegador: busca as versões mais recentes dos arquivos de cotação pedidos. */
export async function fetchDatasets(names: DatasetName[] = QUOTE_DATASETS): Promise<Datasets> {
  const values = await Promise.all(names.map((n) => fetchLatest(n)));
  return Object.fromEntries(names.map((n, i) => [n, values[i]])) as Datasets;
}
