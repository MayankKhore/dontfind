/**
 * guided-lesson.js — Duolingo-style locked progression for guided labs.
 *
 * Works with GuidedLesson.astro (markup/data contract documented there)
 * and the `guided` content config (src/content.config.ts).
 *
 * Behaviour:
 *  - locked progression: every terminal command except the current step's
 *    expected command (and the always-safe `?` / `help`) is vetoed via the
 *    cancelable `cli:before` event, so learners cannot skip steps, wander
 *    into other CLI modes, or break the simulated device;
 *  - `command` steps advance on `cli:executed` when the expected command
 *    succeeded;
 *  - `action` steps complete through a page control (the topology Add
 *    button), which scripts the change into the device's running-config;
 *  - a live status strip diffs running-config against startup-config so the
 *    RAM-vs-NVRAM gap (and its repair via `write memory`) stays visible.
 */

import { CLI } from './engine/cli.js';
import { markComplete } from './progress.js';
import { announce } from '../lib/a11y.js';

/** Commands that stay available at every step: pure help, never stateful. */
const ALWAYS_ALLOWED = new Set(['?', 'help']);

function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function parseJSON(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/**
 * Does raw terminal input satisfy the expected command of a step?
 * Accepts exact matches plus token abbreviations (`sh run` for
 * `show running-config`) — single-character tokens are rejected so
 * one-letter noise can never unlock a step.
 */
function matchesStep(input, step) {
  if (!step || step.type !== 'command') return false;
  const raw = normalize(input);
  if (!raw) return false;
  const candidates = [step.cmd, ...(step.accepts || [])].filter(Boolean).map(normalize);
  if (candidates.includes(raw)) return true;
  const tokens = raw.split(' ');
  if (tokens.some((t) => t.length < 2)) return false;
  return candidates.some((c) => {
    const expected = c.split(' ');
    if (expected.length !== tokens.length) return false;
    return tokens.every((t, i) => expected[i].startsWith(t));
  });
}

/** Lines present in running but not startup (and vice versa), deduped. */
function diffLines(running, startup) {
  const run = running.split('\n');
  const start = startup.split('\n');
  const startSet = new Set(start);
  const runSet = new Set(run);
  const added = [...new Set(run.filter((l) => !startSet.has(l)))];
  const removed = [...new Set(start.filter((l) => !runSet.has(l)))];
  return { added, removed };
}

class GuidedLesson {
  constructor(root) {
    this.root = root;
    this.steps = parseJSON(root.getAttribute('data-guide-steps'), []);
    this.lessonId = root.getAttribute('data-guide-lesson') || '';
    this.index = 0;
    this.finished = this.steps.length === 0;
    this.terminal = null;
    this.cacheDOM();
    this.bind();
    this.render();
    this.findTerminal();
  }

  cacheDOM() {
    this.countEl = this.root.querySelector('[data-guide-count]');
    this.progressEl = this.root.querySelector('[data-guide-progress]');
    this.fillEl = this.root.querySelector('[data-guide-fill]');
    this.stepEls = Array.from(this.root.querySelectorAll('[data-guide-step]'));
    this.runStateEl = this.root.querySelector('[data-guide-run-state]');
    this.startStateEl = this.root.querySelector('[data-guide-start-state]');
    this.diffEl = this.root.querySelector('[data-guide-diff]');
    this.diffListEl = this.root.querySelector('[data-guide-diff-list]');
    this.doneEl = this.root.querySelector('[data-guide-done]');
    this.actionButtons = Array.from(document.querySelectorAll('[data-guide-action]'));
    this.actionHintIndex = this.steps.findIndex((s) => s.type === 'action');
  }

  bind() {
    document.addEventListener('cli:before', (e) => this.onBefore(e));
    document.addEventListener('cli:executed', (e) => this.onExecuted(e));
    document.addEventListener('cli:ready', (e) => this.attach(e.detail?.terminal));
    this.root.querySelector('[data-guide-reset]')?.addEventListener('click', () => {
      window.location.reload();
    });
    this.actionButtons.forEach((btn) => {
      btn.addEventListener('click', () => this.onAction(btn));
    });
  }

  findTerminal() {
    const el = document.querySelector('[data-cli-sim]');
    if (el && el.__cliTerminal) this.attach(el.__cliTerminal);
  }

  attach(terminal) {
    if (!terminal || this.terminal === terminal) return;
    this.terminal = terminal;
    this.refreshStatus();
  }

  /* ---- Locked progression -------------------------------------------- */

  onBefore(e) {
    const term = e.detail?.terminal;
    if (!term || term !== this.terminal) return;
    if (this.finished) return;
    const step = this.steps[this.index];
    if (!step) return;
    const cmd = normalize(e.detail.command);
    if (ALWAYS_ALLOWED.has(cmd)) return;
    if (matchesStep(cmd, step)) return;
    e.preventDefault();
    e.detail.hint =
      step.hint ||
      (step.cmd
        ? `Locked — this step wants: ${step.cmd}`
        : `Locked — this step wants: ${step.buttonLabel || 'the action above'}`);
  }

  onExecuted(e) {
    if (e.detail?.terminal !== this.terminal) return;
    this.refreshStatus();
    if (this.finished) return;
    const step = this.steps[this.index];
    if (!step || step.type !== 'command') return;
    if (!matchesStep(e.detail.command, step)) return;
    if (e.detail.result && e.detail.result.type === 'error') {
      this.terminal?.line(`Not quite — this step expects: ${step.cmd}`, 'muted');
      this.terminal?.scroll();
      return;
    }
    this.advance();
  }

  onAction(btn) {
    if (this.finished || !this.terminal) return;
    const step = this.steps[this.index];
    if (!step || step.type !== 'action' || step.action !== btn.dataset.guideAction) return;
    btn.disabled = true;
    // Script the change straight into the shared device state through the
    // unrestricted engine (the lab allow-list never lists config commands),
    // echoing each line into the transcript like a real session.
    const device = this.terminal.device();
    const raw = new CLI(device);
    for (const command of step.commands || []) {
      const prompt = device.getPrompt();
      let result;
      try {
        result = raw.execute(command);
      } catch {
        result = { type: 'error', message: '% Unknown command' };
      }
      this.terminal.cmdLine(prompt, command);
      this.terminal.render(result);
    }
    this.terminal.updatePrompt();
    this.terminal.scroll();
    this.terminal.line(
      `${step.buttonLabel || 'Change'} applied — running-config only. Nothing saved yet.`,
      'success',
    );
    this.advance();
  }

  advance() {
    this.index += 1;
    if (this.index >= this.steps.length) {
      this.finish();
      return;
    }
    const next = this.steps[this.index];
    this.render();
    this.refreshStatus();
    if (next.tab) this.switchTab(next.tab);
    if (next.type === 'command') this.terminal?.input?.focus();
    announce(`Step ${this.index + 1} of ${this.steps.length}: ${next.title}`);
  }

  finish() {
    this.finished = true;
    this.render();
    this.refreshStatus();
    if (this.doneEl) this.doneEl.hidden = false;
    if (this.terminal) {
      this.terminal.line('');
      this.terminal.line(
        'Lesson complete — running-config and startup-config are in sync!',
        'success',
      );
      this.terminal.scroll();
      this.terminal.root.dispatchEvent(new CustomEvent('lab:complete', { bubbles: true }));
    }
    if (this.lessonId) markComplete(this.lessonId);
    const pageBtn = document.querySelector(
      `[data-lab-complete][data-lab-id="${CSS.escape(this.lessonId)}"]`,
    );
    if (pageBtn && pageBtn.dataset.state !== 'done') {
      pageBtn.dataset.state = 'done';
      pageBtn.disabled = true;
      pageBtn.innerHTML = '✓ Completed';
    }
    announce('Lesson complete. running-config and startup-config now match.');
  }

  switchTab(id) {
    document.querySelector(`[data-tab="${CSS.escape(id)}"]`)?.click();
  }

  /* ---- Rendering ------------------------------------------------------ */

  render() {
    const total = this.steps.length;
    const doneCount = Math.min(this.index, total);
    if (this.countEl) {
      this.countEl.textContent = this.finished ? 'Complete' : `Step ${this.index + 1}`;
    }
    if (this.progressEl) {
      this.progressEl.setAttribute('aria-valuenow', String(Math.min(this.index + 1, total)));
      this.progressEl.setAttribute('aria-valuemax', String(total));
    }
    if (this.fillEl) {
      this.fillEl.style.width = total ? `${(doneCount / total) * 100}%` : '100%';
    }
    this.stepEls.forEach((el, i) => {
      const state =
        i < this.index || this.finished ? 'done' : i === this.index ? 'current' : 'locked';
      el.dataset.state = state;
      if (state === 'current') el.setAttribute('aria-current', 'step');
      else el.removeAttribute('aria-current');
      const mark = el.querySelector('[data-guide-mark]');
      if (mark) mark.textContent = state === 'done' ? '✓' : String(i + 1);
    });

    const current = this.finished ? null : this.steps[this.index];
    this.actionButtons.forEach((btn) => {
      const active = current?.type === 'action' && current.action === btn.dataset.guideAction;
      btn.disabled = !active;
      const hint = btn.parentElement?.querySelector('[data-guide-action-hint]');
      if (!hint) return;
      if (active) {
        hint.textContent = 'Click to apply — it only changes running-config (RAM).';
      } else if (this.finished || this.index > this.actionHintIndex) {
        hint.textContent = 'Applied ✓';
      } else {
        hint.textContent = 'Locked — finish the current step first.';
      }
    });
  }

  /* ---- running vs startup status -------------------------------------- */

  refreshStatus() {
    if (!this.terminal || !this.runStateEl || !this.startStateEl) return;
    const device = this.terminal.device();
    const running =
      typeof device.generateRunningConfig === 'function' ? device.generateRunningConfig() : '';
    const startup = device.startupConfig || '';

    const setState = (el, state, text) => {
      el.dataset.state = state;
      el.textContent = text;
    };

    if (!startup) {
      setState(this.runStateEl, 'dirty', 'No saved copy yet');
      setState(this.startStateEl, 'missing', 'Not present');
      this.renderDiff(running.split('\n').slice(0, 8), []);
      return;
    }
    if (running === startup) {
      setState(this.runStateEl, 'sync', 'In sync');
      setState(this.startStateEl, 'sync', 'In sync');
      this.hideDiff();
      return;
    }
    const { added, removed } = diffLines(running, startup);
    setState(
      this.runStateEl,
      'dirty',
      `${added.length} unsaved line${added.length === 1 ? '' : 's'}`,
    );
    setState(this.startStateEl, 'stale', 'Out of date');
    this.renderDiff(added, removed);
  }

  renderDiff(added, removed) {
    if (!this.diffEl || !this.diffListEl) return;
    const shown = [
      ...added.slice(0, 6).map((l) => ({ kind: 'add', text: l })),
      ...removed.slice(0, 4).map((l) => ({ kind: 'del', text: l })),
    ];
    if (shown.length === 0) {
      this.hideDiff();
      return;
    }
    this.diffListEl.replaceChildren(
      ...shown.map(({ kind, text }) => {
        const li = document.createElement('li');
        li.className = kind === 'add' ? 'guide__diff-add' : 'guide__diff-del';
        li.textContent = `${kind === 'add' ? '+ ' : '− '}${text || '(blank line)'}`;
        return li;
      }),
    );
    this.diffEl.hidden = false;
  }

  hideDiff() {
    if (!this.diffEl || !this.diffListEl) return;
    this.diffListEl.replaceChildren();
    this.diffEl.hidden = true;
  }
}

function init() {
  document.querySelectorAll('[data-guide]').forEach((el) => new GuidedLesson(el));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
