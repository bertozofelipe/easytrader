// Navegador: tabela de cotações em dólar compartilhada pelo conversor e pela
// calculadora de pip (uma busca por atualização, mesmo com as duas na página).
import { buildUsdTable, type UsdTable } from './fx';
import { fetchDatasets, type CryptoData, type QuotesData } from './market';

export interface FxSnapshot {
  table: UsdTable;
  fx: QuotesData | null;
  crypto: CryptoData | null;
}

let pending: Promise<FxSnapshot> | null = null;
let fetchedAt = 0;

export function loadFxSnapshot(): Promise<FxSnapshot> {
  if (!pending || Date.now() - fetchedAt > 60_000) {
    fetchedAt = Date.now();
    pending = fetchDatasets(['fx', 'crypto']).then((ds) => ({
      table: buildUsdTable(ds.fx, ds.crypto),
      fx: ds.fx ?? null,
      crypto: ds.crypto ?? null,
    }));
  }
  return pending;
}

/** Data da referência do BCE (AAAA-MM-DD). */
export const fxDate = (fx: QuotesData | null): string | null => fx?.rates?.date ?? fx?.quotes[0]?.asOf ?? null;
