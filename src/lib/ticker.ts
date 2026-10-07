import { formatPct, formatPrice, trendClass } from './format';
import type { TickerItem } from './market';

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

// Usado no build (set:html) e no navegador ao atualizar, para manter um único markup.
export function renderTickerItems(items: TickerItem[]): string {
  return items
    .map(
      (i) => `<li class="flex items-baseline gap-2 whitespace-nowrap" title="${escape(i.sub)}">
  <span class="font-semibold">${escape(i.label)}</span>
  <span class="font-mono tabular-nums">${formatPrice(i.price, i.kind)}</span>
  <span class="font-mono tabular-nums text-xs ${trendClass(i.changePct)}">${formatPct(i.changePct)}</span>
</li>`,
    )
    .join('');
}
