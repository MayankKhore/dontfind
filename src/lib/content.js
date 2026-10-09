/**
 * content.js — helpers for working with Astro content collections.
 *
 * Components receive entries via props, so these helpers mostly operate on
 * already-loaded arrays. This keeps them framework-light and easy to test.
 *
 * NOTE: Astro 5's Content Layer API exposes the URL segment as `entry.id`
 * (generated from the filename by the glob loader). There is no `entry.slug`.
 */

/** Route (href) for a collection name — `interview` lives at /interview-questions/. */
export function collectionHref(collection) {
  return collection === 'interview' ? '/interview-questions' : `/${collection}`;
}

/** Published entries only, sorted by `order` then title. */
export function published(entries = []) {
  return entries
    .filter((e) => e.data.status !== 'draft')
    .sort((a, b) => {
      const oa = a.data.order ?? 9999;
      const ob = b.data.order ?? 9999;
      if (oa !== ob) return oa - ob;
      return String(a.data.title).localeCompare(String(b.data.title));
    });
}

/** Every entry regardless of status, sorted for admin/preview lists. */
export function all(entries = []) {
  return [...entries].sort((a, b) =>
    String(a.data.title).localeCompare(String(b.data.title)),
  );
}

/** Group entries by a data key (e.g. category or difficulty). */
export function groupBy(entries = [], key = 'category') {
  return entries.reduce((acc, entry) => {
    const value = entry.data[key] ?? 'uncategorised';
    (acc[value] ||= []).push(entry);
    return acc;
  }, {});
}

/** Unique, sorted list of values for a given data key. */
export function uniqueValues(entries = [], key = 'category') {
  return [...new Set(entries.map((e) => e.data[key]).filter(Boolean))].sort();
}

/**
 * Resolve `related` references (array of { collection, slug }) into entries.
 * `lookup` is a map like { labs: [...entries], lessons: [...] }.
 * The ref's `slug` must match the entry's `id` (the filename-derived slug).
 */
export function resolveRelated(related = [], lookup = {}) {
  const out = [];
  for (const ref of related) {
    if (!ref || !ref.collection || !ref.slug) continue;
    const pool = lookup[ref.collection] || [];
    const found = pool.find((e) => e.id === ref.slug);
    if (found) out.push({ ...ref, entry: found });
  }
  return out;
}

/** Icons/labels shown beside a search result. */
const RESULT_META = {
  labs: { icon: 'flask', type: 'Lab' },
  lessons: { icon: 'book', type: 'Lesson' },
  quizzes: { icon: 'help-circle', type: 'Quiz' },
  tools: { icon: 'sliders', type: 'Tool' },
  interview: { icon: 'mic', type: 'Interview' },
  incidents: { icon: 'alert-triangle', type: 'Incident' },
  glossary: { icon: 'book-open', type: 'Glossary' },
  articles: { icon: 'file-text', type: 'Article' },
};

/**
 * Build a flat, serialisable search index from one or more collections.
 *
 * Each record carries a `label` (what a reader should actually see — the
 * glossary `term`, the interview `question`, otherwise the title) plus a
 * lower-cased `text` haystack so the client filter is a simple substring
 * match with no per-result DOM reads.
 */
export function buildSearchIndex(sources = {}) {
  const index = [];
  for (const [collection, entries] of Object.entries(sources)) {
    for (const entry of entries) {
      if (entry.data.status === 'draft') continue;

      const label = entry.data.question || entry.data.term || entry.data.title;
      const description = entry.data.description || entry.data.summary || '';
      const meta = RESULT_META[collection] || { icon: 'file-text', type: collection };

      index.push({
        collection,
        slug: entry.id,
        label,
        title: entry.data.title,
        description,
        category: entry.data.category || '',
        difficulty: entry.data.difficulty || '',
        icon: meta.icon,
        type: meta.type,
        url: `${collectionHref(collection)}/${entry.id}/`,
        text: `${label} ${entry.data.title} ${description} ${entry.data.category || ''} ${meta.type}`.toLowerCase(),
      });
    }
  }
  return index;
}
