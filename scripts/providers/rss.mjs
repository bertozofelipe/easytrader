import { getText } from '../lib/http.mjs';

// Leitor mínimo de RSS 2.0 (todos os feeds configurados usam RSS), sem dependências.

const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', mdash: '—', ndash: '–',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', copy: '©', reg: '®', trade: '™',
};

export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return NAMED[code.toLowerCase()] ?? m;
  });
}

const unwrapCdata = (s) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');

function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? unwrapCdata(m[1]).trim() : '';
}

function attr(xml, name, attribute) {
  const m = xml.match(new RegExp(`<${name}\\s[^>]*${attribute}=["']([^"']+)["']`, 'i'));
  return m ? decodeEntities(m[1]) : '';
}

const stripTags = (s) => s.replace(/<[^>]*>/g, ' ');

export function toPlainText(html, max = 220) {
  // Remove tags antes de decodificar (atributos podem conter &gt;) e de novo
  // depois, para feeds que escapam o HTML (&lt;p&gt;).
  const text = decodeEntities(stripTags(decodeEntities(stripTags(html))))
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

export function parseRss(xml) {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  return items.map((item) => {
    const raw = tag(item, 'pubDate') || tag(item, 'dc:date');
    // Alguns feeds (Investing.com) mandam "2026-10-13 20:37:09" sem fuso: é UTC.
    const date = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(raw) ? `${raw.replace(' ', 'T')}Z` : raw;
    return {
      title: toPlainText(tag(item, 'title'), 300),
      link: decodeEntities(tag(item, 'link') || attr(item, 'link', 'href')).trim(),
      date: date ? new Date(date) : null,
      summary: toPlainText(tag(item, 'description')),
      image: attr(item, 'media:content', 'url') || attr(item, 'media:thumbnail', 'url') || attr(item, 'enclosure', 'url') || null,
    };
  });
}

const normalizeTitle = (t) => t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/**
 * Busca todos os feeds em paralelo; feeds com erro são ignorados (e listados em `failed`).
 */
export async function fetchNews(feeds, { maxAgeHours, perFeed, maxTotal }) {
  const cutoff = Date.now() - maxAgeHours * 3_600_000;
  const results = await Promise.allSettled(feeds.map(async (f) => ({ feed: f, items: parseRss(await getText(f.url)) })));

  const failed = [];
  const seen = new Set();
  const items = [];

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      failed.push(feeds[i].source);
      console.warn(`  rss: ${feeds[i].source} falhou (${r.reason?.message ?? r.reason})`);
      return;
    }
    const { feed } = r.value;
    r.value.items
      .filter((it) => it.title && /^https?:\/\//.test(it.link) && it.date && !Number.isNaN(it.date.getTime()))
      .filter((it) => it.date.getTime() >= cutoff && it.date.getTime() <= Date.now() + 3_600_000)
      .slice(0, perFeed)
      .forEach((it) => {
        const key = normalizeTitle(it.title);
        if (seen.has(it.link) || seen.has(key)) return;
        seen.add(it.link);
        seen.add(key);
        items.push({
          title: it.title,
          link: it.link,
          summary: it.summary,
          image: it.image,
          date: it.date.toISOString(),
          source: feed.source,
          category: feed.category,
          lang: feed.lang,
        });
      });
  });

  if (items.length === 0) throw new Error('nenhuma notícia coletada');
  items.sort((a, b) => b.date.localeCompare(a.date));
  return { source: 'RSS', failed, items: items.slice(0, maxTotal) };
}
