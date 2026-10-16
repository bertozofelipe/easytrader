// Renderizadores em string usados no build (set:html) e no navegador ao
// atualizar os dados, para manter um único markup por bloco. Todos recebem o
// idioma da página (no navegador: pageLang()).
import { ASSETS, assetByCoingecko, assetBySlug, assetName, datasetFor, type Asset } from '../data/assets';
import { commodityById, commodityGroup } from '../data/commodities';
import { assetPath, type Lang } from '../i18n';
import { t } from '../i18n/ui';
import { formatDate, formatDateTime, formatPct, formatPrice, formatRelative, formatUsdCompact, trendClass, usd } from './format';
import { ratingPill } from './gauge-view';
import type { Coin, CryptoData, Datasets, NewsItem, SentimentData, SignalsData, TickerItem } from './market';

export const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const pctSpan = (v: number | null | undefined, lang: Lang, extra = '') =>
  `<span class="font-mono tabular-nums ${trendClass(v)} ${extra}">${formatPct(v, { lang })}</span>`;

/** Rótulo do tipo; índices da Cboe são o próprio índice, não um ETF. */
export const kindLabel = (a: Asset, lang: Lang) => (a.cboe ? t(lang).kind.indexPlain : t(lang).kind[a.kind]);

// ---------- Faixa de cotações ----------

/** Rótulo do item no idioma: ETFs e ações usam o nome do cadastro. */
function tickerLabel(i: TickerItem, lang: Lang): { label: string; sub: string } {
  const a = i.slug ? assetBySlug(i.slug) : undefined;
  if (a && (a.kind === 'index' || a.kind === 'commodity' || a.kind === 'stock')) return { label: `${assetName(a, lang)} (${a.symbol})`, sub: `ETF ${a.symbol}` };
  if (i.kind === 'fx') return { label: i.label, sub: t(lang).kind.fx };
  return { label: i.label, sub: i.sub };
}

export function renderTickerItems(items: TickerItem[], lang: Lang): string {
  return items
    .map((i) => {
      const { label, sub } = tickerLabel(i, lang);
      const inner = `<span class="font-semibold">${escape(label)}</span>
  <span class="font-mono tabular-nums">${formatPrice(i.price, i.kind, lang)}</span>
  ${pctSpan(i.changePct, lang, 'text-xs')}`;
      return `<li class="whitespace-nowrap" title="${escape(sub)}">${
        i.slug
          ? `<a href="${assetPath(i.slug, lang)}" class="flex items-baseline gap-2 hover:text-accent">${inner}</a>`
          : `<span class="flex items-baseline gap-2">${inner}</span>`
      }</li>`;
    })
    .join('');
}

// ---------- Sparkline ----------

export function sparkline(values: number[], { width = 120, height = 32, up }: { width?: number; height?: number; up?: boolean } = {}): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => `${((i / (values.length - 1)) * width).toFixed(1)},${(height - ((v - min) / range) * (height - 2) - 1).toFixed(1)}`)
    .join(' ');
  const rising = up ?? values[values.length - 1] >= values[0];
  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="${rising ? 'text-up' : 'text-down'}" aria-hidden="true"><polyline fill="none" stroke="currentColor" stroke-width="1.5" points="${pts}"/></svg>`;
}

// ---------- Cripto ----------

const coinName = (c: Coin, lang: Lang) => {
  const body = `<img src="${escape(c.image)}" alt="" width="20" height="20" loading="lazy" class="rounded-full shrink-0">
    <span class="font-medium">${escape(c.name)}</span>
    <span class="text-muted text-xs">${escape(c.symbol)}</span>`;
  const a = assetByCoingecko(c.id);
  return a
    ? `<a href="${assetPath(a.slug, lang)}" class="flex items-center gap-2 hover:text-accent">${body}</a>`
    : `<span class="flex items-center gap-2">${body}</span>`;
};

export function renderCryptoRows(coins: Coin[], lang: Lang): string {
  return coins
    .map(
      (c) => `<tr class="border-t border-border hover:bg-surface-2/50">
  <td class="py-2 pr-2 text-muted tabular-nums">${c.rank ?? ''}</td>
  <td class="py-2 pr-4">${coinName(c, lang)}</td>
  <td class="py-2 px-2 text-right font-mono tabular-nums">${formatPrice(c.price, 'crypto', lang)}</td>
  <td class="py-2 px-2 text-right hidden md:table-cell">${pctSpan(c.change1h, lang)}</td>
  <td class="py-2 px-2 text-right">${pctSpan(c.change24h, lang)}</td>
  <td class="py-2 px-2 text-right hidden sm:table-cell">${pctSpan(c.change7d, lang)}</td>
  <td class="py-2 px-2 text-right hidden lg:table-cell tabular-nums">${formatUsdCompact(c.marketCap, lang)}</td>
  <td class="py-2 px-2 text-right hidden lg:table-cell tabular-nums">${formatUsdCompact(c.volume24h, lang)}</td>
  <td class="py-2 pl-2 hidden md:table-cell">${sparkline(c.sparkline7d, { up: (c.change7d ?? 0) >= 0 })}</td>
