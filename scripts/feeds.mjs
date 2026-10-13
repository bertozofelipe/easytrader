// Feeds RSS de notícias. category: mercados | brasil | forex | cripto; lang: pt | en.
// Só exibimos título, trecho curto e link para a matéria original.

export const FEEDS = [
  // Português
  { source: 'Money Times', url: 'https://www.moneytimes.com.br/feed/', category: 'brasil', lang: 'pt' },
  { source: 'Investing.com Brasil', url: 'https://br.investing.com/rss/news.rss', category: 'mercados', lang: 'pt' },
  { source: 'Livecoins', url: 'https://livecoins.com.br/feed/', category: 'cripto', lang: 'pt' },
  { source: 'Portal do Bitcoin', url: 'https://portaldobitcoin.uol.com.br/feed/', category: 'cripto', lang: 'pt' },

  // Inglês
  { source: 'CNBC Markets', url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', category: 'mercados', lang: 'en' },
  { source: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories/', category: 'mercados', lang: 'en' },
  { source: 'Investing.com', url: 'https://www.investing.com/rss/news.rss', category: 'mercados', lang: 'en' },
  { source: 'FXStreet', url: 'https://www.fxstreet.com/rss/news', category: 'forex', lang: 'en' },
  { source: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'cripto', lang: 'en' },
  { source: 'Cointelegraph', url: 'https://cointelegraph.com/rss', category: 'cripto', lang: 'en' },
];

// Notícias mais antigas que isso são descartadas.
export const NEWS_MAX_AGE_HOURS = 48;
// Máximo por feed e no total (o arquivo fica leve para o navegador).
export const NEWS_PER_FEED = 20;
export const NEWS_MAX_TOTAL = 160;
