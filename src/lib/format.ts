import type { AssetKind } from '../data/assets';
import { LOCALE, type Lang } from '../i18n';

const nf = (lang: Lang, min: number, max = min) =>
  new Intl.NumberFormat(LOCALE[lang], { minimumFractionDigits: min, maximumFractionDigits: max });

/** Número com casas fixas (ou de `min` a `max`) no formato do idioma. */
export const formatNumber = (value: number, lang: Lang, min = 2, max = min) => nf(lang, min, max).format(value);

export function formatPrice(value: number | null | undefined, kind: AssetKind, lang: Lang = 'pt'): string {
  if (value == null || Number.isNaN(value)) return '—';
  if (kind === 'fx') return nf(lang, value >= 20 ? 2 : 4).format(value);
  if (value >= 10_000) return nf(lang, 0).format(value);
  if (value >= 1) return nf(lang, 2).format(value);
  return nf(lang, 4, 6).format(value);
}

/** Prefixo de valores em dólar. */
export const usd = (lang: Lang) => (lang === 'en' ? '$' : 'US$ ');

/** Valores grandes em dólar: US$ 2,91 tri / 85,3 bi / 120 mi (en: $2.91T / $85.3B / $120M). */
export function formatUsdCompact(value: number | null | undefined, lang: Lang = 'pt'): string {
  if (value == null) return '—';
  const abs = Math.abs(value);
  const [t, b, m] = lang === 'en' ? ['T', 'B', 'M'] : [' tri', ' bi', ' mi'];
  if (abs >= 1e12) return `${usd(lang)}${nf(lang, 2).format(value / 1e12)}${t}`;
  if (abs >= 1e9) return `${usd(lang)}${nf(lang, 1).format(value / 1e9)}${b}`;
  if (abs >= 1e6) return `${usd(lang)}${nf(lang, 1).format(value / 1e6)}${m}`;
  return `${usd(lang)}${nf(lang, 0).format(value)}`;
}

export function formatPct(value: number | null | undefined, { signed = true, lang = 'pt' as Lang } = {}): string {
  if (value == null || Number.isNaN(value)) return '—';
  const sign = signed && value > 0 ? '+' : '';
  return `${sign}${nf(lang, 2).format(value)}%`;
}

export function trendClass(value: number | null | undefined): string {
  if (value == null || value === 0) return 'text-muted';
  return value > 0 ? 'text-up' : 'text-down';
}

/** Data e hora fixas (build): horário de Brasília em pt, UTC em en. */
export function formatDateTime(iso: string, lang: Lang = 'pt'): string {
  const text = new Intl.DateTimeFormat(LOCALE[lang], {
    timeZone: lang === 'en' ? 'UTC' : 'America/Sao_Paulo',
    day: '2-digit',
    month: lang === 'en' ? 'short' : '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso));
  return lang === 'en' ? `${text} UTC` : text;
}

/** Data AAAA-MM-DD no formato do idioma (dd/mm/aaaa ou mm/dd/yyyy). */
export function formatDate(isoDate: string, lang: Lang = 'pt'): string {
  const [y, m, d] = isoDate.slice(0, 10).split('-');
  return lang === 'en' ? `${m}/${d}/${y}` : `${d}/${m}/${y}`;
}

export function formatRelative(iso: string, now = Date.now(), lang: Lang = 'pt'): string {
  const min = Math.round((now - new Date(iso).getTime()) / 60_000);
  const en = lang === 'en';
  if (min < 1) return en ? 'just now' : 'agora';
  if (min < 60) return en ? `${min} min ago` : `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return en ? `${h} h ago` : `há ${h} h`;
  const d = Math.round(h / 24);
  return en ? `${d} d ago` : `há ${d} d`;
}
