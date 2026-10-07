// Dados de mercado publicados pelo GitHub Actions no branch `data`.
// raw.githubusercontent.com libera CORS e faz cache de 5 min.
export const DATA_URL = 'https://raw.githubusercontent.com/bertozofelipe/easytrader/data';

export type AssetKind = 'crypto' | 'index' | 'commodity' | 'stock' | 'fx';

export interface TickerItem {
  id: string;
  label: string;
  sub: string;
  price: number;
  changePct: number | null;
  kind: AssetKind;
}

export interface TickerData {
  updatedAt: string;
  items: TickerItem[];
}

// Considera os dados desatualizados após esse tempo.
export const STALE_AFTER_MS = 60 * 60 * 1000;

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
