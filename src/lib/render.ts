// Renderizadores em string usados no build (set:html) e no navegador ao
// atualizar os dados, para manter um único markup por bloco.
import { ASSETS, assetByCoingecko, datasetFor, type Asset } from '../data/assets';
import { formatDateTimeBR, formatPct, formatPrice, formatRelative, formatUsdCompact, trendClass } from './format';
import { ratingPill } from './gauge-view';
import type { Coin, CryptoData, Datasets, NewsCategory, NewsItem, SentimentData, SignalsData, TickerItem } from './market';

export const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const pctSpan = (v: number | null | undefined, extra = '') =>
  `<span class="font-mono tabular-nums ${trendClass(v)} ${extra}">${formatPct(v)}</span>`;

// ---------- Faixa de cotações ----------

export function renderTickerItems(items: TickerItem[]): string {
  return items
    .map((i) => {
      const inner = `<span class="font-semibold">${escape(i.label)}</span>
  <span class="font-mono tabular-nums">${formatPrice(i.price, i.kind)}</span>
  ${pctSpan(i.changePct, 'text-xs')}`;
      return `<li class="whitespace-nowrap" title="${escape(i.sub)}">${
        i.slug
          ? `<a href="/ativos/${i.slug}" class="flex items-baseline gap-2 hover:text-accent">${inner}</a>`
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

const coinHref = (c: Coin) => {
  const a = assetByCoingecko(c.id);
  return a ? `/ativos/${a.slug}` : null;
};

const coinName = (c: Coin) => {
  const body = `<img src="${escape(c.image)}" alt="" width="20" height="20" loading="lazy" class="rounded-full shrink-0">
    <span class="font-medium">${escape(c.name)}</span>
    <span class="text-muted text-xs">${escape(c.symbol)}</span>`;
  const href = coinHref(c);
  return href
    ? `<a href="${href}" class="flex items-center gap-2 hover:text-accent">${body}</a>`
    : `<span class="flex items-center gap-2">${body}</span>`;
};

export function renderCryptoRows(coins: Coin[]): string {
  return coins
    .map(
      (c) => `<tr class="border-t border-border hover:bg-surface-2/50">
  <td class="py-2 pr-2 text-muted tabular-nums">${c.rank ?? ''}</td>
  <td class="py-2 pr-4">${coinName(c)}</td>
  <td class="py-2 px-2 text-right font-mono tabular-nums">${formatPrice(c.price, 'crypto')}</td>
  <td class="py-2 px-2 text-right hidden md:table-cell">${pctSpan(c.change1h)}</td>
  <td class="py-2 px-2 text-right">${pctSpan(c.change24h)}</td>
  <td class="py-2 px-2 text-right hidden sm:table-cell">${pctSpan(c.change7d)}</td>
  <td class="py-2 px-2 text-right hidden lg:table-cell tabular-nums">${formatUsdCompact(c.marketCap)}</td>
  <td class="py-2 px-2 text-right hidden lg:table-cell tabular-nums">${formatUsdCompact(c.volume24h)}</td>
  <td class="py-2 pl-2 hidden md:table-cell">${sparkline(c.sparkline7d, { up: (c.change7d ?? 0) >= 0 })}</td>
</tr>`,
    )
    .join('');
}

export function renderMovers(coins: Coin[], direction: 'up' | 'down', n = 5): string {
  const sorted = coins
    .filter((c) => c.change24h != null)
    .sort((a, b) => (direction === 'up' ? b.change24h! - a.change24h! : a.change24h! - b.change24h!))
    .slice(0, n);
  return sorted
    .map(
      (c) => `<li class="flex items-center justify-between gap-2 py-1.5">
  ${coinName(c)}
  <span class="text-right">
    <span class="block font-mono tabular-nums text-sm">${formatPrice(c.price, 'crypto')}</span>
    ${pctSpan(c.change24h, 'text-xs')}
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

export function renderCryptoKpis(data: CryptoData): string {
  const g = data.global;
  return [
    kpi('Valor de mercado total', formatUsdCompact(g.totalMarketCap), `${pctSpan(g.marketCapChange24h)} <span class="text-muted">em 24h</span>`),
    kpi('Volume 24h', formatUsdCompact(g.totalVolume)),
    kpi('Dominância do Bitcoin', formatPct(g.btcDominance, { signed: false })),
    kpi('Dominância do Ethereum', formatPct(g.ethDominance, { signed: false })),
  ].join('');
}

// ---------- Fear & Greed ----------

const fngColor = (v: number) =>
  v < 25 ? 'var(--color-down)' : v < 45 ? '#f97316' : v < 56 ? 'var(--color-muted)' : v < 75 ? '#84cc16' : 'var(--color-up)';

export function renderFearGreed(data: SentimentData): string {
  const { value, label } = data.current;
  const hist = [...data.history].reverse();
  const bars = hist
    .map(
      (h) =>
        `<span title="${h.date}: ${h.value} (${escape(h.label)})" class="flex-1 rounded-sm" style="height:${Math.max(4, h.value)}%;background:${fngColor(h.value)}"></span>`,
    )
    .join('');
  return `<div class="flex items-end justify-between gap-4">
  <div>
    <p class="text-4xl font-bold tabular-nums" style="color:${fngColor(value)}">${value}</p>
    <p class="font-medium">${escape(label)}</p>
  </div>
  <div class="relative w-full max-w-[180px] h-2 rounded-full" style="background:linear-gradient(90deg,var(--color-down),#f97316,var(--color-muted),#84cc16,var(--color-up))">
    <span class="absolute -top-1 w-1 h-4 bg-text rounded" style="left:calc(${value}% - 2px)"></span>
  </div>
</div>
<div class="flex items-end gap-0.5 h-16 mt-4" aria-label="Histórico de 30 dias">${bars}</div>
<p class="text-xs text-muted mt-1 flex justify-between"><span>30 dias atrás</span><span>hoje</span></p>`;
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
export const watchButton = (a: Asset, { label = false } = {}) =>
  `<button type="button" data-watch="${a.slug}" data-watch-name="${escape(a.name)}" aria-pressed="false" aria-label="Adicionar ${escape(a.name)} à sua lista" title="Adicionar ${escape(a.name)} à sua lista" class="group inline-flex items-center gap-1.5 text-muted hover:text-warn aria-pressed:text-warn ${label ? 'rounded-full border border-border px-3 py-1 text-sm aria-pressed:border-warn/60' : 'p-1 -m-1'}">
  <svg viewBox="0 0 24 24" class="w-4 h-4 fill-transparent group-aria-pressed:fill-current" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="${STAR_PATH}"/></svg>${
    label ? '<span data-watch-label>Acompanhar</span>' : ''
  }
</button>`;

/** Linhas da lista de ativos; com `signals`, inclui a coluna do termômetro técnico. */
export function renderAssetRows(rows: AssetRow[], { watch = false, signals }: { watch?: boolean; signals?: SignalsData | null } = {}): string {
  return rows
    .map(
      ({ asset: a, price, changePct }) => `<tr class="border-t border-border hover:bg-surface-2/50">
  ${watch ? `<td class="py-2 pr-2 w-6">${watchButton(a)}</td>` : ''}
  <td class="py-2 pr-4"><a href="/ativos/${a.slug}" class="hover:text-accent"><span class="font-medium">${escape(a.name)}</span> <span class="text-muted text-xs">${escape(a.symbol)}</span></a></td>
  <td class="py-2 px-2 text-right font-mono tabular-nums">${formatPrice(price, a.kind)}</td>
  <td class="py-2 pl-2 text-right">${pctSpan(changePct)}</td>
  ${signals !== undefined ? `<td class="py-2 pl-3 text-right hidden sm:table-cell">${signals?.assets[a.slug] ? ratingPill(signals.assets[a.slug].rating) : ''}</td>` : ''}
</tr>`,
    )
    .join('');
}

// ---------- Página do ativo ----------

const stat = (label: string, value: string) =>
  `<div><dt class="text-xs text-muted">${label}</dt><dd class="font-mono tabular-nums">${value}</dd></div>`;

export function renderAssetQuote(asset: Asset, ds: Datasets): string {
  if (asset.kind === 'crypto') {
    const c = findCoin(asset, ds);
    if (!c) return '';
    return `<div class="flex flex-wrap items-baseline gap-3">
  <span class="text-3xl font-bold font-mono tabular-nums">US$ ${formatPrice(c.price, 'crypto')}</span>
  ${pctSpan(c.change24h, 'text-lg')} <span class="text-xs text-muted">24h</span>
</div>
<dl class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
  ${stat('Ranking', `#${c.rank}`)}
  ${stat('Valor de mercado', formatUsdCompact(c.marketCap))}
  ${stat('Volume 24h', formatUsdCompact(c.volume24h))}
  ${stat('Variação 7d', formatPct(c.change7d))}
  ${stat('Máxima 24h', formatPrice(c.high24h, 'crypto'))}
  ${stat('Mínima 24h', formatPrice(c.low24h, 'crypto'))}
  ${stat('Máxima histórica', formatPrice(c.ath, 'crypto'))}
  ${stat('Distância da máxima', formatPct(c.athChangePct))}
</dl>`;
  }
  const q = findQuote(asset, ds);
  if (!q) return '';
  // Câmbio e índices calculados (VIX) não são preços em dólar.
  const prefix = asset.kind === 'fx' || asset.cboe ? '' : 'US$ ';
  const stats =
    asset.kind === 'fx'
      ? [stat('Fechamento anterior', formatPrice(q.prevClose, 'fx')), stat('Data de referência', q.asOf.split('-').reverse().join('/'))]
      : [
          stat('Abertura', formatPrice(q.open, asset.kind)),
          stat('Máxima do dia', formatPrice(q.high, asset.kind)),
          stat('Mínima do dia', formatPrice(q.low, asset.kind)),
          stat('Fechamento anterior', formatPrice(q.prevClose, asset.kind)),
        ];
  return `<div class="flex flex-wrap items-baseline gap-3">
  <span class="text-3xl font-bold font-mono tabular-nums">${prefix}${formatPrice(q.price, asset.kind)}</span>
  ${pctSpan(q.changePct, 'text-lg')} <span class="text-xs text-muted">no dia</span>
</div>
<dl class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">${stats.join('')}</dl>`;
}

// ---------- Notícias ----------

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = {
  mercados: 'Mercados globais',
  brasil: 'Brasil',
  forex: 'Forex',
  cripto: 'Cripto',
};

/** `now` presente = tempo relativo (navegador); ausente = data/hora fixa (build). */
export function renderNewsItems(items: NewsItem[], { now, compact = false }: { now?: number; compact?: boolean } = {}): string {
  return items
    .map((n) => {
      const when = now ? formatRelative(n.date, now) : formatDateTimeBR(n.date);
      return `<li class="py-3 border-t border-border first:border-t-0" data-category="${n.category}" data-lang="${n.lang}">
  <p class="text-xs text-muted flex flex-wrap items-center gap-x-2">
    <span class="text-accent">${escape(NEWS_CATEGORY_LABEL[n.category])}</span>
    <span>${escape(n.source)}</span>
    ${n.lang === 'en' ? '<span class="rounded border border-border px-1 text-[10px]">EN</span>' : ''}
    <time datetime="${n.date}">${when}</time>
  </p>
  <a href="${escape(n.link)}" target="_blank" rel="noopener nofollow" class="block mt-1 font-medium leading-snug hover:text-accent">${escape(n.title)}</a>
  ${!compact && n.summary ? `<p class="text-sm text-muted mt-1 line-clamp-2">${escape(n.summary)}</p>` : ''}
</li>`;
    })
    .join('');
}

// ---------- Home ----------

export function renderMarketOverview(items: TickerItem[]): string {
  return items
    .map((i) => {
      const body = `<span><span class="font-medium">${escape(i.label)}</span></span>
  <span class="text-right"><span class="font-mono tabular-nums">${formatPrice(i.price, i.kind)}</span> ${pctSpan(i.changePct, 'text-xs ml-1 inline-block w-16')}</span>`;
      return `<li>${
        i.slug
          ? `<a href="/ativos/${i.slug}" class="flex items-center justify-between gap-2 py-1.5 hover:text-accent">${body}</a>`
          : `<span class="flex items-center justify-between gap-2 py-1.5">${body}</span>`
      }</li>`;
    })
    .join('');
}

export function renderFearGreedMini(data: SentimentData): string {
  const { value, label } = data.current;
  return `<span class="text-3xl font-bold tabular-nums" style="color:${fngColor(value)}">${value}</span>
<span class="font-medium">${escape(label)}</span>`;
}

/** Notícias da home: metade em português e metade em inglês, mais recentes primeiro. */
export function pickHomeNews(items: NewsItem[], n = 8): NewsItem[] {
  const half = Math.ceil(n / 2);
  const pt = items.filter((i) => i.lang === 'pt').slice(0, half);
  const en = items.filter((i) => i.lang !== 'pt').slice(0, n - pt.length);
  return [...pt, ...en].sort((a, b) => b.date.localeCompare(a.date));
}
