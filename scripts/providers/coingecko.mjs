import { getJson, sleep } from '../lib/http.mjs';

const BASE = 'https://api.coingecko.com/api/v3';

// Chave "demo" é opcional; sem ela a API pública funciona com limites menores.
const headers = () => (process.env.COINGECKO_API_KEY ? { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY } : {});

export async function fetchCrypto({ topN }) {
  const markets = await getJson(
    `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${topN}&page=1&sparkline=true&price_change_percentage=1h,24h,7d`,
    { headers: headers() },
  );
  await sleep(1_500);
  const { data: global } = await getJson(`${BASE}/global`, { headers: headers() });

  return {
    source: 'CoinGecko',
    coins: markets.map((c) => ({
      id: c.id,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      image: c.image,
      rank: c.market_cap_rank,
      price: c.current_price,
      marketCap: c.market_cap,
      volume24h: c.total_volume,
      high24h: c.high_24h,
      low24h: c.low_24h,
      change1h: c.price_change_percentage_1h_in_currency ?? null,
      change24h: c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h ?? null,
      change7d: c.price_change_percentage_7d_in_currency ?? null,
      ath: c.ath,
      athChangePct: c.ath_change_percentage,
      // Sparkline de 7 dias (~168 pontos horários) reduzida para 42 pontos.
      sparkline7d: downsample(c.sparkline_in_7d?.price ?? [], 42),
    })),
    global: {
      totalMarketCap: global.total_market_cap?.usd ?? null,
      totalVolume: global.total_volume?.usd ?? null,
      marketCapChange24h: global.market_cap_change_percentage_24h_usd ?? null,
      btcDominance: global.market_cap_percentage?.btc ?? null,
      ethDominance: global.market_cap_percentage?.eth ?? null,
      activeCryptocurrencies: global.active_cryptocurrencies ?? null,
    },
  };
}

function downsample(values, size) {
  if (values.length <= size) return values;
  const step = (values.length - 1) / (size - 1);
  return Array.from({ length: size }, (_, i) => values[Math.round(i * step)]);
}
