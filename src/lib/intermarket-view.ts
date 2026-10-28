// Renderização da análise intermercados em string (build e navegador). Textos
// vêm de src/i18n e de src/data/intermarket.ts (sem dados externos), por isso
// não passam por escape.
import { CHANGE_LAG, INTERMARKET_GROUPS, INTERMARKET_SERIES, seriesById, seriesName, seriesShort, type ClassicPair, type CorrWindow, type IntermarketSeries } from '../data/intermarket';
import { assetPath, type Lang } from '../i18n';
import { t } from '../i18n/ui';
import { formatNumber, formatPct, trendClass } from './format';
import { classicStatus, pairCorr, strength, type PairCorr, type Returns } from './intermarket';
import type { IntermarketData } from './market';
import { sparkline } from './render';

/** Correlação com sinal e duas casas (−0,42 / +0,15). */
export const formatCorr = (r: number | null, lang: Lang) => (r == null ? '—' : `${r > 0 ? '+' : r < 0 ? '−' : ''}${formatNumber(Math.abs(r), lang, 2)}`);

/** Azul para positiva, laranja para negativa (sem verde/vermelho: não é sinal de compra ou venda). */
export function corrBg(r: number | null): string {
  if (r == null) return 'transparent';
  const alpha = (Math.min(1, Math.abs(r)) * 0.7).toFixed(2);
  return r >= 0 ? `rgba(59,130,246,${alpha})` : `rgba(245,158,11,${alpha})`;
}

const corrText = (r: number, lang: Lang) => {
  const s = t(lang).intermarket;
  const st = strength(r);
  return st === 'nula' ? s.strength.nula : `${s.strength[st]} ${r > 0 ? s.positive : s.negative}`;
};

/** Mudança da correlação: seta e valor, sem cor de alta/baixa. */
const changeTag = (d: number | null, lang: Lang) =>
  d == null || Math.abs(d) < 0.05 ? '' : `<span class="text-[10px] text-muted font-mono tabular-nums">${d > 0 ? '▲' : '▼'}${formatNumber(Math.abs(d), lang, 2)}</span>`;

// ---------- Painel dos mercados ----------

const SPARK_DAYS = 63;

/** Último valor disponível da série e o valor `lag` pregões antes dele. */
function lastValues(v: (number | null)[], lag: number): { last: number | null; prev: number | null } {
  let i = v.length - 1;
  while (i >= 0 && v[i] == null) i--;
  if (i < 0) return { last: null, prev: null };
  let j = i - lag;
  while (j >= 0 && v[j] == null) j--;
  return { last: v[i], prev: j >= 0 ? v[j] : null };
}

function changeSpan(s: IntermarketSeries, last: number | null, prev: number | null, lang: Lang): string {
  if (last == null || prev == null) return '<span class="text-muted">—</span>';
  if (s.mode === 'diff') {
    const bp = Math.round((last - prev) * 100);
    const m = t(lang).intermarket;
    return `<span class="font-mono tabular-nums ${trendClass(bp)}" title="${m.bpTitle}">${bp > 0 ? '+' : ''}${bp} ${m.bp}</span>`;
  }
  const pct = (last / prev - 1) * 100;
  return `<span class="font-mono tabular-nums ${trendClass(pct)}">${formatPct(pct, { lang })}</span>`;
}

function seriesCard(s: IntermarketSeries, data: IntermarketData, lang: Lang): string {
  const v = data.series[s.id];
  if (!v) return '';
  const m = t(lang).intermarket;
  const day = lastValues(v, 1);
  const month = lastValues(v, CHANGE_LAG);
  const unit = lang === 'en' ? (s.unitEn ?? s.unit) : s.unit;
  const value = day.last == null ? '—' : `${formatNumber(day.last, lang, s.decimals)}${s.unit === '%' ? '%' : ` <span class="font-sans text-xs text-muted">${unit}</span>`}`;
  const spark = sparkline(v.slice(-SPARK_DAYS).filter((x): x is number => x != null), { width: 96, height: 28 });
  const name = s.asset ? `<a href="${assetPath(s.asset, lang)}" class="hover:text-accent" title="${m.asset}">${seriesName(s, lang)}</a>` : seriesName(s, lang);
  return `<li class="rounded-lg border border-border px-3 py-2">
  <p class="text-xs text-muted truncate">${name}</p>
  <div class="flex items-end justify-between gap-2">
    <p class="font-mono tabular-nums text-lg leading-tight">${value}</p>${spark}
  </div>
  <p class="mt-1 flex flex-wrap gap-x-3 text-xs"><span>${changeSpan(s, day.last, day.prev, lang)} <span class="text-muted">${m.change1d}</span></span><span>${changeSpan(s, month.last, month.prev, lang)} <span class="text-muted">${m.change1m}</span></span></p>
</li>`;
}

