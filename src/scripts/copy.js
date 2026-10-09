/**
 * copy.js — "copy to clipboard" for code blocks.
 *
 * Progressive enhancement: the code is already visible and selectable;
 * the button only adds convenience. Falls back to a hidden textarea +
 * execCommand when the async clipboard API is unavailable (non-secure
 * origins, older browsers), and reports failure honestly rather than
 * silently claiming success.
 */

const RESET_MS = 1800;

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  // Fallback for non-secure contexts (e.g. plain http on a LAN).
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(area);
  return ok;
}

function init() {
  document.querySelectorAll('[data-copy-code]').forEach((button) => {
    if (button.dataset.copyReady === 'true') return;
    button.dataset.copyReady = 'true';

    button.addEventListener('click', async () => {
      const block = button.closest('[data-code-block]');
      const code = block?.querySelector('code');
      const label = button.querySelector('[data-copy-label]');
      if (!code) return;

      const text = code.innerText;
      let ok = false;
      try {
        ok = await copyText(text);
      } catch {
        ok = false;
      }

      if (label) label.textContent = ok ? 'Copied' : 'Press Ctrl+C';
      button.dataset.state = ok ? 'copied' : 'error';
      button.setAttribute('aria-live', 'polite');

      window.setTimeout(() => {
        if (label) label.textContent = 'Copy';
        button.dataset.state = '';
      }, RESET_MS);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}