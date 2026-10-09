/**
 * seo.config.js - the single source of truth for technical SEO.
 *
 * Every decision that used to be scattered (and drifted) across site.js,
 * astro.config.mjs and robots.txt.ts now lives here, so a new content
 * page automatically inherits correct behaviour without per-page wiring.
 *
 * Pure, framework-free and dependency-free so it can be imported by Astro,
 * by the build scripts and by the SEO audit alike.
 */

/**
 * The canonical domain. SITE_URL wins at build time so the canonical host
 * can change (custom domain cut-over) without editing code or rebuilding
 * every template.
 */
function resolveSiteUrl() {
  const fromEnv =
    (typeof process !== 'undefined' && process.env && process.env.SITE_URL) || '';
  const raw = String(fromEnv).trim() || 'https://animated-manatee-4c3b08.netlify.app';
  return raw.replace(/\/+$/, '');
}

/** Canonical origin, never with a trailing slash. */
export const SITE_URL = resolveSiteUrl();

/* ------------------------------------------------------------------ *
 * Serp budgets
 * ------------------------------------------------------------------ */

/**
 * Google truncates titles around 580px (~60 chars) and rewrites long
 * descriptions. We stay inside those budgets at build time so nothing
 * depends on the search engine to truncate for us.
 */
export const TITLE_MAX = 60;
export const DESCRIPTION_MIN = 70;
export const DESCRIPTION_MAX = 160;

/* ------------------------------------------------------------------ *
 * Social sharing
 * ------------------------------------------------------------------ */

/**
 * The share image MUST be raster. Facebook, X/Twitter and LinkedIn do not
 * render SVG og:image previews, so the SVG in public/ is only a design
 * source - scripts/generate-og-image.mjs rasterises it to this PNG.
 */
export const SOCIAL_IMAGE = {
  path: '/og-default.png',
  width: 1200,
  height: 630,
  alt: 'CCNA Path - guided Cisco networking labs, lessons and quizzes that run in your browser',
};

export const SOCIAL = {
  siteName: 'CCNA Path',
  locale: 'en_GB',
  twitter: '@ccnapath',
};

/* ------------------------------------------------------------------ *
 * URL normalisation
 * ------------------------------------------------------------------ */

/**
 * Collapse a path into its single canonical form.
 *
 * The site builds with build.format: 'directory', so every page really
 * lives at a trailing-slash URL (/labs/configure-access-vlans/). Netlify
 * also answers /labs/configure-access-vlans and ?q= variants, so we
 * normalise hard here and let exactly one URL reach the sitemap, the
 * canonical tag, the JSON-LD and the breadcrumbs alike.
 */
export function normalizePath(input = '/') {
  let path = String(input || '/').trim();

  // Drop origin, query and fragment - a canonical never carries them.
  path = path.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]+/i, '');
  path = path.split('#')[0].split('?')[0];

  if (!path) return '/';
  if (!path.startsWith('/')) path = `/${path}`;

  // Collapse duplicate slashes, then force exactly one trailing slash.
  path = path.replace(/\/{2,}/g, '/').replace(/\/+$/, '');
  if (path === '') return '/';

  return `${path}/`;
}

/* ------------------------------------------------------------------ *
 * Indexing policy
 * ------------------------------------------------------------------ */

/**
 * The routes that must never appear in an index.
 *
 * Every entry states *why*, because an unexplained noindex is a trap: the
 * next person deletes it and the page starts ranking for its own name.
 *
 *  - /dashboard, /profile  per-reader state read from localStorage. A crawler
 *    sees the same empty shell a brand-new visitor sees, so indexing them
 *    creates thin, duplicate results under high-competition terms.
 *  - /search                a client-side filter over content already reachable
 *    at its real URL. Its ?q= variants form an unbounded near-duplicate
 *    space - the classic doorway pattern - so we noindex the hub and let the
 *    canonical collapse the parameters.
 *  - /premium               a "coming soon" waitlist stub. No substance to rank.
 *  - /404                   error document; must never be indexed.
 *  - /legacy                the frozen v1 app, also disallowed in robots.txt.
 *    robots.txt alone would only stop its outbound links being followed, not
 *    remove an existing ranking.
 *
 * follow stays on everywhere so crawlers keep walking out of these pages
 * into the content they link to.
 */
export const INDEXING_POLICY = [
  {
    prefix: '/dashboard',
    index: false,
    reason: 'Per-reader progress shell - no unique crawlable content.',
  },
  {
    prefix: '/profile',
    index: false,
    reason: 'Per-reader achievement page - no unique crawlable content.',
  },
  {
    prefix: '/search',
    index: false,
    reason: 'Client-side filter hub; query variants duplicate real content URLs.',
  },
  {
    prefix: '/premium',
    index: false,
    reason: '-Coming soon- waitlist stub with no substantive content.',
  },
  { prefix: '/404', index: false, reason: 'Error document.' },
  {
    prefix: '/legacy',
    index: false,
    reason: 'Frozen v1 single-page app; superseded by the Astro routes.',
  },
];

/**
 * Resolve the robots directive for a path. Unknown paths are indexable, so a
 * brand-new page is discoverable by default rather than silently hidden.
 */
export function indexingFor(pathname = '/') {
  const path = normalizePath(pathname);
  for (const rule of INDEXING_POLICY) {
    if (path === `${rule.prefix}/` || path.startsWith(`${rule.prefix}/`)) {
      return { index: rule.index, follow: true, reason: rule.reason, matched: rule.prefix };
    }
  }
  return { index: true, follow: true, reason: null, matched: null };
}

/** True when the path belongs in an XML sitemap. */
export function isSitemapEligible(pathname = '/') {
  // The error document is a file, not a route.
  if (pathname === '/404.html') return false;
  return indexingFor(pathname).index;
}

/* ------------------------------------------------------------------ *
 * Structured data types
 * ------------------------------------------------------------------ */

/**
 * Which schema.org type each collection genuinely qualifies for.
 *
 * Kept as data rather than per-template code so adding a collection is a
 * one-line change, and so the audit can assert that no page claims a type it
 * has no right to (notably FAQPage, which no longer earns a rich result
 * outside government and health sites).
 */
export const SCHEMA_BY_COLLECTION = {
  lessons: 'article',
  labs: 'learningResource',
  quizzes: 'quiz',
  tools: 'software',
  interview: 'article',
  incidents: 'article',
  glossary: 'definedTerm',
  articles: 'article',
};

/** Types the SEO audit treats as valid; anything else is a build error. */
export const ALLOWED_SCHEMA_TYPES = [
  'Organization',
  'WebSite',
  'WebPage',
  'ImageObject',
  'BreadcrumbList',
  'TechArticle',
  'LearningResource',
  'Quiz',
  'SoftwareApplication',
  'DefinedTerm',
  'DefinedTermSet',
  'Course',
];