</tr>`,
    )
    .join('');
}

export function renderMovers(coins: Coin[], direction: 'up' | 'down', lang: Lang, n = 5): string {
  const sorted = coins
    .filter((c) => c.change24h != null)
    .sort((a, b) => (direction === 'up' ? b.change24h! - a.change24h! : a.change24h! - b.change24h!))
    .slice(0, n);
  return sorted
    .map(
      (c) => `<li class="flex items-center justify-between gap-2 py-1.5">
  ${coinName(c, lang)}
  <span class="text-right">
    <span class="block font-mono tabular-nums text-sm">${formatPrice(c.price, 'crypto', lang)}</span>
    ${pctSpan(c.change24h, lang, 'text-xs')}
  </span>
</li>`,
    )
    .join('');
}

const kpi = (label: string, value: string, extra = '') =>
  `<div class="rounded-xl border border-border bg-surface p-4">
  <p class="text-xs text-muted">${label}</p>
  <p class="text-xl font-semibold tabular-nums mt-1">${value}</p>
  ${extra ? `<p class="text-xs mt-1">${extra}</p>` : ''}
</div>`;

export function renderCryptoKpis(data: CryptoData, lang: Lang): string {
  const g = data.global;
  const s = t(lang).cryptoKpi;
  return [
    kpi(s.marketCap, formatUsdCompact(g.totalMarketCap, lang), `${pctSpan(g.marketCapChange24h, lang)} <span class="text-muted">${s.in24h}</span>`),
    kpi(s.volume, formatUsdCompact(g.totalVolume, lang)),
    kpi(s.btcDom, formatPct(g.btcDominance, { signed: false, lang })),
    kpi(s.ethDom, formatPct(g.ethDominance, { signed: false, lang })),
  ].join('');
}

// ---------- Fear & Greed ----------

const fngColor = (v: number) =>
  v < 25 ? 'var(--color-down)' : v < 45 ? '#f97316' : v < 56 ? 'var(--color-muted)' : v < 75 ? '#84cc16' : 'var(--color-up)';

/** O coletor grava o rótulo em português; traduz para o idioma da página. */
const fngLabel = (label: string, lang: Lang) => t(lang).fng.labels[label] ?? label;

export function renderFearGreed(data: SentimentData, lang: Lang): string {
  const { value, label } = data.current;
  const s = t(lang).fng;
  const hist = [...data.history].reverse();
  const bars = hist
    .map(
      (h) =>
        `<span title="${formatDate(h.date, lang)}: ${h.value} (${escape(fngLabel(h.label, lang))})" class="flex-1 rounded-sm" style="height:${Math.max(4, h.value)}%;background:${fngColor(h.value)}"></span>`,
    )
    .join('');
  return `<div class="flex items-end justify-between gap-4">
  <div>
    <p class="text-4xl font-bold tabular-nums" style="color:${fngColor(value)}">${value}</p>
    <p class="font-medium">${escape(fngLabel(label, lang))}</p>
  </div>
  <div class="relative w-full max-w-[180px] h-2 rounded-full" style="background:linear-gradient(90deg,var(--color-down),#f97316,var(--color-muted),#84cc16,var(--color-up))">
    <span class="absolute -top-1 w-1 h-4 bg-text rounded" style="left:calc(${value}% - 2px)"></span>
  </div>
