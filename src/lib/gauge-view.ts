// Renderização do termômetro técnico em string (build e navegador). Todos os
// textos vêm deste código (sem dados externos), por isso não passam por escape.
import type { AssetKind } from '../data/assets';
import { formatPrice } from './format';
import type { Gauge, GaugeGroup, GaugeItem, Rating, Vote } from './gauge';

export const RATING_LABEL: Record<Rating, string> = {
  'forte-alta': 'Forte alta',
  alta: 'Alta',
  neutro: 'Neutro',
  baixa: 'Baixa',
  'forte-baixa': 'Forte baixa',
};

const RATING_TEXT: Record<Rating, string> = {
  'forte-alta': 'text-up',
  alta: 'text-up',
  neutro: 'text-muted',
  baixa: 'text-down',
  'forte-baixa': 'text-down',
};

const RATING_PILL: Record<Rating, string> = {
  'forte-alta': 'text-up border-up/60 bg-up/20',
  alta: 'text-up border-up/40 bg-up/10',
  neutro: 'text-muted border-border bg-surface-2',
  baixa: 'text-down border-down/40 bg-down/10',
  'forte-baixa': 'text-down border-down/60 bg-down/20',
};

const VOTE: Record<Vote, { label: string; cls: string }> = {
  1: { label: 'Alta', cls: RATING_PILL.alta },
  0: { label: 'Neutro', cls: RATING_PILL.neutro },
  [-1]: { label: 'Baixa', cls: RATING_PILL.baixa },
};

/** Etiqueta do viés, para listas de ativos. */
export const ratingPill = (r: Rating, extra = '') =>
  `<span class="inline-block whitespace-nowrap text-xs rounded-full border px-2 py-0.5 ${RATING_PILL[r]} ${extra}" title="Termômetro técnico (diário): ${RATING_LABEL[r]}">${RATING_LABEL[r]}</span>`;

// ---------- Mostrador ----------

// Nota −1…+1 → ângulo 180°…0°. Os segmentos seguem as faixas de ratingFor.
const BANDS: [number, number, string][] = [
  [-1, -0.5, 'var(--color-down)'],
  [-0.5, -0.1, 'color-mix(in srgb, var(--color-down) 45%, transparent)'],
  [-0.1, 0.1, 'var(--color-muted)'],
  [0.1, 0.5, 'color-mix(in srgb, var(--color-up) 45%, transparent)'],
  [0.5, 1, 'var(--color-up)'],
];
const angle = (score: number) => 180 - (Math.max(-1, Math.min(1, score)) + 1) * 90;
const xy = (deg: number, r: number) => {
  const rad = (deg * Math.PI) / 180;
  return [(100 + r * Math.cos(rad)).toFixed(2), (100 - r * Math.sin(rad)).toFixed(2)];
};
const pt = (deg: number, r: number) => xy(deg, r).join(' ');

function dial(score: number, label: string, width: number): string {
  const R = 80;
  const [nx, ny] = xy(angle(score), R - 14);
  const arcs = BANDS.map(([from, to, color]) => {
    const a1 = angle(from) - 1;
    const a2 = angle(to) + 1;
    return `<path d="M ${pt(a1, R)} A ${R} ${R} 0 0 1 ${pt(a2, R)}" stroke="${color}" stroke-width="16" fill="none"/>`;
  }).join('');
  return `<svg viewBox="0 0 200 110" width="${width}" class="max-w-full h-auto" role="img" aria-label="${label}">
  ${arcs}
  <line x1="100" y1="100" x2="${nx}" y2="${ny}" stroke="var(--color-text)" stroke-width="4" stroke-linecap="round"/>
  <circle cx="100" cy="100" r="7" fill="var(--color-text)"/>
</svg>`;
}

const scoreText = (s: number) => `${s > 0 ? '+' : s < 0 ? '−' : ''}${Math.abs(s).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const counts = (g: GaugeGroup) =>
  `<p class="text-xs mt-1"><span class="text-up">${g.up} alta</span> · <span class="text-muted">${g.neutral} neutro</span> · <span class="text-down">${g.down} baixa</span></p>`;

function miniGauge(title: string, g: GaugeGroup): string {
  return `<div class="flex flex-col items-center text-center">
  <p class="text-sm text-muted">${title}</p>
  ${dial(g.score, `${title}: ${RATING_LABEL[g.rating]}`, 150)}
  <p class="font-semibold -mt-1 ${RATING_TEXT[g.rating]}">${RATING_LABEL[g.rating]}</p>
  ${counts(g)}
