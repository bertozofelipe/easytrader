// Agrupa candles de 15 minutos em timeframes maiores (1H, 4H) e descarta os
// que ainda não fecharam. Cada candle de saída tem `t` = horário de fechamento
// (ISO, UTC), o formato que o termômetro usa nos timeframes intradiários.

const NY = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  weekday: 'short',
  hourCycle: 'h23',
});

/** Data, minuto do dia e dia da semana no horário de Nova York. */
export function nyParts(ms) {
  const p = Object.fromEntries(NY.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, min: +p.hour * 60 + +p.minute, weekday: p.weekday };
}

const SESSION_OPEN = 9 * 60 + 30; // 9h30 em Nova York
const SESSION_CLOSE = 16 * 60; // 16h

/** Pregão regular dos EUA aberto (com 20 min de folga para os dados atrasados). */
export function usSessionOpen(ms = Date.now()) {
  const { min, weekday } = nyParts(ms);
  return weekday !== 'Sat' && weekday !== 'Sun' && min >= SESSION_OPEN && min < SESSION_CLOSE + 20;
}

/**
 * Agrupa barras de 15 min (`start` em ms, UTC) em candles de `minutes`.
 * session = true (ações/ETFs): candles ancorados na abertura de 9h30 de Nova
 * York, como nas plataformas (o 4H vai das 9h30 às 13h30 e das 13h30 às 16h).
 * session = false (câmbio, 24h): candles alinhados às horas cheias em UTC.
 */
export function aggregate(bars, minutes, { session = false, now = Date.now() } = {}) {
  const size = minutes * 60_000;
  const buckets = new Map();
  for (const b of bars) {
    let key;
    let end;
    if (session) {
      const { date, min } = nyParts(b.start);
      if (min < SESSION_OPEN || min >= SESSION_CLOSE) continue;
      const idx = Math.floor((min - SESSION_OPEN) / minutes);
      key = `${date}|${idx}`;
      const endMin = Math.min(SESSION_OPEN + (idx + 1) * minutes, SESSION_CLOSE);
      end = b.start + (endMin - min) * 60_000;
    } else {
      key = Math.floor(b.start / size);
      end = (key + 1) * size;
    }
    const cur = buckets.get(key);
    if (cur) {
      cur.h = Math.max(cur.h, b.h);
      cur.l = Math.min(cur.l, b.l);
      cur.c = b.c;
    } else {
      buckets.set(key, { end, h: b.h, l: b.l, c: b.c });
    }
  }
  return [...buckets.values()]
    .filter((x) => x.end <= now)
    .sort((a, b) => a.end - b.end)
    .map((x) => ({ t: new Date(x.end).toISOString(), h: x.h, l: x.l, c: x.c }));
}
