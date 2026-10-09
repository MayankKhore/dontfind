/**
 * generate-og-image.mjs — rasterise the social share card.
 *
 * Facebook, X/Twitter and LinkedIn do not render SVG og:image previews, so
 * the SVG in public/ is only the design source. This converts it to the
 * 1200x630 PNG that `SOCIAL_IMAGE.path` in the SEO config points at.
 *
 * Uses sharp, which Astro already ships for image optimisation, so this
 * adds no dependency. Re-run after editing public/og-default.svg:
 *
 *   npm run og
 */
import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SOCIAL_IMAGE } from '../src/config/seo.config.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'public', 'og-default.svg');
const target = join(root, 'public', SOCIAL_IMAGE.path.replace(/^\//, ''));

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(source))) {
    console.error(`Missing design source: ${source}`);
    process.exit(1);
  }

  let sharp;
  try {
    ({ default: sharp } = await import('sharp'));
  } catch {
    console.error(
      'sharp is not installed. It ships with Astro, so run `npm install` first.',
    );
    process.exit(1);
  }

  const svg = await readFile(source);
  await sharp(svg, { density: 96 })
    .resize(SOCIAL_IMAGE.width, SOCIAL_IMAGE.height, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(target);

  console.log(`Wrote ${target} (${SOCIAL_IMAGE.width}x${SOCIAL_IMAGE.height})`);
}

main();