</div>`;
}

// ---------- Tabela de indicadores ----------

const GUIDE: Record<string, string> = { sma: 'medias-moveis', ema: 'medias-moveis', rsi: 'rsi', stoch: 'estocastico', macd: 'macd', bb: 'bandas-de-bollinger' };

const num = (v: number, max = 2, min = max) => v.toLocaleString('pt-BR', { minimumFractionDigits: min, maximumFractionDigits: max });
/** Valores sem unidade fixa (MACD, momento): 4 algarismos significativos. */
const sig = (v: number) => v.toLocaleString('pt-BR', { maximumSignificantDigits: 4 });

function describe(item: GaugeItem, close: number, kind: AssetKind): { name: string; value: string; rule: string } {
  const ma = /^(sma|ema)(\d+)$/.exec(item.id);
  if (ma) {
    return {
      name: `${ma[1] === 'sma' ? 'Média móvel simples' : 'Média móvel exponencial'} (${ma[2]})`,
      value: formatPrice(item.value, kind),
      rule: `Preço ${close >= item.value ? 'acima' : 'abaixo'} da média`,
    };
  }
  switch (item.id) {
    case 'rsi':
      return { name: 'RSI (14)', value: num(item.value, 1), rule: 'Alta ≥ 55 · baixa ≤ 45' };
    case 'stoch':
      return { name: 'Estocástico (14, 3, 3)', value: `%K ${num(item.value, 1)} · %D ${num(item.aux!, 1)}`, rule: '%K acima de %D = alta' };
    case 'cci':
      return { name: 'CCI (20)', value: num(item.value, 0), rule: 'Alta > +100 · baixa < −100' };
    case 'adx':
      return { name: 'ADX (14)', value: `${num(item.value, 1)} · ${item.aux! >= 0 ? '+DI > −DI' : '−DI > +DI'}`, rule: 'Tendência se ADX ≥ 20; direção pelos DI' };
    case 'mom':
      return { name: 'Momento (10)', value: sig(item.value), rule: 'Fechamento contra 10 dias antes' };
    case 'macd':
      return { name: 'MACD (12, 26, 9)', value: `${sig(item.value)} · sinal ${sig(item.aux!)}`, rule: 'Linha acima do sinal = alta' };
    case 'bb':
      return { name: 'Bollinger %B (20, 2)', value: `${num(item.value, 0)}%`, rule: 'Alta > 80% · baixa < 20%' };
    default:
      return { name: item.id, value: sig(item.value), rule: '' };
  }
}

function itemRows(items: GaugeItem[], close: number, kind: AssetKind): string {
  return items
    .map((item) => {
      const d = describe(item, close, kind);
      const guide = GUIDE[item.id.replace(/\d+$/, '')];
      const name = guide ? `<a href="/indicadores/${guide}" class="hover:text-accent">${d.name}</a>` : d.name;
      const v = VOTE[item.vote];
      return `<tr class="border-t border-border">
  <td class="py-2 pr-3"><span class="font-medium">${name}</span><span class="block text-xs text-muted">${d.rule}</span></td>
  <td class="py-2 px-2 text-right font-mono tabular-nums text-sm whitespace-nowrap">${d.value}</td>
  <td class="py-2 pl-2 text-right"><span class="text-xs rounded-full border px-2 py-0.5 ${v.cls}">${v.label}</span></td>
</tr>`;
    })
    .join('');
}

const table = (title: string, g: GaugeGroup, close: number, kind: AssetKind) => `<div>
  <h3 class="text-sm font-semibold">${title}</h3>
  <table class="w-full text-sm mt-1">
    <thead class="sr-only"><tr><th>Indicador</th><th>Valor</th><th>Viés</th></tr></thead>
    <tbody>${itemRows(g.items, close, kind)}</tbody>
  </table>
</div>`;

const dateBR = (iso: string) => iso.split('-').reverse().join('/');

/** Conteúdo do bloco "Termômetro técnico" de um ativo. */
export function renderGauge(g: Gauge, kind: AssetKind): string {
  const total = g.ma.items.length + g.osc.items.length;
  return `<div class="grid gap-6 md:grid-cols-[1.3fr_1fr_1fr] items-center">
  <div class="flex flex-col items-center text-center">
    ${dial(g.score, `Resumo: ${RATING_LABEL[g.rating]}`, 240)}
    <p class="text-2xl font-bold -mt-1 ${RATING_TEXT[g.rating]}">${RATING_LABEL[g.rating]}</p>
    <p class="text-xs text-muted mt-1">Nota ${scoreText(g.score)} numa escala de −1 a +1</p>
  </div>
  ${miniGauge('Médias móveis', g.ma)}
  ${miniGauge('Osciladores', g.osc)}
</div>
<p class="text-xs text-muted mt-4">
  ${total} indicadores no gráfico diário, com o fechamento de ${dateBR(g.asOf)}${kind === 'fx' ? ' (referência do BCE; só fechamentos)' : ''}.
</p>
<details class="mt-3 group">
  <summary class="cursor-pointer text-sm text-accent select-none">Ver os ${total} indicadores</summary>
  <div class="grid gap-6 lg:grid-cols-2 mt-3">
    ${table('Médias móveis', g.ma, g.close, kind)}
    ${table('Osciladores', g.osc, g.close, kind)}
  </div>
</details>`;
}
