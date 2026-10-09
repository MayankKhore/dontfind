/**
 * recent.js — "recently visited content".
 *
 * Every page rendered by BaseLayout exposes its own title, type and URL
 * on <main>, so this module records visits with no per-template wiring
 * and then paints any [data-recent-root] panel on the current page.
 *
 * Storage: `ccna_path_recent` — an array of { url, title, type, ts }.
 */

export const RECENT_KEY = 'ccna_path_recent';
export const RECENT_LIMIT = 12;

/** Icons used when rendering entries (mirrors Icon.astro's keys). */
const TYPE_ICONS = {
  lesson: 'book',
  lab: 'flask',
  quiz: 'help-circle',
  tool: 'sliders',
  interview: 'mic',
  incident: 'alert-triangle',
  glossary: 'book-open',
  article: 'file-text',
  page: 'file-text',
};

const TYPE_LABELS = {
  lesson: 'Lesson',
  lab: 'Lab',
  quiz: 'Quiz',
  tool: 'Tool',
  interview: 'Interview',
  incident: 'Incident',
  glossary: 'Glossary',
  article: 'Article',
  page: 'Page',
};

function read() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* private mode — recent history is a convenience, never required */
  }
}

/** Most-recent-first list of visited entries. */
export function getRecent(limit = RECENT_LIMIT) {
  return read().slice(0, limit);
}

/**
 * Record the current page. Called automatically on load; safe to call
 * again if a template wants explicit control.
 */
export function recordVisit(entry) {
  if (!entry || !entry.url || !entry.title) return;
  // The home page and utility pages are not "content".
  if (entry.type === 'page') return;

  const list = read().filter((item) => item.url !== entry.url);
  list.unshift({
    url: entry.url,
    title: entry.title,
    type: entry.type || 'page',
    ts: Date.now(),
  });
  write(list.slice(0, RECENT_LIMIT));
  return list;
}

/** Human-friendly "3m ago" style label. */
export function relativeTime(ts) {
  const diff = Date.now() - Number(ts || 0);
  if (!Number.isFinite(diff) || diff < 0) return '';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(Number(ts)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ---------------- Rendering ---------------- */

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}

function iconSvg(name) {
  // A tiny, self-contained stroke icon so this module needs no imports.
  const paths = {
    book: '<path d="M4 4.5h6.5a3 3 0 0 1 3 3V20a2.5 2.5 0 0 0-2.5-2.5H4Z"/>',
    flask: '<path d="M9.5 3h5"/><path d="M10.5 3v5.4L5.3 18a2 2 0 0 0 1.8 3h9.8a2 2 0 0 0 1.8-3L13.5 8.4V3"/>',
    'help-circle': '<circle cx="12" cy="12" r="9"/><path d="M12 17.4h.01"/>',
    sliders: '<path d="M4 6.5h8M17.5 6.5H20M4 12h4.5M14 12h6M4 17.5h8M17.5 17.5H20"/>',
    mic: '<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.6 11a6.4 6.4 0 0 0 12.8 0"/>',
    'alert-triangle': '<path d="M12 9.6v4"/><path d="M12 17h.01"/><path d="M10.3 4.4 2.7 17.5A2 2 0 0 0 4.4 20.5h15.2a2 2 0 0 0 1.7-3L13.7 4.4a2 2 0 0 0-3.4 0Z"/>',
    'book-open': '<path d="M12 6.6C10.4 5.2 8.4 4.5 6 4.5H3v13h3c2.4 0 4.4.7 6 2.1"/><path d="M12 6.6c1.6-1.3 3.6-2 6-2h3v13h-3c-2.4 0-4.4.7-6 2.1"/>',
    'file-text': '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/>',
  };
  const inner = paths[name] || paths['file-text'];
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
}

function render(list, root) {
  const limit = Number(root.getAttribute('data-recent-limit') || 6);
  const items = list.slice(0, limit);
  const listEl = root.querySelector('[data-recent-list]');
  const emptyEl = root.querySelector('[data-recent-empty]');
  const countEl = root.querySelector('[data-recent-count]');

  if (countEl) countEl.textContent = String(list.length);
  if (emptyEl) emptyEl.hidden = items.length > 0;
  // The loading hint must always be removed, success or empty —
  // otherwise it spins forever when storage is unavailable.
  const loadingEl = root.querySelector('[data-recent-loading]');
  if (loadingEl) loadingEl.hidden = true;
  if (!listEl) return;

  listEl.innerHTML = items
    .map(
      (item) => `
      <li>
        <a class="recent__item" href="${escapeHtml(item.url)}">
          ${iconSvg(TYPE_ICONS[item.type] || TYPE_ICONS.page)}
          <span class="recent__title">${escapeHtml(item.title)}</span>
          <span class="recent__meta">${escapeHtml(relativeTime(item.ts))}</span>
        </a>
      </li>`,
    )
    .join('');
  listEl.hidden = items.length === 0;
}

function trackCurrentPage() {
  const main = document.querySelector('main[data-page-title]');
  if (!main) return;
  recordVisit({
    url: main.getAttribute('data-page-url') || window.location.pathname,
    title: main.getAttribute('data-page-title') || document.title,
    type: main.getAttribute('data-page-type') || 'page',
  });
}

function init() {
  trackCurrentPage();
  const list = getRecent();
  document.querySelectorAll('[data-recent-root]').forEach((root) => render(list, root));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