</div>
<div class="flex items-end gap-0.5 h-16 mt-4" aria-label="${s.history}">${bars}</div>
<p class="text-xs text-muted mt-1 flex justify-between"><span>${s.ago30}</span><span>${s.today}</span></p>`;
}

// ---------- Lista de ativos ----------

export interface AssetRow {
  asset: Asset;
  price: number | null;
  changePct: number | null;
}

const findCoin = (asset: Asset, ds: Datasets) => ds.crypto?.coins.find((x) => x.id === asset.coingecko);

function findQuote(asset: Asset, ds: Datasets) {
  const name = datasetFor(asset);
  return name === 'crypto' ? undefined : ds[name]?.quotes.find((x) => x.symbol === asset.symbol);
}

export function collectRows(ds: Datasets): AssetRow[] {
  return ASSETS.map((asset) => {
    if (asset.kind === 'crypto') {
      const c = findCoin(asset, ds);
      return { asset, price: c?.price ?? null, changePct: c?.change24h ?? null };
    }
    const q = findQuote(asset, ds);
    return { asset, price: q?.price ?? null, changePct: q?.changePct ?? null };
  });
}

const STAR_PATH = 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z';

/** Botão de estrela da watchlist; o estado é ligado no navegador (lib/watchlist). */
export const watchButton = (a: Asset, lang: Lang, { label = false } = {}) => {
  const name = escape(assetName(a, lang));
  const w = t(lang).watch;
  return `<button type="button" data-watch="${a.slug}" data-watch-name="${name}" aria-pressed="false" aria-label="${w.add(name)}" title="${w.add(name)}" class="group inline-flex items-center gap-1.5 text-muted hover:text-warn aria-pressed:text-warn ${label ? 'rounded-full border border-border px-3 py-1 text-sm aria-pressed:border-warn/60' : 'p-1 -m-1'}">
  <svg viewBox="0 0 24 24" class="w-4 h-4 fill-transparent group-aria-pressed:fill-current" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="${STAR_PATH}"/></svg>${
    label ? `<span data-watch-label>${w.follow}</span>` : ''
  }
</button>`;
};

/** Linhas da lista de ativos; com `signals`, inclui a coluna do termômetro técnico. */
export function renderAssetRows(rows: AssetRow[], lang: Lang, { watch = false, signals }: { watch?: boolean; signals?: SignalsData | null } = {}): string {
  return rows
    .map(
      ({ asset: a, price, changePct }) => `<tr class="border-t border-border hover:bg-surface-2/50">
  ${watch ? `<td class="py-2 pr-2 w-6">${watchButton(a, lang)}</td>` : ''}
  <td class="py-2 pr-4"><a href="${assetPath(a.slug, lang)}" class="hover:text-accent"><span class="font-medium">${escape(assetName(a, lang))}</span> <span class="text-muted text-xs">${escape(a.symbol)}</span></a></td>
  <td class="py-2 px-2 text-right font-mono tabular-nums">${formatPrice(price, a.kind, lang)}</td>
  <td class="py-2 pl-2 text-right">${pctSpan(changePct, lang)}</td>
  ${signals !== undefined ? `<td class="py-2 pl-3 text-right hidden sm:table-cell">${signals?.assets[a.slug] ? ratingPill(signals.assets[a.slug].rating, lang) : ''}</td>` : ''}
</tr>`,
    )
    .join('');
}

// ---------- Página do ativo ----------

const stat = (label: string, value: string) =>
  `<div><dt class="text-xs text-muted">${label}</dt><dd class="font-mono tabular-nums">${value}</dd></div>`;

export function renderAssetQuote(asset: Asset, ds: Datasets, lang: Lang): string {
  const s = t(lang).quote;
  if (asset.kind === 'crypto') {
    const c = findCoin(asset, ds);
    if (!c) return '';
    return `<div class="flex flex-wrap items-baseline gap-3">
  <span class="text-3xl font-bold font-mono tabular-nums">${usd(lang)}${formatPrice(c.price, 'crypto', lang)}</span>
  ${pctSpan(c.change24h, lang, 'text-lg')} <span class="text-xs text-muted">24h</span>
</div>
<dl class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
  ${stat(s.rank, `#${c.rank}`)}
  ${stat(s.marketCap, formatUsdCompact(c.marketCap, lang))}
  ${stat(s.volume, formatUsdCompact(c.volume24h, lang))}
  ${stat(s.change7d, formatPct(c.change7d, { lang }))}
  ${stat(s.high24h, formatPrice(c.high24h, 'crypto', lang))}
  ${stat(s.low24h, formatPrice(c.low24h, 'crypto', lang))}
  ${stat(s.ath, formatPrice(c.ath, 'crypto', lang))}
  ${stat(s.fromAth, formatPct(c.athChangePct, { lang }))}
