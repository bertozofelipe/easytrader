// Simulação de aprovação em teste de mesa proprietária (sem DOM, para poder testar).
import type { Lang } from '../i18n';

export interface PropInput {
  /** Meta de lucro do desafio, em % da conta inicial. */
  targetPct: number;
  /** Perda máxima total permitida, em % da conta inicial. */
  maxLossPct: number;
  /** Perda máxima em um dia, em % da conta inicial (null = a mesa não tem esse limite). */
  dailyLossPct: number | null;
  /** Risco por operação, em % da conta inicial. */
  riskPct: number;
  /** Taxa de acerto, em %. */
  winRate: number;
  /** Retorno/risco de cada operação: 2 = ganha o dobro do que arrisca. */
  rr: number;
  tradesPerDay: number;
  /** Prazo do desafio em dias de operação (null = sem prazo). */
  maxDays: number | null;
  /** Preço do desafio, para estimar o custo por aprovação (opcional). */
  fee?: number | null;
}

export interface PropResult {
  passPct: number;
  failTotalPct: number;
  failDailyPct: number;
  timeoutPct: number;
  /** Mediana de dias de operação até bater a meta, entre as simulações aprovadas. */
  medianDays: number | null;
  /** Ganho esperado por operação, em múltiplos do risco (R). */
  expectancyR: number;
  /** Taxa de acerto mínima para empatar com esse retorno/risco. */
  breakEvenWinRate: number;
  /** Perdas seguidas que esgotam o limite total. */
  lossesToBust: number;
  /** Perdas seguidas no mesmo dia que esgotam o limite diário. */
  lossesToDailyLimit: number | null;
  /** Operações necessárias para a meta se tudo andasse na média (null se a expectativa não é positiva). */
  tradesAtAverage: number | null;
  /** Custo esperado até uma aprovação (preço ÷ chance de passar). */
  costPerPass: number | null;
  runs: number;
}

export type PropError = 'target' | 'maxLoss' | 'dailyLoss' | 'risk' | 'winRate' | 'rr' | 'trades' | 'days';

export const PROP_RUNS = 5000;
/** Sem prazo, a simulação para neste número de dias e conta como "não terminou". */
const NO_DEADLINE_CAP = 500;
const EPS = 1e-9;

const positive = (n: number | null | undefined): n is number => n != null && Number.isFinite(n) && n > 0;

/** Gerador pseudoaleatório com semente fixa: os mesmos números dão sempre o mesmo resultado. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function simulateProp(i: PropInput, runs = PROP_RUNS): { ok: true; result: PropResult } | { ok: false; error: PropError } {
  if (!positive(i.targetPct)) return { ok: false, error: 'target' };
  if (!positive(i.maxLossPct) || i.maxLossPct > 100) return { ok: false, error: 'maxLoss' };
  if (i.dailyLossPct != null && !positive(i.dailyLossPct)) return { ok: false, error: 'dailyLoss' };
  if (!positive(i.riskPct) || i.riskPct > 100) return { ok: false, error: 'risk' };
  if (!Number.isFinite(i.winRate) || i.winRate < 0 || i.winRate > 100) return { ok: false, error: 'winRate' };
  if (!positive(i.rr)) return { ok: false, error: 'rr' };
  if (!positive(i.tradesPerDay) || !Number.isInteger(i.tradesPerDay) || i.tradesPerDay > 100) return { ok: false, error: 'trades' };
  if (i.maxDays != null && (!positive(i.maxDays) || !Number.isInteger(i.maxDays))) return { ok: false, error: 'days' };

  const p = i.winRate / 100;
  const win = i.riskPct * i.rr;
  const loss = i.riskPct;
  const deadline = i.maxDays ?? NO_DEADLINE_CAP;
  const rand = mulberry32(20260101);

  let pass = 0;
  let failTotal = 0;
  let failDaily = 0;
  let timeout = 0;
  const passDays: number[] = [];

  for (let r = 0; r < runs; r++) {
    let equity = 0;
    let outcome: 'pass' | 'total' | 'daily' | 'timeout' = 'timeout';
    let day = 0;
    run: for (day = 1; day <= deadline; day++) {
      let dayPnl = 0;
      for (let t = 0; t < i.tradesPerDay; t++) {
        const pnl = rand() < p ? win : -loss;
        equity += pnl;
        dayPnl += pnl;
        if (equity >= i.targetPct - EPS) {
          outcome = 'pass';
          break run;
        }
        if (equity <= -i.maxLossPct + EPS) {
          outcome = 'total';
          break run;
        }
        if (i.dailyLossPct != null && dayPnl <= -i.dailyLossPct + EPS) {
          outcome = 'daily';
          break run;
        }
      }
    }
    if (outcome === 'pass') {
      pass++;
      passDays.push(day);
    } else if (outcome === 'total') failTotal++;
    else if (outcome === 'daily') failDaily++;
    else timeout++;
  }

  passDays.sort((a, b) => a - b);
  const expectancyR = p * i.rr - (1 - p);
  const pct = (n: number) => (n / runs) * 100;
  const passPct = pct(pass);

  return {
    ok: true,
    result: {
      passPct,
      failTotalPct: pct(failTotal),
      failDailyPct: pct(failDaily),
      timeoutPct: pct(timeout),
      medianDays: passDays.length ? passDays[Math.floor(passDays.length / 2)] : null,
      expectancyR,
      breakEvenWinRate: 100 / (1 + i.rr),
      lossesToBust: Math.ceil(i.maxLossPct / loss - EPS),
      lossesToDailyLimit: i.dailyLossPct != null ? Math.ceil(i.dailyLossPct / loss - EPS) : null,
      tradesAtAverage: expectancyR > 0 ? Math.ceil(i.targetPct / (loss * expectancyR) - EPS) : null,
      costPerPass: positive(i.fee) && pass > 0 ? i.fee / (pass / runs) : null,
      runs,
    },
  };
}

export const PROP_ERROR_MSG: Record<Lang, Record<PropError, string>> = {
  pt: {
    target: 'Informe a meta de lucro (maior que 0%).',
    maxLoss: 'Informe a perda máxima total (entre 0 e 100%).',
    dailyLoss: 'A perda diária precisa ser maior que 0%, ou deixe o campo vazio.',
    risk: 'Informe o risco por operação (entre 0 e 100%).',
    winRate: 'A taxa de acerto fica entre 0 e 100%.',
    rr: 'Informe o retorno/risco (maior que 0).',
    trades: 'Operações por dia: um número inteiro entre 1 e 100.',
    days: 'O prazo deve ser um número inteiro de dias, ou deixe o campo vazio.',
  },
  en: {
    target: 'Enter the profit target (greater than 0%).',
    maxLoss: 'Enter the maximum total loss (between 0 and 100%).',
    dailyLoss: 'Daily loss must be greater than 0%, or leave the field empty.',
    risk: 'Enter the risk per trade (between 0 and 100%).',
    winRate: 'Win rate is between 0 and 100%.',
    rr: 'Enter the reward/risk ratio (greater than 0).',
    trades: 'Trades per day: a whole number between 1 and 100.',
    days: 'The time limit must be a whole number of days, or leave the field empty.',
  },
};
