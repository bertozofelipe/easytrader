import type { AssetKind } from './market';

const nf = (min: number, max = min) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: min, maximumFractionDigits: max });

export function formatPrice(value: number, kind: AssetKind): string {
  if (kind === 'fx') return nf(value >= 20 ? 2 : 4).format(value);
  if (value >= 10_000) return nf(0).format(value);
  if (value >= 1) return nf(2).format(value);
  return nf(4, 6).format(value);
}

export function formatPct(value: number | null): string {
  if (value == null || Number.isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${nf(2).format(value)}%`;
}

export function trendClass(value: number | null): string {
  if (value == null || value === 0) return 'text-muted';
  return value > 0 ? 'text-up' : 'text-down';
}

export function formatDateTimeBR(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatRelative(iso: string, now = Date.now()): string {
  const min = Math.round((now - new Date(iso).getTime()) / 60_000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  return `há ${Math.round(h / 24)} d`;
}
