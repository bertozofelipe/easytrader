import { getJson } from '../lib/http.mjs';

const LABELS_PT = {
  'Extreme Fear': 'Medo extremo',
  Fear: 'Medo',
  Neutral: 'Neutro',
  Greed: 'Ganância',
  'Extreme Greed': 'Ganância extrema',
};

/** Crypto Fear & Greed Index (alternative.me), últimos 30 dias. */
export async function fetchFearGreed() {
  const { data } = await getJson('https://api.alternative.me/fng/?limit=30');
  const history = data.map((d) => ({
    date: new Date(Number(d.timestamp) * 1000).toISOString().slice(0, 10),
    value: Number(d.value),
    label: LABELS_PT[d.value_classification] ?? d.value_classification,
  }));
  return { source: 'alternative.me', current: history[0], history };
}
