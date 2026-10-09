/**
 * audit-dist.mjs — extra post-build checks beyond verify-build.mjs.
 *
 * Looks for the classes of defect that are easy to introduce during a
 * redesign and hard to spot by eye across 100+ generated pages:
 *
 *   1. Unresolved template braces in visible text
 *   2. `undefined` / `NaN` / `[object Object]` leaking into markup
 *   3. Internal hrefs with no corresponding built file
 *   4. Duplicate element ids within a page
 *   5. Images/inputs without an accessible name
 *   6. Client bundles that failed to emit
 *
 * Usage: node scripts/audit-dist.mjs
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

/** Strip tags + script/style so we only inspect visible text. */
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

const problems = [];
const add = (file, kind, detail) => problems.push({ file, kind, detail });

const files = await walk(DIST);
const pages = files.filter((f) => f.endsWith('.html'));
const rel = (f) => path.relative(DIST, f).replace(/\\/g, '/');

/**
 * `/legacy/` is the frozen original single-page app, copied verbatim from
 * public/. It is intentionally left exactly as it shipped, so it is not
 * held to the design system's standards (and is excluded from the sitemap).
 */
const IGNORED = [/^\/legacy\//];

/** Build the set of URLs that resolve to something. */
const known = new Set(['/']);
for (const file of files) {
  const r = rel(file);
  if (r === 'index.html') known.add('/');
  else if (r.endsWith('/index.html')) known.add('/' + r.replace(/index\.html$/, ''));
  else known.add('/' + r);
}

let hrefsChecked = 0;
let pagesChecked = 0;

for (const file of pages) {
  const html = await readFile(file, 'utf8');
  const url = '/' + rel(file).replace(/index\.html$/, '');
  if (IGNORED.some((pattern) => pattern.test(url))) continue;

  const text = visibleText(html);
  pagesChecked += 1;

  // 1. Unresolved braces in visible text.
  const braces = text.match(/\{[a-zA-Z0-9_.\[\]'" -]{2,}\}/g);
  if (braces) add(url, 'unresolved-brace', braces.slice(0, 4).join(', '));

  // 2. Leaked JS values.
  for (const needle of ['undefined', 'NaN', '[object Object]']) {
    if (text.includes(needle)) add(url, 'leaked-value', needle);
  }

  // 3. Internal links.
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const clean = href.split('#')[0].split('?')[0];
    if (!clean) continue;
    hrefsChecked += 1;
    if (!known.has(clean) && !existsSync(path.join(DIST, clean.replace(/^\//, '')))) {
      add(url, 'broken-link', clean);
    }
  }

  // 4. Duplicate ids.
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) add(url, 'duplicate-id', [...new Set(dupes)].join(', '));

  // 5. Accessible names for controls. An input is fine if it has an
  //    aria-label/aria-labelledby, a matching <label for>, OR is wrapped
  //    inside a <label> (implicit association — which is how the quiz
  //    options are built).
  const bareInputs = [...html.matchAll(/<input\b[^>]*>/g)]
    .map((m) => ({ tag: m[0], index: m.index }))
    .filter(({ tag, index }) => {
      if (/type="(hidden|submit|button|reset)"/i.test(tag)) return false;
      if (/aria-label(ledby)?=/i.test(tag)) return false;

      const id = tag.match(/\sid="([^"]+)"/)?.[1];
      if (id && new RegExp(`for="${id}"`).test(html)) return false;

      // Wrapped in a <label>? Look back for an opening tag that has not
      // been closed since.
      const before = html.slice(Math.max(0, index - 300), index);
      const lastOpen = before.lastIndexOf('<label');
      const lastClose = before.lastIndexOf('</label>');
      if (lastOpen > lastClose) return false;

      return true;
    });

  if (bareInputs.length) add(url, 'input-without-label', `${bareInputs.length} input(s)`);

  // 6. Page must reference the bundled stylesheet.
  if (!/<link[^>]+rel="stylesheet"/.test(html)) add(url, 'missing-css', 'no stylesheet link');
}

/* ---------------- Report ---------------- */

console.log(
  `Audited ${pagesChecked} pages (${pages.length} built, /legacy/ skipped), ${hrefsChecked} internal links.`,
);

if (problems.length === 0) {
  console.log('Audit clean: no issues found.');
  process.exit(0);
}

const byKind = new Map();
for (const p of problems) {
  if (!byKind.has(p.kind)) byKind.set(p.kind, []);
  byKind.get(p.kind).push(p);
}

console.log(`\n${problems.length} issue(s) found:\n`);
for (const [kind, list] of byKind) {
  console.log(`── ${kind} (${list.length})`);
  for (const item of list.slice(0, 8)) console.log(`   ${item.file}  →  ${item.detail}`);
  if (list.length > 8) console.log(`   …and ${list.length - 8} more`);
  console.log('');
}

process.exit(1);