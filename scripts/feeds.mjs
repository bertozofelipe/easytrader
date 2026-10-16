// Feeds RSS de notícias. category: mercados | brasil | forex | cripto | commodities; lang: pt | en.
// Só exibimos título, trecho curto e link para a matéria original.
//
// Commodities (ver src/data/commodities.ts): os feeds dedicados só entram com
// matérias que citam uma commodity acompanhada; os marcados com `strict`
// (agro e setoriais, que misturam técnica, clima e eventos) só com título que
// cite a commodity e um termo de mercado. Nos demais feeds, matérias com título
// assim também ganham o selo da commodity.

export const FEEDS = [
  // Português
  { source: 'Investing.com Brasil', url: 'https://br.investing.com/rss/news_11.rss', category: 'commodities', lang: 'pt' },
  { source: 'InfoMoney', url: 'https://www.infomoney.com.br/tudo-sobre/commodities/feed/', category: 'commodities', lang: 'pt' },
  { source: 'Globo Rural', url: 'https://globorural.globo.com/rss/globorural/', category: 'commodities', lang: 'pt', strict: true },
  { source: 'Canal Rural', url: 'https://www.canalrural.com.br/feed/', category: 'commodities', lang: 'pt', strict: true },
  { source: 'Money Times', url: 'https://www.moneytimes.com.br/tag/agronegocio/feed/', category: 'commodities', lang: 'pt', strict: true },
  { source: 'novaCana', url: 'https://www.novacana.com/rss', category: 'commodities', lang: 'pt', strict: true },
  { source: 'Money Times', url: 'https://www.moneytimes.com.br/feed/', category: 'brasil', lang: 'pt' },
  { source: 'Investing.com Brasil', url: 'https://br.investing.com/rss/news.rss', category: 'mercados', lang: 'pt' },
  { source: 'Livecoins', url: 'https://livecoins.com.br/feed/', category: 'cripto', lang: 'pt' },
  { source: 'Portal do Bitcoin', url: 'https://portaldobitcoin.uol.com.br/feed/', category: 'cripto', lang: 'pt' },

  // Inglês
  { source: 'Investing.com', url: 'https://www.investing.com/rss/news_11.rss', category: 'commodities', lang: 'en' },
  { source: 'OilPrice.com', url: 'https://oilprice.com/rss/main', category: 'commodities', lang: 'en', strict: true },
  { source: 'The Northern Miner', url: 'https://www.northernminer.com/feed/', category: 'commodities', lang: 'en', strict: true },
  { source: 'Beef Magazine', url: 'https://www.beefmagazine.com/rss.xml', category: 'commodities', lang: 'en', strict: true },
  { source: 'Farm Progress', url: 'https://www.farmprogress.com/rss.xml', category: 'commodities', lang: 'en', strict: true },
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
export const NEWS_MAX_TOTAL = 240;
