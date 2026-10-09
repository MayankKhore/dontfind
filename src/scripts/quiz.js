/**
 * quiz.js — interactive MCQ behaviour (progressive enhancement).
 *
 * The questions and options are rendered as static HTML by the Astro
 * template (so they are crawlable and readable with JS off). This script
 * only adds interaction: grading, explanations, progress and the score.
 *
 * Markup contract (see src/pages/quizzes/[slug].astro):
 *   [data-quiz][data-quiz-id]
 *     .question[data-answer="a|b|c|d"][data-answered]
 *       input[type=radio][name][value]
 *       .option            (label; gets data-state=correct|incorrect)
 *       .quiz-explanation
 *     [data-quiz-progress-text], [data-quiz-progress-fill], [role=progressbar]
 *     [data-quiz-score]
 *     [data-quiz-result]
 *   [data-quiz-restart]
 */

import { markComplete } from './progress.js';
import { announce } from '../lib/a11y.js';

function init(quiz) {
  const questions = Array.from(quiz.querySelectorAll('[data-question]'));
  if (!questions.length) return;

  const total = questions.length;
  const fill = quiz.querySelector('[data-quiz-progress-fill]');
  const progressText = quiz.querySelector('[data-quiz-progress-text]');
  const progressbar = quiz.querySelector('[role="progressbar"]');
  const scoreEl = quiz.querySelector('[data-quiz-score]');
  const result = quiz.querySelector('[data-quiz-result]');
  const quizId = quiz.getAttribute('data-quiz-id') || 'quiz';
  let answered = 0;
  let correct = 0;
  let finished = false;

  const updateProgress = () => {
    const pct = Math.round((answered / total) * 100);
    if (fill) fill.style.width = pct + '%';
    if (progressText) progressText.textContent = `${answered} / ${total} answered`;
    if (progressbar) progressbar.setAttribute('aria-valuenow', String(answered));
    if (scoreEl) {
      scoreEl.textContent = `${correct} correct`;
      scoreEl.style.color = correct > 0 ? 'var(--green)' : '';
    }
  };

  const finish = () => {
    if (finished || answered < total) return;
    finished = true;
    if (result) {
      const pct = Math.round((correct / total) * 100);
      result.hidden = false;
      result.innerHTML = `
        <p class="quiz-result__score">${correct} / ${total}</p>
        <p>${
          pct >= 80
            ? 'Strong result — you have the exam topic covered.'
            : pct >= 50
              ? 'A decent base. Re-read the explanations for the ones you missed.'
              : 'Worth another pass through the lessons, then retake this quiz.'
        }</p>`;
      result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    markComplete(quizId);
    announce(`Quiz finished. ${correct} of ${total} correct.`);
  };

  questions.forEach((q) => {
    const inputs = Array.from(q.querySelectorAll('input[type="radio"]'));
    const answer = q.getAttribute('data-answer');
    const explanation = q.querySelector('.quiz-explanation');
    let locked = false;

    inputs.forEach((input) => {
      input.addEventListener('change', () => {
        if (locked) return;
        locked = true;
        const chosen = input.value;
        const isRight = chosen === answer;

        q.dataset.answered = 'true';

        // Mark option states for styling + assistive tech.
        inputs.forEach((i) => {
          const li = i.closest('.option');
          i.disabled = true;
          if (i.value === answer) {
            li?.setAttribute('data-state', 'correct');
          } else if (i === input) {
            li?.setAttribute('data-state', 'incorrect');
          }
        });

        if (isRight) correct += 1;
        if (explanation) {
          explanation.hidden = false;
          explanation.dataset.result = isRight ? 'correct' : 'incorrect';
        }

        answered += 1;
        updateProgress();
        announce(isRight ? 'Correct.' : 'Incorrect.');
        finish();
      });
    });
  });

  /* ---------------- Restart ----------------
     Answers are locked once chosen, so a restart has to rebuild the
     radios and clear the marked states. The saved score is left alone
     deliberately — a completed quiz stays completed. */
  quiz.querySelector('[data-quiz-restart]')?.addEventListener('click', () => {
    finished = false;
    answered = 0;
    correct = 0;

    questions.forEach((q) => {
      q.dataset.answered = 'false';
      q.querySelectorAll('.option').forEach((o) => o.removeAttribute('data-state'));
      q.querySelectorAll('input[type="radio"]').forEach((input) => {
        input.checked = false;
        input.disabled = false;
      });
      const explanation = q.querySelector('.quiz-explanation');
      if (explanation) {
        explanation.hidden = true;
        delete explanation.dataset.result;
      }
    });

    if (result) {
      result.hidden = true;
      result.innerHTML = '';
    }

    updateProgress();
    announce('Quiz restarted.');
  });

  updateProgress();
}

function initAll() {
  document.querySelectorAll('[data-quiz]').forEach(init);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
