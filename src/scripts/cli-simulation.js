/**
 * cli-simulation.js — wires the Cisco IOS CLI engine to a terminal UI.
 *
 * This is the migrated equivalent of the legacy NetLabApp terminal logic,
 * but self-contained (no globals) and scoped to each `[data-cli-sim]`
 * element so multiple simulators can coexist on one page.
 *
 * Only pages that render a terminal load this module.
 */

import { Switch, PC } from './engine/devices.js';
import { CLI } from './engine/cli.js';
import { LabCLI } from './engine/lab-cli.js';
import { markComplete } from './progress.js';
import { announce } from '../lib/a11y.js';

function parseJSON(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

class Terminal {
  constructor(root) {
    this.root = root;
    this.tabs = Array.from(root.querySelectorAll('[data-cli-device]'));
    this.output = root.querySelector('[data-cli-output]');
    this.input = root.querySelector('[data-cli-input]');
    this.promptEl = root.querySelector('[data-cli-prompt]');
    this.allowed = parseJSON(root.getAttribute('data-cli-allowed'), null);
    this.objectives = parseJSON(root.getAttribute('data-cli-objectives'), []);
    this.lessonId = root.getAttribute('data-cli-lesson') || '';
    this.initialMode = root.getAttribute('data-cli-initial-mode') || 'user';
    this.setup = parseJSON(root.getAttribute('data-cli-setup'), []);
    this.devices = {
      sw1: new Switch('SW1'),
      sw2: new Switch('SW2'),
      'pc-a': new PC('PC-A'),
      'pc-b': new PC('PC-B'),
    };
    this.applySetup();
    this.activeId = this.tabs[0]?.getAttribute('data-cli-device') || 'sw1';
    this.history = [];
    this.historyIndex = -1;
    this.pendingPassword = false;
    this.cli = null;
    this.booted = new Set();
    this.bind();
    this.select(this.activeId);
  }

  /**
   * Run the lesson's silent seed commands through the unrestricted
   * engine (no allow-list, no grading, no transcript output) so the
   * device starts with pre-filled configuration. Runs before the
   * grading CLI instances are created on first device select.
   */
  applySetup() {
    if (!Array.isArray(this.setup) || this.setup.length === 0) return;
    for (const step of this.setup) {
      const targets = step?.device
        ? [step.device].filter((id) => this.devices[id])
        : Object.keys(this.devices);
      for (const id of targets) {
        const cli = new CLI(this.devices[id]);
        for (const command of step?.commands || []) {
          try {
            cli.execute(String(command));
          } catch {
            /* Seed failures must never break the lesson session. */
          }
        }
      }
    }
  }

  device() {
    return this.devices[this.activeId];
  }

  select(id) {
    this.activeId = id;
    this.history = [];
    this.historyIndex = -1;
    this.pendingPassword = false;
    const dev = this.device();
    // Lessons that exercise privileged/config commands boot there
    // instead of user EXEC, so the first objective works immediately.
    // Applied once per device — later navigation is the student's own.
    if (!this.booted.has(id)) {
      this.booted.add(id);
      if (this.initialMode === 'privileged' && dev.type !== 'pc') dev.mode = 'privileged';
      else if (this.initialMode === 'config' && dev.type !== 'pc') {
        dev.modeStack = ['privileged'];
        dev.mode = 'config';
      }
    }
    this.cli = this.allowed ? new LabCLI(dev) : new CLI(dev);
    if (this.allowed) this.cli.setAllowedCommands(this.allowed);
    this.tabs.forEach((t) =>
      t.setAttribute('aria-selected', String(t.getAttribute('data-cli-device') === id)),
    );
    this.output.innerHTML = '';
    this.line(`Connected to ${dev.hostname} (${dev.type === 'pc' ? 'PC' : 'Switch'})`);
    this.line("Type '?' for available commands.");
    this.line('');
    this.updatePrompt();
    this.input?.focus();
  }

  updatePrompt() {
    if (this.promptEl) this.promptEl.textContent = this.device().getPrompt();
  }

  line(text, cls = '') {
    const div = document.createElement('div');
    div.className = 'terminal__line' + (cls ? ` terminal__line--${cls}` : '');
    div.textContent = text;
    this.output.appendChild(div);
  }

  cmdLine(prompt, cmd) {
    const div = document.createElement('div');
    div.className = 'terminal__line terminal__cmd';
    const p = document.createElement('span');
    p.className = 'terminal__prompt';
    p.textContent = prompt;
    div.append(p, document.createTextNode(' ' + cmd));
    this.output.appendChild(div);
  }

  render(result) {
    if (!result) return;
    if (result.type === 'output') this.line(result.message);
    else if (result.type === 'success') {
      if (result.message) this.line(result.message, 'success');
      this.line('');
    } else if (result.type === 'error') {
      this.line(result.message, 'error');
      this.line('');
    } else if (result.type === 'info') {
      this.line(result.message);
      this.line('');
    } else if (result.type === 'password') {
      this.pendingPassword = true;
      this.line('Password: ');
    }
  }

  submit() {
    const input = this.input.value.trim();
    if (!input) return;
    this.input.value = '';
    this.history.push(input);
    this.historyIndex = -1;
    this.cmdLine(this.device().getPrompt(), input);

    if (this.pendingPassword) {
      this.pendingPassword = false;
      const dev = this.device();
      const expected = dev.enableSecret || dev.enablePassword;
      if (input === expected || input === 'cisco' || input === 'class') {
        dev.mode = 'privileged';
      } else {
        this.line('% Bad secrets', 'error');
      }
      this.line('');
      this.updatePrompt();
      this.scroll();
      return;
    }

    let result;
    try {
      result = this.cli.execute(input);
    } catch {
      result = { type: 'error', message: '% Unknown command or invalid input' };
    }
    this.render(result);
    this.updatePrompt();
    this.scroll();
    this.checkObjectives(input);
  }

  checkObjectives(input) {
    if (!this.objectives.length) return;
    const trimmed = input.trim().toLowerCase();
    let changed = false;
    this.objectives.forEach((obj, i) => {
      const el = this.root.querySelector(`[data-objective="${i}"]`);
      if (!el || el.getAttribute('data-done') === 'true') return;
      if (trimmed === String(obj).toLowerCase()) {
        el.setAttribute('data-done', 'true');
        const mark = el.querySelector('.objective__mark');
        if (mark) mark.textContent = '✓';
        changed = true;
      }
    });
    if (changed) this.updateProgress();
  }

  updateProgress() {
    const total = this.objectives.length;
    const done = this.objectives.filter((_, i) => {
      const el = this.root.querySelector(`[data-objective="${i}"]`);
      return el?.getAttribute('data-done') === 'true';
    }).length;
    const text = this.root.querySelector('[data-cli-progress]');
    if (text) text.textContent = `${done} / ${total} objectives`;
    if (total && done === total) {
      this.line('');
      this.line('✅ All objectives complete!', 'success');
      if (this.lessonId) markComplete(this.lessonId);
      announce('All objectives complete.');
      this.root.dispatchEvent(new CustomEvent('lab:complete', { bubbles: true }));
    }
  }

  scroll() {
    this.output.scrollTop = this.output.scrollHeight;
  }

  complete() {
    const value = this.input.value;
    if (!value.trim()) return;
    const completions = this.cli.getCompletions(value);
    if (completions.length === 1) {
      const parts = value.split(/\s+/);
      parts[parts.length - 1] = completions[0];
      this.input.value = parts.join(' ') + ' ';
    } else if (completions.length > 1) {
      this.line(completions.join('  '), 'muted');
      this.scroll();
    }
  }

  historyBack() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex += 1;
      this.input.value = this.history[this.history.length - 1 - this.historyIndex];
    }
  }

  historyForward() {
    if (this.historyIndex > 0) {
      this.historyIndex -= 1;
      this.input.value = this.history[this.history.length - 1 - this.historyIndex];
    } else {
      this.historyIndex = -1;
      this.input.value = '';
    }
  }

  bind() {
    this.tabs.forEach((tab) =>
      tab.addEventListener('click', () => this.select(tab.getAttribute('data-cli-device'))),
    );
    if (this.input) {
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.submit();
        } else if (e.key === 'Tab') {
          e.preventDefault();
          this.complete();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.historyBack();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.historyForward();
        } else if (e.ctrlKey && e.key === 'l') {
          e.preventDefault();
          this.output.innerHTML = '';
        }
      });
    }
    this.output?.addEventListener('click', () => this.input?.focus());
  }
}

function initAll() {
  document.querySelectorAll('[data-cli-sim]').forEach((el) => new Terminal(el));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