export function renderPanel(data: IntermarketData, lang: Lang): string {
  return INTERMARKET_GROUPS.map((g) => {
    const cards = INTERMARKET_SERIES.filter((s) => s.group === g.id)
      .map((s) => seriesCard(s, data, lang))
      .join('');
    return cards ? `<div><h3 class="text-xs uppercase tracking-wider text-muted mb-2">${g[lang]}</h3><ul class="grid gap-2">${cards}</ul></div>` : '';
  }).join('');
}

// ---------- Matriz de correlação ----------

export function renderMatrix(r: Returns, window: CorrWindow, lang: Lang, selected?: string): string {
  const m = t(lang).intermarket;
  const series = INTERMARKET_SERIES.filter((s) => r[s.id]);
  const head = series.map((s) => `<th scope="col" class="px-1 py-2 font-medium text-muted text-xs whitespace-nowrap" title="${seriesName(s, lang)}">${seriesShort(s, lang)}</th>`).join('');
  const rows = series
    .map((row) => {
      const cells = series
        .map((col) => {
          if (row.id === col.id) return '<td class="p-0.5"><span class="block h-11 rounded bg-surface-2"></span></td>';
          const p = pairCorr(r, row.id, col.id, window);
          const key = [row.id, col.id].sort().join(',');
          const title = p.now == null ? m.noData : m.cellTitle(seriesName(row, lang), seriesName(col, lang), formatCorr(p.now, lang), corrText(p.now, lang), formatCorr(p.before, lang));
          return `<td class="p-0.5"><button type="button" data-pair="${row.id},${col.id}" data-key="${key}" aria-pressed="${key === selected}" title="${title}" aria-label="${title}"
  class="w-full h-11 min-w-11 rounded flex flex-col items-center justify-center leading-tight hover:ring-1 hover:ring-text/60 aria-pressed:ring-2 aria-pressed:ring-text" style="background:${corrBg(p.now)}">
  <span class="font-mono tabular-nums text-xs">${formatCorr(p.now, lang)}</span>${changeTag(p.change, lang)}</button></td>`;
        })
        .join('');
      return `<tr><th scope="row" class="pr-2 text-left font-medium text-xs whitespace-nowrap" title="${seriesName(row, lang)}">${seriesShort(row, lang)}</th>${cells}</tr>`;
    })
    .join('');
  return `<thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody>`;
}

// ---------- Mudanças da correlação ----------

export function renderChanges(pairs: PairCorr[], lang: Lang): string {
  const m = t(lang).intermarket;
  if (!pairs.length) return `<li class="py-2 text-muted">${m.noData}</li>`;
  return pairs
    .map((p) => {
      const a = seriesById(p.a)!;
      const b = seriesById(p.b)!;
      return `<li><button type="button" data-pair="${p.a},${p.b}" class="w-full flex items-center justify-between gap-3 py-2 text-left hover:text-accent" title="${m.pairButton(seriesName(a, lang), seriesName(b, lang))}">
  <span class="font-medium">${seriesShort(a, lang)} × ${seriesShort(b, lang)}</span>
  <span class="font-mono tabular-nums text-sm whitespace-nowrap"><span class="text-muted">${formatCorr(p.before, lang)}</span> → ${formatCorr(p.now, lang)} <span class="text-xs text-muted">(${p.change! > 0 ? '+' : '−'}${formatNumber(Math.abs(p.change!), lang, 2)})</span></span>
</button></li>`;
    })
    .join('');
}

// ---------- Relações clássicas ----------

const STATUS_TONE = {
  'em-linha': 'text-accent border-accent/40 bg-accent/10',
  invertida: 'text-warn border-warn/40 bg-warn/10',
  fraca: 'text-muted border-border bg-surface-2',
  'regime-pos': 'text-accent border-accent/40 bg-accent/10',
  'regime-neg': 'text-warn border-warn/40 bg-warn/10',
} as const;

/** Valor atual e situação de uma relação clássica (o texto explicativo fica na view). */
export function renderClassicNow(p: ClassicPair, r: Returns, window: CorrWindow, lang: Lang): string {
  const m = t(lang).intermarket;
  const c = pairCorr(r, p.a, p.b, window);
  if (c.now == null) return `<span class="text-muted">${m.noData}</span>`;
  const st = classicStatus(p, c.now);
  return `<span class="text-muted">${m.now(window)}:</span>
  <span class="font-mono tabular-nums font-semibold">${formatCorr(c.now, lang)}</span>
  <span class="text-muted">· ${m.monthAgo} ${formatCorr(c.before, lang)}</span>
  <span class="inline-block whitespace-nowrap text-xs rounded-full border px-2 py-0.5 ${STATUS_TONE[st]}">${m.status[st]}</span>`;
}

export const expectedLabel = (p: ClassicPair, lang: Lang) => {
  const m = t(lang).intermarket;
  return p.expected === 'regime' ? m.regime : p.expected > 0 ? m.positive : m.negative;
};
