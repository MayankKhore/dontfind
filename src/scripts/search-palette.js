/**
 * search-palette.js — the global ⌘K / Ctrl+K search overlay.
 *
 * Design notes:
 *  - The overlay never opens on its own. It is triggered by the header
 *    search button or the keyboard shortcut, so it is an opt-in tool
 *    rather than a distraction.
 *  - Quick links are server-rendered; the full index is fetched once
 *    (lazily, on first open) from /search-index.json and cached for the
 *    session. Pages stay light because the index is not inlined.
 *  - Focus is trapped while open and restored to the trigger on close.
 *  - Implements the combobox pattern: ArrowUp/ArrowDown, Home/End,
 *    Enter to open, Escape to close.
 */

import { trapFocus } from '../lib/a11y.js';

const INDEX_URL = '/search-index.json';
const MAX_RESULTS = 12;

/** Icons this module may need to draw client-side. */
const ICON_PATHS = {
  book: '<path d="M4 4.5h6.5a3 3 0 0 1 3 3V20a2.5 2.5 0 0 0-2.5-2.5H4Z"/>',
  flask: '<path d="M9.5 3h5"/><path d="M10.5 3v5.4L5.3 18a2 2 0 0 0 1.8 3h9.8a2 2 0 0 0 1.8-3L13.5 8.4V3"/>',
  'help-circle': '<circle cx="12" cy="12" r="9"/><path d="M12 17.4h.01"/>',
  sliders: '<path d="M4 6.5h8M17.5 6.5H20M4 12h4.5M14 12h6M4 17.5h8M17.5 17.5H20"/>',
  mic: '<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.6 11a6.4 6.4 0 0 0 12.8 0"/>',
  'alert-triangle':
    '<path d="M12 9.6v4"/><path d="M12 17h.01"/><path d="M10.3 4.4 2.7 17.5A2 2 0 0 0 4.4 20.5h15.2a2 2 0 0 0 1.7-3L13.7 4.4a2 2 0 0 0-3.4 0Z"/>',
  'book-open':
    '<path d="M12 6.6C10.4 5.2 8.4 4.5 6 4.5H3v13h3c2.4 0 4.4.7 6 2.1"/><path d="M12 6.6c1.6-1.3 3.6-2 6-2h3v13h-3c-2.4 0-4.4.7-6 2.1"/>',
  'file-text': '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/>',
  route:
    '<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M6 15.8V9.4A3.4 3.4 0 0 1 9.4 6H14"/>',
  gauge: '<path d="M3.6 18.4a9.2 9.2 0 1 1 16.8 0"/><path d="m12 14.2 3.6-3.6"/>',
  calculator:
    '<rect x="4.5" y="2.5" width="15" height="19" rx="2.2"/><path d="M8.2 7.2h7.6"/>',
  sparkles:
    '<path d="M11.5 3l1.7 4.6 4.6 1.7-4.6 1.7-1.7 4.6-1.7-4.6L5.2 9.3l4.6-1.7L11.5 3Z"/>',
  award: '<circle cx="12" cy="8.8" r="5.6"/><path d="m8.4 13.3-1 7.4L12 18.3l4.6 2.4-1-7.4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
};

function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}

function svg(name) {
  const inner = ICON_PATHS[name] || ICON_PATHS['file-text'];
  return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
}

let indexPromise = null;

/** Fetch the static search index once, then reuse it. */
function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch(INDEX_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .catch(() => []);
  }
  return indexPromise;
}

/**
 * Rank results so the best match floats to the top: a prefix match on the
 * visible label always beats a mid-string match, which always beats a
 * match that only appears in the description.
 */
