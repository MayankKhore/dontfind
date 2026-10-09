/**
 * progress.js — learning-progress tracking.
 *
 * Preserves the exact storage contract used by the legacy CCNA Path app
 * (`ccna_path_progress`, `ccna_path_streak`) so existing users keep their
 * progress after the migration. Exposes a tiny event-based API.
 *
 * This module is only imported by pages that show progress UI.
 */

export const PROGRESS_KEY = 'ccna_path_progress';
export const STREAK_KEY = 'ccna_path_streak';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable (private mode) — fail silently */
  }
}

/** Progress shape: { completed: string[] } */
export function getProgress() {
  const p = read(PROGRESS_KEY, { completed: [] });
  if (!Array.isArray(p.completed)) p.completed = [];
  return p;
}

export function isComplete(id) {
  return getProgress().completed.includes(id);
}

/** Mark an item complete (idempotent) and notify listeners. */
export function markComplete(id) {
  const p = getProgress();
  if (id && !p.completed.includes(id)) {
    p.completed.push(id);
    write(PROGRESS_KEY, p);
    recordActivity();
    emit(p);
  }
  return p;
}

export function resetItem(id) {
  const p = getProgress();
  p.completed = p.completed.filter((x) => x !== id);
  write(PROGRESS_KEY, p);
  emit(p);
  return p;
}

export function completionRatio(total) {
  if (!total) return 0;
  return Math.min(1, getProgress().completed.length / total);
}

/* --- Streak (kept compatible with the legacy widget) --- */
export function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function recordActivity() {
  const streak = read(STREAK_KEY, { dates: [] });
  const today = todayStr();
  if (!streak.dates.includes(today)) {
    streak.dates.push(today);
    write(STREAK_KEY, streak);
  }
  return streak;
}

export function getStreak() {
  const { dates = [] } = read(STREAK_KEY, { dates: [] });
  const set = new Set(dates);
  let count = 0;
  const cursor = new Date();
  while (set.has(cursor.toISOString().split('T')[0])) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

/* --- Tiny event bus so widgets stay in sync --- */
const listeners = new Set();
export function onProgressChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function emit(p) {
  listeners.forEach((fn) => {
    try {
      fn(p);
    } catch {
      /* ignore listener errors */
    }
  });
}
