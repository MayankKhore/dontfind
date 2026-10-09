/**
 * smoke-routes.mjs — end-to-end route smoke test.
 *
 * Starts `astro dev` (default) or `astro preview` (--preview), waits for the
 * server to answer, checks every existing route, confirms an unknown route
 * returns 404, then shuts the server down.
 *
 * Usage:
 *   node scripts/smoke-routes.mjs              # dev server, default port
 *   node scripts/smoke-routes.mjs --preview    # production build preview
 *
 * Exits non-zero if anything is wrong, so it can gate a deploy.
 */
import { spawn } from 'node:child_process';

const usePreview = process.argv.includes('--preview');
const port = 4340 + (usePreview ? 1 : 0);
const base = `http://127.0.0.1:${port}`;

const expected = [
  '/',
  '/path/',
  '/dashboard/',
  '/profile/',
  '/premium/',
  '/labs/',
  '/labs/configure-access-vlans/',
  '/lessons/',
  '/lessons/subnetting/',
  '/quizzes/',
  '/quizzes/ipv4-addressing-basics/',
  '/tools/',
  '/tools/subnet-calculator/',
  '/tools/subnet-mask-converter/',
  '/interview-questions/',
  '/interview-questions/what-is-a-subnet-mask/',
  '/incidents/',
  '/incidents/vlan-mismatch-between-switches/',
  '/glossary/',
  '/glossary/vlan/',
  '/articles/',
  '/search/',
  '/about/',
  // Assets the redesigned UI depends on.
  '/search-index.json',
  '/favicon.svg',
];

// Generated at build time / copied from public/ — not present in dev.
const buildOnly = ['/robots.txt', '/sitemap-index.xml', '/legacy/'];

const must404 = ['/this-route-does-not-exist/'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function status(route) {
  try {
    const res = await fetch(base + route, { redirect: 'manual' });
    return res.status;
  } catch {
    return 0;
  }
}

async function waitForServer(attempts = 60) {
  for (let i = 0; i < attempts; i++) {
    if ((await status('/')) > 0) return true;
    await sleep(1000);
  }
  return false;
}

const server = spawn('npx', ['astro', usePreview ? 'preview' : 'dev', '--port', String(port)], {
  stdio: 'ignore',
  shell: true,
});

let failures = [];
try {
  if (!(await waitForServer())) {
    console.error(`Server did not start on ${base}`);
    process.exit(1);
  }

  for (const route of expected) {
    const code = await status(route);
    console.log(`${route} -> ${code}`);
    if (code !== 200) failures.push(`${route} expected 200, got ${code}`);
  }

  for (const route of buildOnly) {
    const code = await status(route);
    const note = usePreview ? (code === 200 ? '' : ' MISSING') : ' (build-time only, skipped in dev)';
    console.log(`${route} -> ${code}${note}`);
    if (usePreview && code !== 200) failures.push(`${route} expected 200, got ${code}`);
  }

  for (const route of must404) {
    const code = await status(route);
    console.log(`${route} -> ${code}`);
    if (code !== 404) failures.push(`${route} expected 404, got ${code}`);
  }
} finally {
  server.kill('SIGTERM');
}

if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('\nAll routes OK.');
process.exit(0);