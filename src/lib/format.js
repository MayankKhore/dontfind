/**
 * format.js — small, dependency-free formatting helpers used by templates
 * and client scripts.
 */

/** Capitalise the first letter of a string. */
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Turn a slug or SCREAMING value into Title Case words. */
export function titleCase(str = '') {
  return String(str)
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => (w.length > 2 ? capitalize(w) : w))
    .join(' ');
}

/** Simple, dependency-free escape for values interpolated into HTML. */
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return c;
    }
  });
}

/** Plain-text excerpt from a longer string. */
export function excerpt(str = '', length = 160) {
  const clean = String(str).replace(/\s+/g, ' ').trim();
  return clean.length <= length ? clean : clean.slice(0, length - 1).trimEnd() + '…';
}

/** Format a duration given in minutes into "1h 20m" / "45 min". */
export function formatDuration(minutes) {
  const n = Number(minutes);
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n < 60) return `${n} min`;
  const h = Math.floor(n / 60);
  const m = n % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** Readable difficulty label. */
export function difficultyLabel(level = '') {
  return capitalize(String(level));
}

/** Pluralise a word for a count. */
export function pluralize(count, singular, plural) {
  return Number(count) === 1 ? singular : plural || singular + 's';
}

/** Format an ISO date string as e.g. "3 Oct 2026". */
export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
