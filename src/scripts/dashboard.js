/**
 * dashboard.js — paints the student dashboard from local progress.
 *
 * The page ships a JSON island ([data-curriculum]) describing every
 * trackable unit and stage. All progress math happens here so the page is
 * static HTML first: with JS disabled the reader still sees real content,
 * real counts and real links — just with zeroed progress.
 *
 * Storage contract is unchanged (`ccna_path_progress`, `ccna_path_streak`).
 */

import { getProgress, getStreak } from './progress.js';
import { evaluateAchievements } from '../lib/achievements.js';

// Re-exported so callers can import the badge list from one place.
export { ACHIEVEMENTS } from '../lib/achievements.js';

/* ---------------- Computation ---------------- */

/**
 * Compute every number the dashboard needs in one pass.
 * Pure and exported so it is straightforward to unit test.
 */
export function computeProgress(curriculum) {
  const units = curriculum?.units || [];
  const stages = curriculum?.stages || [];
  const totals = curriculum?.totals || { all: units.length, quiz: 0 };

  const completedIds = new Set(getProgress().completed);
  const streak = getStreak();

  const byType = {};
  let completed = 0;

  const marked = units.map((unit) => {
    const done = completedIds.has(unit.id);
    if (done) {
      completed += 1;
      byType[unit.type] = (byType[unit.type] || 0) + 1;
    }
    return { ...unit, done };
  });

  const stageStats = stages.map((stage) => {
    // The island carries stage ids only (see curriculumIsland) — the full
    // unit objects live once, at the top level.
    const done = (stage.ids || []).filter((id) => completedIds.has(id)).length;
    return {
      number: stage.number,
      name: stage.name,
      done,
      total: stage.total ?? (stage.ids || []).length,
      pct: stage.total ? Math.round((done / stage.total) * 100) : 0,
      next: marked.find((u) => u.stage === stage.number && !u.done) || null,
    };
  });

  // "Continue learning" = the first unfinished unit in the earliest
  // incomplete stage, falling back to the first unfinished unit overall.
  const nextUnit =
    stageStats.map((s) => s.next).find(Boolean) || marked.find((u) => !u.done) || null;

  const percent = totals.all ? Math.round((completed / totals.all) * 100) : 0;

  const context = { completed, streak, byType, totals, stages: stageStats, percent };

  const achievements = evaluateAchievements(context);

  return { ...context, nextUnit, achievements };
}

/* ---------------- Painting ---------------- */

function setRing(ring, percent) {
  ring.style.setProperty('--_pct', String(percent));
  const track = ring.querySelector('.ring__value');
  if (track) {
    const circ = Number(getComputedStyle(track).strokeDasharray) || 0;
    if (circ) {
      track.setAttribute('stroke-dashoffset', String(circ - (circ * percent) / 100));
    }
  }
  ring.setAttribute('aria-valuenow', String(percent));
  const text = ring.querySelector('[data-ring-text]');
  if (text) text.textContent = `${percent}%`;
}

function paint(root, result) {
  const set = (selector, value) => {
    root.querySelectorAll(selector).forEach((el) => {
      el.textContent = value;
    });
  };

  set('[data-dash-stat="completed"]', String(result.completed));
  set('[data-dash-stat="total"]', String(result.totals.all));
  set('[data-dash-stat="percent"]', `${result.percent}%`);
  set('[data-dash-stat="streak"]', result.streak === 1 ? '1 day' : `${result.streak} days`);
  set('[data-dash-stat="labs"]', String(result.byType.lab || 0));
  set('[data-dash-stat="lessons"]', String(result.byType.lesson || 0));
  set('[data-dash-stat="quizzes"]', String(result.byType.quiz || 0));
  set(
    '[data-dash-stat="achievements"]',
    String(result.achievements.filter((a) => a.earned).length),
  );

  root.querySelectorAll('[data-dash-ring]').forEach((ring) => setRing(ring, result.percent));

  // Per-stage rows.
  root.querySelectorAll('[data-stage-row]').forEach((row) => {
    const number = Number(row.dataset.stageRow);
    const stage = result.stages.find((s) => s.number === number);
    if (!stage) return;
    const fill = row.querySelector('[data-stage-fill]');
    if (fill) fill.style.width = `${stage.pct}%`;
    const count = row.querySelector('[data-stage-count]');
    if (count) count.textContent = `${stage.done} / ${stage.total}`;
    row.dataset.complete = String(stage.done > 0 && stage.done === stage.total);
    row.dataset.started = String(stage.done > 0);
  });

  // Continue-learning card.
  const next = root.querySelector('[data-next-unit]');
  if (next) {
    if (!result.nextUnit) {
      next.hidden = true;
      const done = root.querySelector('[data-next-complete]');
      if (done) done.hidden = false;
    } else {
      next.hidden = false;
      const link = next.querySelector('[data-next-href]');
      const title = next.querySelector('[data-next-title]');
      const kicker = next.querySelector('[data-next-kicker]');
      const type = next.querySelector('[data-next-type]');
      if (link) link.href = result.nextUnit.href;
      if (title) title.textContent = result.nextUnit.title;
      if (kicker) kicker.textContent = result.nextUnit.stageName || result.nextUnit.category || 'Up next';
      if (type) type.textContent = result.nextUnit.type;
    }
  }

  // Achievements.
  root.querySelectorAll('[data-achievement]').forEach((el) => {
    const found = result.achievements.find((a) => a.key === el.dataset.achievement);
    if (found) el.dataset.earned = String(found.earned);
  });

  // Empty state: nothing started yet.
  const empty = root.querySelector('[data-dash-empty]');
  if (empty) empty.hidden = result.completed > 0;
}

function init() {
  const root = document.querySelector('[data-dashboard]');
  if (!root) return;

  const island = root.querySelector('[data-curriculum]');
  let curriculum;
  try {
    curriculum = JSON.parse(island?.textContent || '{}');
  } catch {
    curriculum = {};
  }

  paint(root, computeProgress(curriculum));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}