// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE_URL, isSitemapEligible } from './src/config/seo.config.mjs';

/**
 * CCNA Path — Astro configuration.
 *
 * - Static output: every page is pre-rendered to crawlable HTML.
 * - `build.format: 'directory'` + default trailingSlash produce clean URLs
 *   (e.g. /labs/configure-access-vlans/ → .../index.html) with no `.html`
 *   extensions, which Netlify serves directly. `normalizePath()` in the SEO
 *   config forces every emitted URL into exactly that shape, so the sitemap,
 *   the canonical tag and the breadcrumbs can never disagree.
 * - The sitemap integration emits /sitemap-index.xml at build time.
 */
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  build: {
    format: 'directory',
  },
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      /**
       * Only canonical, eligible URLs reach the sitemap.
       *
       * Driven by the same `INDEXING_POLICY` that sets the meta robots tag,
       * so a page cannot be noindexed in the head yet still submitted for
       * indexing — the classic source of "Submitted URL marked noindex"
       * coverage losses.
       */
      filter: (page) => {
        const path = new URL(page).pathname;
        if (path.includes('/legacy')) return false;
        return isSitemapEligible(path);
      },

      /**
       * Emit lastmod + a priority hint.
       *
       * `lastmod` is the build time, which is honest for a fully static site:
       * every page genuinely re-renders on each deploy. Priority is derived
       * from depth — the home page and section hubs matter more than a deep
       * leaf — rather than being hand-maintained per page.
       */
      serialize(item) {
        const url = new URL(item.url);
        const depth = url.pathname.split('/').filter(Boolean).length;

        // 404 and other non-routable outputs never belong here.
        if (url.pathname.endsWith('.html') && url.pathname !== '/index.html') return null;

        return {
          ...item,
          lastmod: new Date().toISOString(),
          changefreq: depth === 0 ? 'weekly' : depth === 1 ? 'monthly' : 'yearly',
          priority: depth === 0 ? 1.0 : depth === 1 ? 0.8 : 0.6,
        };
      },
    }),
  ],
});

