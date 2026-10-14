// Utilitários do navegador para atualizar blocos com os dados mais recentes.
import { pageLang } from '../i18n';
import { t } from '../i18n/ui';
import { formatRelative } from './format';
import { isStale } from './market';

export function setHtml(selector: string, html: string) {
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => (el.innerHTML = html));
}

export function setStamp(name: string, updatedAt: string) {
  document.querySelectorAll<HTMLElement>(`[data-stamp="${name}"]`).forEach((el) => {
    const stale = isStale(updatedAt);
    const lang = pageLang();
    el.textContent = `${stale ? '⚠ ' : ''}${t(lang).common.updated} ${formatRelative(updatedAt, Date.now(), lang)}`;
    el.classList.toggle('text-warn', stale);
  });
}

/** Executa agora e a cada `ms` enquanto a aba estiver visível. */
export function every(ms: number, fn: () => void) {
  fn();
  setInterval(() => document.visibilityState === 'visible' && fn(), ms);
}

export const REFRESH_MS = 5 * 60 * 1000;
