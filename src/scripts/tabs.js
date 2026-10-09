/**
 * tabs.js — WAI-ARIA tabs behaviour (progressive enhancement).
 *
 * Works with TabBar.astro: the component renders only the tablist, and
 * the page renders the panels. They are linked by `data-panel` /
 * `data-tab` values, and `aria-controls` on the tab points at the panel
 * id — so panels may live anywhere in the document.
 *
 * Markup contract:
 *   [data-tabs]
 *     [role=tablist] > [role=tab][data-tab="id"]
 *   [role=tabpanel][data-panel="id"]     (anywhere on the page)
 *
 * Arrow keys move between tabs, Home/End jump to the ends, and a roving
 * tabindex keeps exactly one tab in the tab order.
 */

function select(id, { focus = false } = {}) {
  // Scope to the group that owns this tab so two tab sets on one page
  // never interfere with each other.
  const group = document
    .querySelector(`[data-tabs] [data-tab="${CSS.escape(id)}"]`)
    ?.closest('[data-tabs]');
  if (!group) return;

  const tabs = Array.from(group.querySelectorAll('[data-tab]'));
  const target = tabs.find((t) => t.dataset.tab === id);
  if (!target) return;

  tabs.forEach((el) => {
    const isActive = el.dataset.tab === id;
    el.setAttribute('aria-selected', String(isActive));
    el.tabIndex = isActive ? 0 : -1;
  });

  const ids = new Set(tabs.map((t) => t.dataset.tab));
  document.querySelectorAll('[data-panel]').forEach((panel) => {
    // Only touch panels that belong to this tab set.
    if (!ids.has(panel.dataset.panel)) return;
    panel.hidden = panel.dataset.panel !== id;
  });

  if (focus) target.focus();
}

function init(group) {
  if (group.dataset.tabsReady === 'true') return;
  group.dataset.tabsReady = 'true';

  const tabs = Array.from(group.querySelectorAll('[data-tab]'));
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => select(tab.dataset.tab));
  });

  group.addEventListener('keydown', (event) => {
    const current = event.target.closest('[data-tab]');
    if (!current) return;

    const index = tabs.indexOf(current);
    if (index === -1) return;

    let next = null;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (index + 1) % tabs.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (index - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = tabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    select(tabs[next].dataset.tab, { focus: true });
  });

  // Make sure the initial state matches the markup on first load.
  const initial = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
  select(initial.dataset.tab);
}

function initAll() {
  document.querySelectorAll('[data-tabs]').forEach(init);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}