</dl>`;
  }
  const q = findQuote(asset, ds);
  if (!q) return '';
  // Câmbio e índices calculados (VIX) não são preços em dólar.
  const prefix = asset.kind === 'fx' || asset.cboe ? '' : usd(lang);
  const stats =
    asset.kind === 'fx'
      ? [stat(s.prevClose, formatPrice(q.prevClose, 'fx', lang)), stat(s.refDate, formatDate(q.asOf, lang))]
      : [
          stat(s.open, formatPrice(q.open, asset.kind, lang)),
          stat(s.high, formatPrice(q.high, asset.kind, lang)),
          stat(s.low, formatPrice(q.low, asset.kind, lang)),
          stat(s.prevClose, formatPrice(q.prevClose, asset.kind, lang)),
        ];
  return `<div class="flex flex-wrap items-baseline gap-3">
  <span class="text-3xl font-bold font-mono tabular-nums">${prefix}${formatPrice(q.price, asset.kind, lang)}</span>
  ${pctSpan(q.changePct, lang, 'text-lg')} <span class="text-xs text-muted">${s.inDay}</span>
</div>
<dl class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">${stats.join('')}</dl>`;
}

// ---------- Notícias ----------

/** `now` presente = tempo relativo (navegador); ausente = data/hora fixa (build). */
export function renderNewsItems(items: NewsItem[], lang: Lang, { now, compact = false }: { now?: number; compact?: boolean } = {}): string {
  const cat = t(lang).newsCategory;
  // Selo de idioma só nas notícias que não estão no idioma da página.
  return items
    .map((n) => {
      const when = now ? formatRelative(n.date, now, lang) : formatDateTime(n.date, lang);
      const c = commodityById(n.commodity);
      const commodity = c ? ` data-commodity="${c.id}" data-group="${c.group}"` : '';
      return `<li class="py-3 border-t border-border first:border-t-0" data-category="${n.category}" data-lang="${n.lang}"${commodity}>
  <p class="text-xs text-muted flex flex-wrap items-center gap-x-2">
    ${c ? `<span class="rounded-full border px-1.5 font-medium ${commodityGroup(c.group).tone}">${escape(c[lang])}</span>` : ''}
    <span class="text-accent">${escape(cat[n.category] ?? n.category)}</span>
    <span>${escape(n.source)}</span>
    ${n.lang !== lang ? `<span class="rounded border border-border px-1 text-[10px]">${n.lang.toUpperCase()}</span>` : ''}
    <time datetime="${n.date}">${when}</time>
  </p>
  <a href="${escape(n.link)}" target="_blank" rel="noopener nofollow" class="block mt-1 font-medium leading-snug hover:text-accent">${escape(n.title)}</a>
  ${!compact && n.summary ? `<p class="text-sm text-muted mt-1 line-clamp-2">${escape(n.summary)}</p>` : ''}
</li>`;
    })
    .join('');
}

// ---------- Home ----------

export function renderMarketOverview(items: TickerItem[], lang: Lang): string {
  return items
    .map((i) => {
      const body = `<span><span class="font-medium">${escape(tickerLabel(i, lang).label)}</span></span>
  <span class="text-right"><span class="font-mono tabular-nums">${formatPrice(i.price, i.kind, lang)}</span> ${pctSpan(i.changePct, lang, 'text-xs ml-1 inline-block w-16')}</span>`;
      return `<li>${
        i.slug
          ? `<a href="${assetPath(i.slug, lang)}" class="flex items-center justify-between gap-2 py-1.5 hover:text-accent">${body}</a>`
          : `<span class="flex items-center justify-between gap-2 py-1.5">${body}</span>`
      }</li>`;
    })
    .join('');
}

export function renderFearGreedMini(data: SentimentData, lang: Lang): string {
  const { value, label } = data.current;
  return `<span class="text-3xl font-bold tabular-nums" style="color:${fngColor(value)}">${value}</span>
<span class="font-medium">${escape(fngLabel(label, lang))}</span>`;
}

/**
 * Notícias da home. Em português: metade em português e metade em inglês. Em
 * inglês: só notícias em inglês. Mais recentes primeiro.
 */
export function pickHomeNews(items: NewsItem[], lang: Lang, n = 8): NewsItem[] {
  if (lang === 'en') return items.filter((i) => i.lang === 'en').slice(0, n);
  const half = Math.ceil(n / 2);
  const pt = items.filter((i) => i.lang === 'pt').slice(0, half);
  const en = items.filter((i) => i.lang !== 'pt').slice(0, n - pt.length);
  return [...pt, ...en].sort((a, b) => b.date.localeCompare(a.date));
}
