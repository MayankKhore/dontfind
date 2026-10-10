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
 *  - `action` steps complete through Quick Actions buttons (rendered by
 *    labs/[slug].astro), which script the change into the device's
 *    running-config and echo every line into the transcript;
 *  - `command` steps advance on `cli:executed` when the expected command
 *    succeeded;
 *  - a live Compare Configurations panel renders the running-config (RAM,
 *    green) and startup-config (NVRAM, amber) side by side, highlighting
 *    every line that exists in only one of the two copies.
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

/**
 * Split a configuration into `!`-separated blocks of lines. The
 * "Building configuration…" preamble, the byte count and the trailing
 * `end` are dropped — they never help a learner compare copies.
 */
function configBlocks(text) {
  const blocks = [];
  let current = [];
  for (const raw of String(text || '').split('\n')) {
    const line = raw.replace(/\s+$/, '');
    const trimmed = line.trim();
    if (trimmed === '!') {
      if (current.length) blocks.push(current);
      current = [];
    } else if (
      !trimmed ||
      trimmed === 'end' ||
      trimmed.startsWith('Building configuration') ||
      trimmed.startsWith('Current configuration')
    ) {
      continue;
    } else {
      current.push(line);
    }
  }
  if (current.length) blocks.push(current);
  return blocks;
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
    this.runBodyEl = this.root.querySelector('[data-guide-run-body]');
    this.startBodyEl = this.root.querySelector('[data-guide-start-body]');
    this.doneEl = this.root.querySelector('[data-guide-done]');
    this.actionButtons = Array.from(document.querySelectorAll('[data-guide-action]'));
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
    // echoing each line into the transcript like a real session. Scripted
    // commands also tick the objectives checklist when they match.
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
      this.terminal.checkObjectives?.(command);
    }
    this.terminal.updatePrompt();
    this.terminal.scroll();
    this.terminal.line(
      step.outcome ||
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
      const action = btn.dataset.guideAction;
      const stepIndex = this.steps.findIndex((s) => s.type === 'action' && s.action === action);
      const active = current?.type === 'action' && current.action === action;
      btn.disabled = !active;
      const hint = btn.parentElement?.querySelector('[data-guide-action-hint]');
      if (!hint) return;
      if (active) {
        hint.textContent = 'Click to apply — it only changes running-config (RAM).';
      } else if (this.finished || (stepIndex > -1 && stepIndex < this.index)) {
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
      this.renderCompare(running, '');
      return;
    }
    if (running === startup) {
      setState(this.runStateEl, 'sync', 'In sync');
      setState(this.startStateEl, 'sync', 'In sync');
      this.renderCompare(running, startup);
      return;
    }
    const { added, removed } = diffLines(running, startup);
    setState(
      this.runStateEl,
      'dirty',
      `Active · ${added.length} unsaved line${added.length === 1 ? '' : 's'}`,
    );
    setState(this.startStateEl, 'stale', `Out of date · ${removed.length} behind`);
    this.renderCompare(running, startup);
  }

  /**
   * Fill the two compare cards. When the copies differ, only the differing
   * `!`-separated blocks are shown (capped) with the unique lines
   * highlighted; when they match, a small representative excerpt keeps the
   * cards readable instead of dumping the whole configuration.
   */
  renderCompare(running, startup) {
    const runBlocks = configBlocks(running);
    const startBlocks = configBlocks(startup);

    if (startup) {
      const runSet = new Set(runBlocks.map((b) => b.join('\n')));
      const startSet = new Set(startBlocks.map((b) => b.join('\n')));
      const runDiff = runBlocks.filter((b) => !startSet.has(b.join('\n')));
      const startDiff = startBlocks.filter((b) => !runSet.has(b.join('\n')));

      if (runDiff.length || startDiff.length) {
        this.fillCard(this.runBodyEl, runDiff, startSet, 'Only in RAM — not saved yet');
        this.fillCard(this.startBodyEl, startDiff, runSet, 'No differences');
        return;
      }
    }

    // In sync (or no saved copy): show a small stable excerpt.
    const interesting = (blocks) => {
      const picked = blocks.filter((b) =>
        b.some((l) => /^(hostname|vlan |interface )/i.test(l.trim())),
      );
      return picked.slice(0, 3);
    };
    this.fillCard(this.runBodyEl, interesting(runBlocks), null, 'Identical copies');
    if (startup) {
      this.fillCard(this.startBodyEl, interesting(startBlocks), null, 'Identical copies');
    } else {
      this.fillCard(this.startBodyEl, [], null, 'startup-config is not present');
    }
  }

  /**
   * Render blocks into a card <pre>. `otherSet` (a Set of the other
   * copy's blocks) marks lines that exist in only this copy as diffs.
   */
  fillCard(pre, blocks, otherSet, emptyNote) {
    if (!pre) return;
    pre.replaceChildren();
    const totalLines = blocks.reduce((n, b) => n + b.length, 0);
    if (totalLines === 0) {
      const note = document.createElement('span');
      note.className = 'guide__cfg-line guide__cfg-line--muted';
      note.textContent = emptyNote;
      pre.appendChild(note);
      return;
    }
    const otherLines = new Set();
    if (otherSet) {
      for (const block of otherSet) {
        for (const line of block.split('\n')) otherLines.add(line.trim());
      }
    }
    for (const block of blocks.slice(0, 5)) {
      for (const line of block) {
        const span = document.createElement('span');
        const unique = otherSet !== null && !otherLines.has(line.trim());
        span.className = 'guide__cfg-line' + (unique ? ' guide__cfg-line--diff' : '');
        span.textContent = line;
        pre.appendChild(span);
      }
      const gap = document.createElement('span');
      gap.className = 'guide__cfg-line guide__cfg-line--gap';
      gap.textContent = '!';
      pre.appendChild(gap);
    }
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
