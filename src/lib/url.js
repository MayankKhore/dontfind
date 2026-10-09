/**
 * url.js — URL + slug helpers (no framework dependencies, unit-testable).
 *
 * Every absolute URL the site emits is built here, so the canonical tag,
 * the sitemap, the JSON-LD and the breadcrumbs cannot drift apart.
 */

import { SITE_URL, normalizePath } from '../config/seo.config.mjs';

export { normalizePath };

/** Turn arbitrary text into a URL-safe slug. */
export function slugify(input) {
  return String(input)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

/** Join path segments, collapsing duplicate slashes. */
export function joinPath(...segments) {
  return segments
    .filter(Boolean)
    .join('/')
    .replace(/([^:\/])\/{2,}/g, '$1/')
    .replace(/\/{2,}/g, '/');
}

/** Build an absolute URL from a site-relative path, in canonical form. */
export function absoluteUrl(path = '/') {
  return `${SITE_URL}${normalizePath(path)}`;
}

/**
 * Absolute URL for a static asset (image, icon, JSON).
 *
 * Unlike absoluteUrl() this does NOT append a trailing slash — doing so
 * turns /og-default.png into /og-default.png/, which 404s and silently
 * breaks every social preview.
 */
export function assetUrl(path = '/') {
  const raw = String(path || '').trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${SITE_URL}/${raw.replace(/^\/+/, '')}`;
}

/**
 * Self-referencing canonical URL.
 *
 * Strips query strings and fragments and forces the trailing slash the site
 * is actually built with, so /labs/x, /labs/x/, /labs/x/?utm=… and
 * #section-2 all collapse onto one address.
 */
export function canonical(path) {
  return absoluteUrl(path);
}

/** Content entry path: /labs/my-lab/ (clean, trailing-slash directory URL). */
export function contentPath(collectionHref, slug) {
  return `${collectionHref.replace(/\/$/, '')}/${slug}/`;
}

/** Return true when path is inside prefix (used for active nav state). */
export function isActive(path, prefix) {
  if (prefix === '/') return path === '/' || path === '';
  const clean = normalizePath(path);
  return clean === normalizePath(prefix) || clean.startsWith(`${normalizePath(prefix)}`);
}

