/**
 * migrate-content.mjs — one-off, idempotent migration of the legacy
 * `public/legacy/js/data.js` content into validated Astro content files.
 *
 * Run with:  npm run migrate:content
 *
 * It safely evaluates the legacy data file in a sandbox (it only defines
 * data + pure functions, no DOM access at load time) and writes one JSON
 * file per lab / lesson into src/content/. Existing files are overwritten,
 * so re-running simply refreshes the migrated content.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { slugify } from '../src/lib/url.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataFile = path.join(root, 'public', 'legacy', 'js', 'data.js');

if (!existsSync(dataFile)) {
  console.error(`✖ Legacy data file not found at ${dataFile}`);
  process.exit(1);
}

const source = readFileSync(dataFile, 'utf8');
const factory = new Function(
  `${source}
   return {
     LABS: typeof LABS !== 'undefined' ? LABS : {},
     MATERIAL: typeof MATERIAL !== 'undefined' ? MATERIAL : {},
   };`,
);
const { LABS, MATERIAL } = factory();

/** Stage -> difficulty heuristic (matches the CCNA learning arc). */
function difficultyForStage(stage) {
  if (stage <= 4) return 'beginner';
  if (stage <= 7) return 'intermediate';
  return 'advanced';
}

/** Per-collection slug uniqueness (slugs only need to be unique within a collection). */
function slugger() {
  const used = new Set();
  return function uniqueSlug(title, fallbackId) {
    const base = slugify(title) || `item-${fallbackId ?? used.size + 1}`;
    let slug = base;
    if (used.has(slug)) {
      const suffix = fallbackId ?? used.size + 1;
      slug = `${base}-${suffix}`;
      let n = 2;
      while (used.has(slug)) slug = `${base}-${suffix}-${n++}`;
    }
    used.add(slug);
    return slug;
  };
}

/** Remove previously generated files so a re-run never leaves stale entries. */
function cleanDir(collection) {
  const dir = path.join(root, 'src', 'content', collection);
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
}

function writeEntry(collection, slug, data) {
  const dir = path.join(root, 'src', 'content', collection);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, `${slug}.json`), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function toDescription(text, fallback) {
  const clean = String(text || fallback || '').replace(/\s+/g, ' ').trim();
  return clean.length > 200 ? clean.slice(0, 199).trimEnd() + '…' : clean;
}

cleanDir('labs');
const labSlug = slugger();
let labCount = 0;
for (const stage of Object.values(LABS)) {
  for (const lesson of Object.values(stage.lessons || {})) {
    const slug = labSlug(lesson.title, lesson.id);
    writeEntry('labs', slug, {
      title: lesson.title,
      description: toDescription(lesson.scenario),
      scenario: lesson.scenario,
      duration: lesson.duration,
      stage: stage.stage,
      stageName: stage.stageName,
      category: stage.stageName,
      difficulty: difficultyForStage(stage.stage),
      status: 'published',
      icon: '🧪',
      order: lesson.id,
      allowedCommands: lesson.allowedCommands || [],
      objectives: lesson.objectives || [],
      concepts: lesson.concepts || [],
      topology: lesson.topology,
      tags: [],
      related: [],
      resources: [],
    });
    labCount += 1;
  }
}

cleanDir('lessons');
const lessonSlug = slugger();
let lessonCount = 0;
for (const stage of Object.values(MATERIAL)) {
  for (const lesson of Object.values(stage.lessons || {})) {
    const slug = lessonSlug(lesson.title, lesson.id);
    writeEntry('lessons', slug, {
      title: lesson.title,
      description: toDescription(lesson.tagline || lesson.sections?.[0]?.body),
      tagline: lesson.tagline,
      duration: lesson.duration,
      stage: stage.stage,
      stageName: stage.stageName,
      category: stage.stageName,
      difficulty: difficultyForStage(stage.stage),
      status: 'published',
      icon: lesson.icon || '📘',
      order: lesson.id,
      sections: lesson.sections || [],
      tags: [],
      related: [],
      resources: [],
    });
    lessonCount += 1;
  }
}

console.log(`✔ Migrated ${labCount} labs and ${lessonCount} lessons into src/content/.`);