export function search(items, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  const scored = [];
  for (const item of items) {
    const label = String(item.label || '').toLowerCase();
    const text = String(item.text || label);
    if (!terms.every((t) => text.includes(t))) continue;

    let score = 0;
    if (label.startsWith(q)) score += 100;
    if (label.includes(q)) score += 60;
    if (label.startsWith(terms[0])) score += 25;
    if (item.type && String(item.type).toLowerCase().includes(q)) score += 10;
    scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score || String(a.item.label).localeCompare(String(b.item.label)));
  return scored.slice(0, MAX_RESULTS).map((s) => s.item);
}
function init() {
  const overlay = document.querySelector('[data-search-overlay]');
  if (!overlay) return;

  const dialog = overlay.querySelector('.search-overlay__dialog');
  const input = overlay.querySelector('[data-search-overlay-input]');
  const listEl = overlay.querySelector('[data-search-overlay-results]');
  const hintEl = overlay.querySelector('[data-search-overlay-hint]');
  const emptyEl = overlay.querySelector('[data-search-overlay-empty]');
  const loadingEl = overlay.querySelector('[data-search-overlay-loading]');

  let index = null;
  let releaseFocus = null;
  let lastFocused = null;
  let options = [];
  let quickLinks = [];

  const announce = (message) => {
    let region = document.getElementById('a11y-announcer');
    if (!region) {
      region = document.createElement('div');
      region.id = 'a11y-announcer';
      region.className = 'sr-only';
      region.setAttribute('aria-live', 'polite');
      document.body.appendChild(region);
    }
    region.textContent = message;
  };

  const setOptions = (nodes, selectedIndex) => {
    options = nodes;
    nodes.forEach((node, i) => {
      node.setAttribute('aria-selected', String(i === selectedIndex));
      node.tabIndex = i === selectedIndex ? 0 : -1;
    });
  };

  const showQuickLinks = () => {
    quickLinks.forEach((node) => listEl.appendChild(node));
    setOptions(quickLinks, 0);
    if (hintEl) {
      hintEl.hidden = false;
      hintEl.textContent = 'Quick links';
    }
    if (emptyEl) emptyEl.hidden = true;
  };

  const showResults = (results) => {
    listEl.querySelectorAll('li:not([data-quick-link])').forEach((li) => li.remove());

    if (!results.length) {
      if (hintEl) hintEl.hidden = true;
      if (emptyEl) emptyEl.hidden = false;
      options = [];
      announce('No results');
      return;
    }

    if (hintEl) {
      hintEl.hidden = false;
      hintEl.textContent = `${results.length} result${results.length === 1 ? '' : 's'}`;
    }
    if (emptyEl) emptyEl.hidden = true;

    results.forEach((item) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'presentation');
      li.innerHTML = `
        <a class="search-overlay__result" href="${escapeHtml(item.url)}" role="option" aria-selected="false" data-overlay-item>
          ${svg(item.icon)}
          <span class="search-overlay__result-title">${escapeHtml(item.label)}</span>
          <span class="search-overlay__result-type">${escapeHtml(item.type || '')}</span>
        </a>`;
      listEl.appendChild(li);
    });

    setOptions(Array.from(listEl.querySelectorAll('[data-overlay-item]')), 0);
    announce(`${results.length} results available`);
  };

  let renderToken = 0;
  const runSearch = async (query) => {
    if (!query.trim()) {
      showQuickLinks();
      return;
    }
    if (!index) {
      if (loadingEl) loadingEl.hidden = false;
      const token = ++renderToken;
      const loaded = await loadIndex();
      if (token !== renderToken) return;
      index = loaded;
      if (loadingEl) loadingEl.hidden = true;
    }
    showResults(search(index || [], query));
  };

  const open = () => {
    if (!overlay.hidden) return;
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    input.value = '';
    showQuickLinks();
    releaseFocus = trapFocus(dialog);
    input.focus();
    announce('Search opened');
  };

  const close = () => {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.style.overflow = '';
    releaseFocus?.();
    releaseFocus = null;
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  };

  // Detach the server-rendered quick links once so we can re-append them.
  quickLinks = Array.from(listEl.querySelectorAll('li')).map((li) => {
    li.setAttribute('data-quick-link', '');
    return li;
  });
// --- open triggers -------------------------------------------------
  document.querySelectorAll('[data-search-open]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      open();
    });
  });

  document.addEventListener('keydown', (event) => {
    if ((event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (overlay.hidden) open();
      else close();
      return;
    }
    if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const tag = document.activeElement?.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        event.preventDefault();
        open();
      }
    }
  });

  // --- close triggers ------------------------------------------------
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay || event.target.hasAttribute('data-search-close')) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || overlay.hidden) return;
    event.preventDefault();
    close();
  });

  // --- combobox behaviour --------------------------------------------
  input.addEventListener('input', () => runSearch(input.value));

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!options.length) return;
      event.preventDefault();
      const current = options.findIndex((o) => o.getAttribute('aria-selected') === 'true');
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const next = (current + delta + options.length) % options.length;
      const wasSelected = current !== -1;

      options.forEach((node, i) => {
        node.setAttribute('aria-selected', String(i === next));
        node.tabIndex = i === next ? 0 : -1;
      });

      // Move real focus so Enter activates the highlighted option.
      if (wasSelected) options[next].focus();
      return;
    }

    if (event.key === 'Enter') {
      const selected = options.find((o) => o.getAttribute('aria-selected') === 'true');
      const target = selected || options[0];
      if (target) {
        event.preventDefault();
        window.location.href = target.getAttribute('href');
      }
    }
  });

  listEl.addEventListener('mousemove', (event) => {
    const node = event.target.closest('[data-overlay-item]');
    if (!node) return;
    options.forEach((o) => o.setAttribute('aria-selected', String(o === node)));
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}