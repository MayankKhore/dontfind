/**
 * curriculum.js — the shared study sequence.
 *
 * Labs, lessons and quizzes already carry `stage` / `stageName` in their
 * content, so the learning path, the dashboard and the progress maths are
 * all derived from one place rather than being hand-maintained per page.
 *
 * The progress ids built here (`lab:<slug>`, `lesson:<slug>`,
 * `quiz:<slug>`) are the exact ids the detail templates record via
 * progress.js — keep the two in sync.
 */

import { getCollection } from 'astro:content';
import { published } from './content.js';

/** Map a collection entry into a progress-trackable unit. */
function toUnit(entry, type, href) {
  return {
    id: `${type}:${entry.id}`,
    slug: entry.id,
    type,
    href,
    title: entry.data.title,
    description: entry.data.description || entry.data.summary || '',
    stage: Number.isFinite(entry.data.stage) ? entry.data.stage : null,
    stageName: entry.data.stageName || null,
    order: entry.data.order ?? 9999,
    difficulty: entry.data.difficulty || 'beginner',
    duration: entry.data.duration || null,
    category: entry.data.category || '',
  };
}

/**
 * Build the full curriculum: every trackable unit plus the ordered stages.
 * Quizzes without a stage are grouped into a trailing practice stage.
 */
export async function buildCurriculum() {
  const [labEntries, lessonEntries, quizEntries] = await Promise.all([
    getCollection('labs'),
    getCollection('lessons'),
    getCollection('quizzes'),
  ]);

  const units = [
    ...published(labEntries).map((e) => toUnit(e, 'lab', `/labs/${e.id}/`)),
    ...published(lessonEntries).map((e) => toUnit(e, 'lesson', `/lessons/${e.id}/`)),
    ...published(quizEntries).map((e) => toUnit(e, 'quiz', `/quizzes/${e.id}/`)),
  ];

  // Stages: group by stage number, keeping the first-seen stage name.
  const stageMap = new Map();
  for (const unit of units) {
    if (unit.stage === null) continue;
    if (!stageMap.has(unit.stage)) {
      stageMap.set(unit.stage, { number: unit.stage, name: unit.stageName || `Stage ${unit.stage}`, units: [] });
    }
    stageMap.get(unit.stage).units.push(unit);
  }

  const stages = [...stageMap.values()]
    .sort((a, b) => a.number - b.number)
    .map((stage) => ({
      ...stage,
      units: stage.units.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
      total: stage.units.length,
    }));

  const ungrouped = units
    .filter((u) => u.stage === null)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  if (ungrouped.length > 0) {
    stages.push({
      number: stages.length + 1,
      name: 'Practice & test',
      units: ungrouped,
      total: ungrouped.length,
    });
  }

  const byType = units.reduce((acc, unit) => {
    acc[unit.type] = (acc[unit.type] || 0) + 1;
    return acc;
  }, {});

  return {
    units,
    stages,
    totals: {
      all: units.length,
      lab: byType.lab || 0,
      lesson: byType.lesson || 0,
      quiz: byType.quiz || 0,
      stages: stages.length,
    },
  };
}

/**
 * Build the JSON island a progress-aware page embeds.
 *
 * Stages carry only their unit **ids**, never the full unit objects —
 * otherwise every unit is serialised twice (once at the top level and once
 * inside its stage), which roughly doubles the island on catalog pages
 * like /path/.
 *
 * Pass `includeUnits: false` when the page already renders every unit and
 * only needs the per-stage counts (e.g. the learning path).
 */
export function curriculumIsland(curriculum, { includeUnits = true } = {}) {
  return JSON.stringify({
    totals: curriculum.totals,
    stages: curriculum.stages.map((stage) => ({
      number: stage.number,
      name: stage.name,
      total: stage.total,
      ids: stage.units.map((unit) => unit.id),
    })),
    units: includeUnits ? curriculum.units : [],
  });
}