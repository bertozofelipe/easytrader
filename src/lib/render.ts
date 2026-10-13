// Renderizadores em string usados no build (set:html) e no navegador ao
// atualizar os dados, para manter um único markup por bloco.
import { ASSETS, assetByCoingecko, type Asset } from '../data/assets';
import { formatPct, formatPrice, formatUsdCompact, trendClass } from './format';
import type { Coin, CryptoData, QuotesData, SentimentData, TickerItem } from './market';

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

export function collectRows(us: QuotesData | null, fx: QuotesData | null, crypto: CryptoData | null): AssetRow[] {
  return ASSETS.map((asset) => {
    if (asset.kind === 'crypto') {
      const c = crypto?.coins.find((x) => x.id === asset.coingecko);
      return { asset, price: c?.price ?? null, changePct: c?.change24h ?? null };
    }
    const q = (asset.kind === 'fx' ? fx : us)?.quotes.find((x) => x.symbol === asset.symbol);
    return { asset, price: q?.price ?? null, changePct: q?.changePct ?? null };
  });
}

export function renderAssetRows(rows: AssetRow[]): string {
  return rows
    .map(
      ({ asset: a, price, changePct }) => `<tr class="border-t border-border hover:bg-surface-2/50">
  <td class="py-2 pr-4"><a href="/ativos/${a.slug}" class="hover:text-accent"><span class="font-medium">${escape(a.name)}</span> <span class="text-muted text-xs">${escape(a.symbol)}</span></a></td>
  <td class="py-2 px-2 text-right font-mono tabular-nums">${formatPrice(price, a.kind)}</td>
  <td class="py-2 pl-2 text-right">${pctSpan(changePct)}</td>
</tr>`,
    )
    .join('');
}

// ---------- Página do ativo ----------

const stat = (label: string, value: string) =>
  `<div><dt class="text-xs text-muted">${label}</dt><dd class="font-mono tabular-nums">${value}</dd></div>`;

export function renderAssetQuote(asset: Asset, us: QuotesData | null, fx: QuotesData | null, crypto: CryptoData | null): string {
  if (asset.kind === 'crypto') {
    const c = crypto?.coins.find((x) => x.id === asset.coingecko);
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
  const q = (asset.kind === 'fx' ? fx : us)?.quotes.find((x) => x.symbol === asset.symbol);
  if (!q) return '';
  const prefix = asset.kind === 'fx' ? '' : 'US$ ';
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
