// Idiomas do site: português na raiz, inglês em /en/.
export type Lang = 'pt' | 'en';

export const LANGS: Lang[] = ['pt', 'en'];
export const DEFAULT_LANG: Lang = 'pt';

/** Tag BCP 47 (html lang, Intl). */
export const LOCALE: Record<Lang, string> = { pt: 'pt-BR', en: 'en-US' };
export const OG_LOCALE: Record<Lang, string> = { pt: 'pt_BR', en: 'en_US' };

/** Páginas e seus caminhos. Sem `en` = só existe em português (por enquanto). */
export const ROUTES = {
  home: { pt: '/', en: '/en/' },
  news: { pt: '/noticias', en: '/en/news' },
  calendar: { pt: '/calendario', en: '/en/calendar' },
  assets: { pt: '/ativos', en: '/en/assets' },
  crypto: { pt: '/cripto', en: '/en/crypto' },
  tools: { pt: '/ferramentas', en: '/en/tools' },
  about: { pt: '/sobre', en: '/en/about' },
  risk: { pt: '/aviso-de-risco', en: '/en/risk-disclaimer' },
  terms: { pt: '/termos', en: '/en/terms' },
  privacy: { pt: '/privacidade', en: '/en/privacy' },
  indicators: { pt: '/indicadores', en: '/en/indicators' },
  glossary: { pt: '/glossario', en: '/en/glossary' },
  school: { pt: '/escola' },
} satisfies Record<string, { pt: string; en?: string }>;

export type RouteKey = keyof typeof ROUTES;

/** Caminho da página no idioma; cai para o português se ainda não houver tradução. */
export function route(key: RouteKey, lang: Lang): string {
  const r: { pt: string; en?: string } = ROUTES[key];
  return (lang === 'en' && r.en) || r.pt;
}

export const hasRoute = (key: RouteKey, lang: Lang) => lang === 'pt' || 'en' in ROUTES[key];

export const assetPath = (slug: string, lang: Lang) => `${route('assets', lang)}/${slug}`;

/** Slug em inglês de cada guia de indicador (a chave é o slug em português). */
export const GUIDE_SLUG_EN: Record<string, string> = {
  'medias-moveis': 'moving-averages',
  rsi: 'rsi',
  macd: 'macd',
  'bandas-de-bollinger': 'bollinger-bands',
  estocastico: 'stochastic',
  atr: 'atr',
  volume: 'volume',
  'suporte-e-resistencia': 'support-and-resistance',
};

/** Guia de indicador no idioma, a partir do slug em português. */
export const guidePath = (ptSlug: string, lang: Lang) =>
  lang === 'en' && GUIDE_SLUG_EN[ptSlug] ? `${ROUTES.indicators.en}/${GUIDE_SLUG_EN[ptSlug]}` : `${ROUTES.indicators.pt}/${ptSlug}`;

export const langFromPath = (pathname: string): Lang => (pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'pt');

/** Navegador: idioma da página atual (lido do <html lang>). */
export const pageLang = (): Lang => (document.documentElement.lang.startsWith('en') ? 'en' : 'pt');
