/**
 * navigation.js — header behaviour.
 *
 * Loaded once via <Header>, so it runs on every page. Everything here is
 * progressive enhancement: without JS the nav is still a list of links.
 *
 * Handles:
 *   1. The mobile drawer ([data-nav-toggle] + [data-mobile-nav])
 *   2. Desktop dropdown triggers (click, Escape, outside click, arrows)
 *   3. A shadow on the header once the page has scrolled
 */

const DESKTOP_BREAKPOINT = 1040;

function initDrawer() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const drawer = document.querySelector('[data-mobile-nav]');
  if (!toggle || !drawer) return;

  const setOpen = (open) => {
    drawer.dataset.open = String(open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => {
    setOpen(drawer.dataset.open !== 'true');
  });

  // Following a link inside the drawer should close it (same-page links).
  drawer.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  // Return to a known-good state when the viewport grows past the
  // breakpoint, otherwise an invisible-but-open drawer lingers.
  window.addEventListener('resize', () => {
    if (window.innerWidth > DESKTOP_BREAKPOINT) setOpen(false);
  });
}

function initDropdowns() {
  const items = Array.from(document.querySelectorAll('[data-nav-item]'));
  if (!items.length) return;

  const closeAll = (except) => {
    items.forEach((item) => {
      if (item === except) return;
      item.dataset.open = 'false';
      item.querySelector('[data-nav-trigger]')?.setAttribute('aria-expanded', 'false');
    });
  };

  items.forEach((item) => {
    const trigger = item.querySelector('[data-nav-trigger]');
    if (!trigger) return;

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = item.dataset.open !== 'true';
      closeAll(item);
      item.dataset.open = String(open);
      trigger.setAttribute('aria-expanded', String(open));
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-nav-item]')) closeAll(null);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const openItem = items.find((item) => item.dataset.open === 'true');
    if (!openItem) return;
    const trigger = openItem.querySelector('[data-nav-trigger]');
    closeAll(null);
    // Return focus so keyboard users do not lose their place.
    trigger?.focus();
  });

  // Arrow-key movement between the top-level triggers. Tab still works
  // exactly as before for everyone else.
  const triggers = items.map((item) => item.querySelector('[data-nav-trigger]'));
  triggers.forEach((trigger, i) => {
    trigger?.addEventListener('keydown', (event) => {
      let next = null;
      if (event.key === 'ArrowRight') next = (i + 1) % triggers.length;
      if (event.key === 'ArrowLeft') next = (i - 1 + triggers.length) % triggers.length;
      if (next === null) return;
      event.preventDefault();
      triggers[next]?.focus();
    });
  });
}

function initScrollShadow() {
  const header = document.querySelector('[data-site-header]');
  if (!header) return;

  const update = () => {
    header.dataset.scrolled = String(window.scrollY > 4);
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
}

function init() {
  initDrawer();
  initDropdowns();
  initScrollShadow();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}