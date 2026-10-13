// Cálculo de tamanho de posição e risco-retorno (sem DOM, para poder testar).

export interface PositionInput {
  /** Capital da conta. */
  capital: number;
  /** Quanto do capital aceita perder se o stop for atingido, em %. */
  riskPct: number;
  entry: number;
  stop: number;
  /** Alvo opcional, para a relação risco-retorno. */
  target?: number | null;
}

export interface PositionResult {
  side: 'compra' | 'venda';
  /** Valor em risco (perda se o stop for atingido). */
  riskAmount: number;
  /** Distância entrada → stop por unidade. */
  riskPerUnit: number;
  stopPct: number;
  /** Quantidade de unidades (ações, moedas, contratos…). */
  units: number;
  /** Valor da posição (unidades × entrada). */
  positionValue: number;
  /** Valor da posição em % do capital (acima de 100% exige alavancagem). */
  exposurePct: number;
  target: {
    reward: number;
    rewardPerUnit: number;
    targetPct: number;
    /** Relação retorno/risco: 2 = alvo duas vezes maior que o stop. */
    ratio: number;
    /** Taxa de acerto mínima para empatar no longo prazo, sem custos. */
    breakEvenWinRate: number;
  } | null;
}

export type PositionError =
  | 'capital'
  | 'risk'
  | 'entry'
  | 'stop'
  | 'same-price'
  | 'target-side';

const positive = (n: number | null | undefined): n is number => n != null && Number.isFinite(n) && n > 0;

export function calcPosition(i: PositionInput): { ok: true; result: PositionResult } | { ok: false; error: PositionError } {
  if (!positive(i.capital)) return { ok: false, error: 'capital' };
  if (!positive(i.riskPct) || i.riskPct > 100) return { ok: false, error: 'risk' };
  if (!positive(i.entry)) return { ok: false, error: 'entry' };
  if (!positive(i.stop)) return { ok: false, error: 'stop' };
  if (i.entry === i.stop) return { ok: false, error: 'same-price' };

  const side = i.stop < i.entry ? 'compra' : 'venda';
  const riskPerUnit = Math.abs(i.entry - i.stop);
  const riskAmount = (i.capital * i.riskPct) / 100;
  const units = riskAmount / riskPerUnit;
  const positionValue = units * i.entry;

  let target: PositionResult['target'] = null;
  if (i.target != null && Number.isFinite(i.target)) {
    const rewardPerUnit = side === 'compra' ? i.target - i.entry : i.entry - i.target;
    if (!(rewardPerUnit > 0)) return { ok: false, error: 'target-side' };
    const ratio = rewardPerUnit / riskPerUnit;
    target = {
      reward: units * rewardPerUnit,
      rewardPerUnit,
      targetPct: (rewardPerUnit / i.entry) * 100,
      ratio,
      breakEvenWinRate: 100 / (1 + ratio),
    };
  }

  return {
    ok: true,
    result: {
      side,
      riskAmount,
      riskPerUnit,
      stopPct: (riskPerUnit / i.entry) * 100,
      units,
      positionValue,
      exposurePct: (positionValue / i.capital) * 100,
      target,
    },
  };
}

export const POSITION_ERROR_MSG: Record<PositionError, string> = {
  capital: 'Informe o capital da conta.',
  risk: 'Informe o risco por operação (entre 0 e 100%).',
  entry: 'Informe o preço de entrada.',
  stop: 'Informe o preço do stop.',
  'same-price': 'O stop precisa ser diferente da entrada.',
  'target-side': 'O alvo precisa estar do lado oposto ao stop: acima da entrada numa compra, abaixo numa venda.',
};

/** Aceita "1.234,56", "1234,56" e "1234.56". */
export function parseNumber(raw: string): number | null {
  const s = raw.trim().replace(/\s|R\$|US\$|\$|%/g, '');
  if (!s) return null;
  const normalized = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}
