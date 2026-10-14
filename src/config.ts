import type { RouteKey } from './i18n';

export const SITE = {
  name: 'Easytrader',
  repo: 'https://github.com/bertozofelipe/easytrader',
};

/** Menu principal (rótulos em src/i18n/ui.ts → nav). Páginas sem versão no idioma ficam de fora. */
export const NAV: { key: RouteKey; label: 'news' | 'calendar' | 'assets' | 'crypto' | 'indicators' | 'school' | 'tools' }[] = [
  { key: 'news', label: 'news' },
  { key: 'calendar', label: 'calendar' },
  { key: 'assets', label: 'assets' },
  { key: 'crypto', label: 'crypto' },
  { key: 'indicators', label: 'indicators' },
  { key: 'school', label: 'school' },
  { key: 'tools', label: 'tools' },
];

/** Links do rodapé (rótulos em src/i18n/ui.ts → footer). */
export const FOOTER_LINKS: { key: RouteKey; label: 'about' | 'glossary' | 'risk_' | 'terms' | 'privacy' }[] = [
  { key: 'about', label: 'about' },
  { key: 'glossary', label: 'glossary' },
  { key: 'risk', label: 'risk_' },
  { key: 'terms', label: 'terms' },
  { key: 'privacy', label: 'privacy' },
];
