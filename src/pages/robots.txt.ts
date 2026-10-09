import type { APIRoute } from 'astro';
import { SITE_URL, INDEXING_POLICY } from '../config/seo.config.mjs';

/**
 * robots.txt — generated at build time from the SEO config so it can never
 * disagree with the meta robots policy.
 *
 * The important part is what is *allowed*: the stylesheet bundles, the
 * client islands and the search index must stay crawlable or the pages
 * render as unstyled markup. A careless Disallow: / here is the single
 * most destructive SEO mistake a static site can make, so the allow-list is
 * explicit and the audit asserts against it.
 */
export const GET: APIRoute = ({ site }) => {
  const base = (site ? new URL(site).href : `${SITE_URL}/`).replace(/\/+$/, '');

  // Explicit allowances for everything a crawler needs to render the site.
  const allow = ['/', '/_astro/', '/search-index.json', '/favicon.svg', '/og-default.png'];

  // Disallow only what the indexing policy already reserves.
  const disallow = INDEXING_POLICY.map((rule) => `Disallow: ${rule.prefix}/`).join('\n');

  const body = `# ${SITE_URL} — CCNA Path
# Generated from src/config/seo.config.js. Edit the policy there, not here.
User-agent: *
${allow.map((path) => `Allow: ${path}`).join('\n')}
${disallow}

# Sitemap index (per-page sitemaps are linked from it).
Sitemap: ${base}/sitemap-index.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

