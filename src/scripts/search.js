/**
 * search.js — lightweight client-side filtering for index pages.
 *
 * Instead of shipping a separate index, every index page renders its cards
 * as static HTML (crawlable) and this module filters them in place. It is
 * O(n) over the visible cards and needs no dependencies.
 *
 * Markup contract:
 *   [data-search-root]
 *     [data-search-input]
 *     [data-search-status]
 *     [data-search-empty]            (toggled when nothing matches)
 *     [data-search-filter="category"|"difficulty"]
 *     [data-search-item]             (with data-category / data-difficulty)
 */

function normalise(value) {
  return String(value || '').toLowerCase().trim();
}

function init(root) {
  const input = root.querySelector('[data-search-input]');
  const items = Array.from(root.querySelectorAll('[data-search-item]'));
  const status = root.querySelector('[data-search-status]');
  const empty = root.querySelector('[data-search-empty]');
  const clearBtn = root.querySelector('[data-search-clear]');
  const filters = Array.from(root.querySelectorAll('[data-search-filter]'));
  if (!input || !items.length) return;

  const apply = () => {
    const q = normalise(input.value);
    const active = {};
    filters.forEach((f) => {
      active[f.getAttribute('data-search-filter')] = normalise(f.value);
    });

    let visible = 0;
    items.forEach((item) => {
      const haystack = normalise(item.dataset.searchText || item.textContent);
      const matchesQuery = !q || haystack.includes(q);
      const matchesFilters = Object.entries(active).every(([key, value]) => {
        if (!value || value === 'all') return true;
        return normalise(item.dataset[key]) === value;
      });
      const show = matchesQuery && matchesFilters;
      item.hidden = !show;
      if (show) visible += 1;
    });

    const filtering = Boolean(q) || Object.values(active).some((v) => v && v !== 'all');

    if (status) {
      status.textContent = filtering
        ? `${visible} result${visible === 1 ? '' : 's'}`
        : `${items.length} item${items.length === 1 ? '' : 's'}`;
    }
    if (empty) empty.hidden = visible !== 0;
    if (clearBtn) clearBtn.hidden = !filtering;
  };

  const clearAll = () => {
    input.value = '';
    filters.forEach((f) => {
      f.value = 'all';
    });
    apply();
    input.focus();
  };

  input.addEventListener('input', apply);
  input.addEventListener('search', apply);
  filters.forEach((f) => f.addEventListener('change', apply));
  clearBtn?.addEventListener('click', clearAll);

  // The empty state can also offer a "clear filters" escape hatch.
  root.querySelectorAll('[data-search-clear-all]').forEach((btn) => {
    btn.addEventListener('click', clearAll);
  });

  apply();
}

function initAll() {
  document.querySelectorAll('[data-search-root]').forEach(init);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
