/**
 * verify-build.mjs — post-build sanity check.
 *
 * Scans dist/ for the defects that silently break a static site at scale:
 * broken internal links, missing canonical URLs, unresolved template braces
 * and missing SEO files. Run with: node scripts/verify-build.mjs
 */
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (full.endsWith('.html')) out.push(full);
  }
  return out;
}

const pages = walk('dist');
const problems = [];

const LEGACY = 'dist\\legacy\\';

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  // The frozen legacy app is copied verbatim from public/ — it is not an
  // Astro page, so skip canonical/schema expectations for it.
  const isLegacy = page.includes(LEGACY);

  // Every collection href must be a real built page (catches `undefined`).
  for (const [, url] of html.matchAll(/href="(\/(?:labs|lessons|quizzes|tools|interview-questions|incidents|glossary|articles)[^"]*)"/g)) {
    if (url.includes('undefined')) {
      problems.push(`${page}: broken link ${url}`);
      continue;
    }
    // "/labs/foo/" -> dist/labs/foo/index.html ; "/labs/foo" -> same (clean URL)
    const clean = url.split('#')[0].split('?')[0].replace(/^\/+|\/+$/g, '');
    if (!clean) continue;
    const target = join('dist', clean, 'index.html');
    if (!existsSync(target)) problems.push(`${page}: 404 target ${url}`);
  }

  if (isLegacy) continue;

  if (!html.includes('rel="canonical"')) problems.push(`${page}: missing canonical`);
  if (/class="[^"]*\{[a-zA-Z]+\./.test(html)) problems.push(`${page}: unresolved template brace in class`);
  if (html.includes('undefined')) problems.push(`${page}: literal "undefined" in output`);
}

const required = ['dist/404.html', 'dist/robots.txt', 'dist/sitemap-index.xml', 'dist/legacy/index.html'];

console.log(`Scanned ${pages.length} built pages.`);
for (const file of required) {
  if (!existsSync(file)) problems.push(`missing ${file}`);
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems.slice(0, 40)) console.error('  - ' + p);
  process.exit(1);
}
console.log('All checks passed.');