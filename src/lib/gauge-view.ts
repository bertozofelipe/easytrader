// Renderização do termômetro técnico em string (build e navegador). Todos os
// textos vêm deste código e de src/i18n (sem dados externos), por isso não
// passam por escape.
import type { AssetKind } from '../data/assets';
import { guidePath, LOCALE, type Lang } from '../i18n';
import { t } from '../i18n/ui';
import { formatDate, formatPrice } from './format';
import type { Gauge, GaugeGroup, GaugeItem, Rating, Vote } from './gauge';

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

/** Voto de um indicador mostrado como a faixa equivalente (sem o "forte"). */
const VOTE_RATING: Record<Vote, Rating> = { 1: 'alta', 0: 'neutro', [-1]: 'baixa' };

/** Etiqueta do viés, para listas de ativos. */
export const ratingPill = (r: Rating, lang: Lang, extra = '') => {
  const g = t(lang).gauge;
  return `<span class="inline-block whitespace-nowrap text-xs rounded-full border px-2 py-0.5 ${RATING_PILL[r]} ${extra}" title="${g.pillTitle}: ${g.rating[r]}">${g.rating[r]}</span>`;
};

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

const num = (v: number, lang: Lang, max = 2, min = max) => v.toLocaleString(LOCALE[lang], { minimumFractionDigits: min, maximumFractionDigits: max });
/** Valores sem unidade fixa (MACD, momento): 4 algarismos significativos. */
const sig = (v: number, lang: Lang) => v.toLocaleString(LOCALE[lang], { maximumSignificantDigits: 4 });
const scoreText = (s: number, lang: Lang) => `${s > 0 ? '+' : s < 0 ? '−' : ''}${num(Math.abs(s), lang)}`;

function counts(g: GaugeGroup, lang: Lang) {
  const s = t(lang).gauge;
  return `<p class="text-xs mt-1"><span class="text-up">${g.up} ${s.up}</span> · <span class="text-muted">${g.neutral} ${s.neutral}</span> · <span class="text-down">${g.down} ${s.down}</span></p>`;
}

function miniGauge(title: string, g: GaugeGroup, lang: Lang): string {
  const label = t(lang).gauge.rating[g.rating];
  return `<div class="flex flex-col items-center text-center">
  <p class="text-sm text-muted">${title}</p>
  ${dial(g.score, `${title}: ${label}`, 150)}
  <p class="font-semibold -mt-1 ${RATING_TEXT[g.rating]}">${label}</p>
  ${counts(g, lang)}
</div>`;
}

// ---------- Tabela de indicadores ----------

const GUIDE: Record<string, string> = { sma: 'medias-moveis', ema: 'medias-moveis', rsi: 'rsi', stoch: 'estocastico', macd: 'macd', bb: 'bandas-de-bollinger' };

function describe(item: GaugeItem, close: number, kind: AssetKind, lang: Lang): { name: string; value: string; rule: string } {
  const s = t(lang).gauge;
  const ma = /^(sma|ema)(\d+)$/.exec(item.id);
  if (ma) {
    return {
      name: `${ma[1] === 'sma' ? s.sma : s.ema} (${ma[2]})`,
      value: formatPrice(item.value, kind, lang),
      rule: s.priceVs(close >= item.value),
    };
  }
  const id = item.id as keyof typeof s.names;
  const name = s.names[id] ?? item.id;
  const rule = s.rules[id] ?? '';
  switch (id) {
    case 'rsi':
      return { name, rule, value: num(item.value, lang, 1) };
    case 'stoch':
      return { name, rule, value: `%K ${num(item.value, lang, 1)} · %D ${num(item.aux!, lang, 1)}` };
    case 'cci':
      return { name, rule, value: num(item.value, lang, 0) };
    case 'adx':
      return { name, rule, value: `${num(item.value, lang, 1)} · ${item.aux! >= 0 ? '+DI > −DI' : '−DI > +DI'}` };
    case 'macd':
      return { name, rule, value: `${sig(item.value, lang)} · ${s.signal} ${sig(item.aux!, lang)}` };
    case 'bb':
      return { name, rule, value: `${num(item.value, lang, 0)}%` };
    default:
      return { name, rule, value: sig(item.value, lang) };
  }
}

function itemRows(items: GaugeItem[], close: number, kind: AssetKind, lang: Lang): string {
  const s = t(lang);
  return items
    .map((item) => {
      const d = describe(item, close, kind, lang);
      const guide = GUIDE[item.id.replace(/\d+$/, '')];
      const name = guide ? `<a href="${guidePath(guide, lang)}" class="hover:text-accent">${d.name}</a>` : d.name;
      const r = VOTE_RATING[item.vote];
      return `<tr class="border-t border-border">
  <td class="py-2 pr-3"><span class="font-medium">${name}</span><span class="block text-xs text-muted">${d.rule}</span></td>
  <td class="py-2 px-2 text-right font-mono tabular-nums text-sm whitespace-nowrap">${d.value}</td>
  <td class="py-2 pl-2 text-right"><span class="text-xs rounded-full border px-2 py-0.5 whitespace-nowrap ${RATING_PILL[r]}">${s.gauge.rating[r]}</span></td>
</tr>`;
    })
    .join('');
}

function table(title: string, g: GaugeGroup, close: number, kind: AssetKind, lang: Lang) {
  const th = t(lang).gauge.th;
  return `<div>
  <h3 class="text-sm font-semibold">${title}</h3>
  <table class="w-full text-sm mt-1">
    <thead class="sr-only"><tr><th>${th.indicator}</th><th>${th.value}</th><th>${th.bias}</th></tr></thead>
    <tbody>${itemRows(g.items, close, kind, lang)}</tbody>
  </table>
</div>`;
}

/** Conteúdo do bloco "Termômetro técnico" de um ativo. */
export function renderGauge(g: Gauge, kind: AssetKind, lang: Lang): string {
  const s = t(lang).gauge;
  const total = g.ma.items.length + g.osc.items.length;
  return `<div class="grid gap-6 md:grid-cols-[1.3fr_1fr_1fr] items-center">
  <div class="flex flex-col items-center text-center">
    ${dial(g.score, `${s.summary}: ${s.rating[g.rating]}`, 240)}
    <p class="text-2xl font-bold -mt-1 ${RATING_TEXT[g.rating]}">${s.rating[g.rating]}</p>
    <p class="text-xs text-muted mt-1">${s.score(scoreText(g.score, lang))}</p>
  </div>
  ${miniGauge(s.ma, g.ma, lang)}
  ${miniGauge(s.osc, g.osc, lang)}
</div>
<p class="text-xs text-muted mt-4">${s.footer(total, formatDate(g.asOf, lang), kind === 'fx')}</p>
<details class="mt-3 group">
  <summary class="cursor-pointer text-sm text-accent select-none">${s.showAll(total)}</summary>
  <div class="grid gap-6 lg:grid-cols-2 mt-3">
    ${table(s.ma, g.ma, g.close, kind, lang)}
    ${table(s.osc, g.osc, g.close, kind, lang)}
  </div>
</details>`;
}
