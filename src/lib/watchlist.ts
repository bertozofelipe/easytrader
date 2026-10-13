// Watchlist salva só no navegador (localStorage), sem login.
import { assetBySlug } from '../data/assets';

const STORE_KEY = 'easytrader:watchlist';
export const WATCHLIST_EVENT = 'easytrader:watchlist';

/** Slugs na ordem em que foram adicionados (ignora ativos que saíram do cadastro). */
export function getWatchlist(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]');
    if (Array.isArray(saved)) return saved.filter((s): s is string => typeof s === 'string' && !!assetBySlug(s));
  } catch {
    // Sem localStorage (modo privado etc.): lista vazia.
  }
  return [];
}

function save(list: string[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
  } catch {
    // Ignora: a lista só não fica salva.
  }
  window.dispatchEvent(new CustomEvent(WATCHLIST_EVENT, { detail: list }));
}

export const inWatchlist = (slug: string) => getWatchlist().includes(slug);

export function toggleWatchlist(slug: string): boolean {
  const list = getWatchlist();
  const has = list.includes(slug);
  save(has ? list.filter((s) => s !== slug) : [...list, slug]);
  return !has;
}

/** Chama `fn` agora e sempre que a lista mudar (nesta aba ou em outra). */
export function onWatchlistChange(fn: (list: string[]) => void) {
  fn(getWatchlist());
  window.addEventListener(WATCHLIST_EVENT, () => fn(getWatchlist()));
  window.addEventListener('storage', (e) => e.key === STORE_KEY && fn(getWatchlist()));
}

/**
 * Liga os botões `[data-watch="slug"]` da página: alterna o ativo na lista e
 * mantém aria-pressed e o rótulo em dia. Funciona com botões criados depois
 * (delegação de evento).
 */
export function bindWatchButtons() {
  // Vários componentes da mesma página podem chamar; liga uma vez só.
  const root = document.documentElement;
  if (root.dataset.watchBound) return;
  root.dataset.watchBound = 'true';
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-watch]');
    if (!btn) return;
    e.preventDefault();
    toggleWatchlist(btn.dataset.watch!);
  });
  onWatchlistChange(syncWatchButtons);
}

export function syncWatchButtons(list = getWatchlist()) {
  document.querySelectorAll<HTMLElement>('[data-watch]').forEach((btn) => {
    const on = list.includes(btn.dataset.watch!);
    btn.setAttribute('aria-pressed', String(on));
    const name = btn.dataset.watchName ?? '';
    btn.title = on ? `Remover ${name} da sua lista` : `Adicionar ${name} à sua lista`;
    btn.setAttribute('aria-label', btn.title);
    const label = btn.querySelector('[data-watch-label]');
    if (label) label.textContent = on ? 'Na sua lista' : 'Acompanhar';
  });
}
