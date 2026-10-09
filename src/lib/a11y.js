/**
 * a11y.js — accessibility helpers shared by components and client scripts.
 */

/**
 * Build a deterministic, collision-free id from a label. Used to wire
 * `<label for>` / `aria-describedby` / panel relationships consistently.
 */
export function makeId(prefix, label) {
  const slug = String(label || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${prefix}-${slug || Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Announce a message to assistive tech by updating (and re-inserting) a
 * live-region element. Creates the region on first use.
 */
export function announce(message, politeness = 'polite') {
  if (typeof document === 'undefined') return;
  let region = document.getElementById('a11y-announcer');
  if (!region) {
    region = document.createElement('div');
    region.id = 'a11y-announcer';
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
  }
  region.textContent = '';
  // Force a DOM mutation so screen readers re-announce repeated messages.
  window.setTimeout(() => {
    region.textContent = message;
  }, 30);
}

/**
 * Trap focus inside a container (used by modal dialogs). Returns a cleanup fn.
 */
export function trapFocus(container) {
  if (typeof document === 'undefined' || !container) return () => {};
  const selector =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const onKeydown = (e) => {
    if (e.key !== 'Tab') return;
    const nodes = Array.from(container.querySelectorAll(selector)).filter(
      (n) => n.offsetParent !== null,
    );
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  container.addEventListener('keydown', onKeydown);
  return () => container.removeEventListener('keydown', onKeydown);
}
