/**
 * theme.js — light/dark theme controller.
 *
 * Contract:
 *   - The chosen theme is stored in localStorage under `ccna_path_theme`
 *     (values: 'light' | 'dark'), matching the naming style of the
 *     progress keys the platform already uses.
 *   - The root element carries `data-theme="light|dark"`.
 *   - Every `[data-theme-toggle]` button flips the theme, updates
 *     `aria-pressed`, and announces the change to assistive tech.
 *
 * The no-flash bootstrap lives inline in BaseHead so the correct
 * palette is applied before the first paint.
 */

export const THEME_KEY = 'ccna_path_theme';

/** Read the theme currently applied to the document. */
export function currentTheme() {
  const explicit = document.documentElement.getAttribute('data-theme');
  if (explicit === 'light' || explicit === 'dark') return explicit;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/** Apply a theme to the document and persist it. */
export function setTheme(theme) {
  const next = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* storage unavailable — the theme still applies for this session */
  }
  // Let the browser repaint scrollbars/controls to match.
  document.documentElement.style.colorScheme = next;
  syncControls(next);
  return next;
}

export function toggleTheme() {
  return setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
}

/** Keep every toggle button's state in sync. */
function syncControls(theme) {
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    // aria-pressed reflects "dark mode is on".
    btn.setAttribute('aria-pressed', String(theme === 'dark'));
    const label = btn.querySelector('[data-theme-toggle-label]');
    if (label) {
      label.textContent = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    }
  });
}

function init() {
  syncControls(currentTheme());

  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = toggleTheme();
      // Announce for screen-reader users.
      let region = document.getElementById('a11y-announcer');
      if (!region) {
        region = document.createElement('div');
        region.id = 'a11y-announcer';
        region.className = 'sr-only';
        region.setAttribute('aria-live', 'polite');
        document.body.appendChild(region);
      }
      region.textContent = `${next === 'dark' ? 'Dark' : 'Light'} theme enabled`;
    });
  });

  // Follow the OS only while the user has not made an explicit choice.
  const media = window.matchMedia('(prefers-color-scheme: light)');
  media.addEventListener?.('change', (event) => {
    let stored = null;
    try {
      stored = localStorage.getItem(THEME_KEY);
    } catch {
      stored = null;
    }
    if (stored) return;
    setTheme(event.matches ? 'light' : 'dark');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
