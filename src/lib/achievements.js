/**
 * achievements.js — the badge registry.
 *
 * Kept separate from the dashboard controller so both server-rendered
 * Astro components and the client script can import it. Each rule is a
 * pure predicate over a computed context, which means the dashboard, the
 * profile page and any future export always agree on what is earned.
 */

/**
 * @typedef {Object} ProgressContext
 * @property {number} completed  how many units are done
 * @property {number} streak     consecutive days studied
 * @property {Record<string, number>} byType  done count per unit type
 * @property {{all:number, quiz:number}} totals
 * @property {Array<{done:number,total:number}>} stages
 */

export const ACHIEVEMENTS = [
  {
    key: 'first-step',
    title: 'First step',
    desc: 'Complete your first lesson, lab or quiz.',
    icon: 'play',
    earned: ({ completed }) => completed >= 1,
  },
  {
    key: 'ten-strong',
    title: 'Getting serious',
    desc: 'Complete 10 items.',
    icon: 'trending-up',
    earned: ({ completed }) => completed >= 10,
  },
  {
    key: 'fifty',
    title: 'Half a century',
    desc: 'Complete 50 items.',
    icon: 'award',
    earned: ({ completed }) => completed >= 50,
  },
  {
    key: 'lab-rat',
    title: 'Lab rat',
    desc: 'Complete 5 hands-on labs.',
    icon: 'flask',
    earned: ({ byType }) => (byType.lab || 0) >= 5,
  },
  {
    key: 'quiz-whiz',
    title: 'Quiz whiz',
    desc: 'Finish every available quiz.',
    icon: 'help-circle',
    earned: ({ byType, totals }) => totals.quiz > 0 && (byType.quiz || 0) >= totals.quiz,
  },
  {
    key: 'stage-one',
    title: 'Stage cleared',
    desc: 'Complete every item in a stage.',
    icon: 'check-circle',
    earned: ({ stages }) => stages.some((s) => s.total > 0 && s.done === s.total),
  },
  {
    key: 'streak-3',
    title: 'Three in a row',
    desc: 'Study three days in a row.',
    icon: 'flame',
    earned: ({ streak }) => streak >= 3,
  },
  {
    key: 'streak-7',
    title: 'Week strong',
    desc: 'Study seven days in a row.',
    icon: 'calendar',
    earned: ({ streak }) => streak >= 7,
  },
];

/** Evaluate every rule against a progress context. */
export function evaluateAchievements(context) {
  return ACHIEVEMENTS.map((a) => ({
    key: a.key,
    title: a.title,
    desc: a.desc,
    icon: a.icon,
    earned: Boolean(a.earned(context)),
  }));
}