/**
 * lab-ui.js — per-lab UI configuration resolver.
 *
 * Each lab declares (in its content JSON, `ui` block) which lab-bench
 * pieces it actually needs: topology diagram, port map, terminal and the
 * devices the student touches. `labs/[slug].astro` renders from the
 * resolved config — never from hard-coded titles or URL strings — so
 * hiding an unused panel also removes its tab, its device controls and
 * the layout space it would have occupied.
 *
 * Labs without an explicit `ui` block keep the legacy behaviour: show
 * whatever content they carry and offer every terminal device tab.
 */

export const TERMINAL_DEVICES = ['sw1', 'sw2', 'pc-a', 'pc-b'];

const DEVICE_LABELS = { sw1: 'SW1', sw2: 'SW2', 'pc-a': 'PC-A', 'pc-b': 'PC-B' };

/** Human label for a terminal device id (`sw1` → `SW1`). */
export function deviceLabel(id, fallback = 'SW1') {
  if (!id) return fallback;
  return DEVICE_LABELS[id] || String(id).toUpperCase().replace(/-/g, '');
}

const TERMINAL_MODES = ['user', 'privileged', 'config'];

/** Normalise the silent seed-command list from a lab `ui` block. */
function normalizeSetup(setup) {
  if (!Array.isArray(setup)) return [];
  return setup
    .filter((step) => step && Array.isArray(step.commands) && step.commands.length > 0)
    .map((step) => ({
      device: typeof step.device === 'string' && step.device ? step.device : null,
      commands: step.commands.filter((c) => typeof c === 'string' && c.trim()),
    }))
    .filter((step) => step.commands.length > 0);
}

/** Normalised UI config for one lab entry's data object. */
export function resolveLabUi(lab = {}) {
  const ui = lab?.ui || {};
  const topology = lab?.topology || null;
  const hasTopologyContent = Boolean(topology?.devices?.length);
  const hasPortContent = Boolean(topology?.table?.length);
  const hasConceptContent = Boolean(lab?.concepts?.length);

  const showTopology = ui.showTopology ?? true;
  const showPortMap = ui.showPortMap ?? true;
  const showTerminal = ui.showTerminal ?? true;
  const requiredDevices = Array.isArray(ui.requiredDevices)
    ? ui.requiredDevices.filter(Boolean)
    : [];
  const initialMode = TERMINAL_MODES.includes(ui.initialMode) ? ui.initialMode : 'user';
  const setup = normalizeSetup(ui.setup);

  // A panel only renders when it is enabled in config AND has content.
  const renderTerminal = showTerminal && lab?.objectives?.length > 0;
  const renderTopology = showTopology && hasTopologyContent;
  const renderPortMap = showTopology && showPortMap && hasPortContent;
  const renderConcepts = hasConceptContent;

  const panels = [
    renderTerminal && 'terminal',
    renderTopology && 'topology',
    renderPortMap && 'ports',
    renderConcepts && 'concepts',
  ].filter(Boolean);

  // Focus mode = the simplified terminal-first layout: no tab bar, the
  // terminal and the learning content stack so they use the full width.
  const focus =
    ui.focus === true ||
    (showTerminal && !showTopology && !showPortMap && panels.length <= 2);

  return {
    showTopology,
    showPortMap,
    showTerminal,
    requiredDevices,
    initialMode,
    setup,
    renderTerminal,
    renderTopology,
    renderPortMap,
    renderConcepts,
    panels,
    focus,
    /** Device ids offered as terminal tabs; []/unset = all devices. */
    terminalDevices: requiredDevices.length > 0 ? [...requiredDevices] : [...TERMINAL_DEVICES],
  };
}

/**
 * Narrow a topology to the lesson's required devices (by device `id`),
 * dropping links that touch a removed device. Labs without an explicit
 * device list get the topology back untouched.
 */
export function filterTopology(topology, requiredDevices = []) {
  if (!topology || !Array.isArray(requiredDevices) || requiredDevices.length === 0) {
    return topology;
  }
  const keep = new Set(requiredDevices);
  return {
    ...topology,
    devices: (topology.devices || []).filter((d) => keep.has(d?.id)),
    links: (topology.links || []).filter((l) => keep.has(l?.from) && keep.has(l?.to)),
  };
}
