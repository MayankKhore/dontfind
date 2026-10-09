/**
 * topology.js — inspector behaviour for Topology.astro.
 *
 * The diagram is fully rendered server-side; this only wires selection.
 * Every node is a real focusable control, so click, Enter and Space all
 * work, and links incident to the selected device are highlighted.
 */

const TYPE_LABELS = {
  switch: 'Layer 2 switch',
  router: 'Layer 3 router',
  pc: 'End host',
  server: 'Server',
  cloud: 'Cloud / WAN',
};

function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}

function parseDevices(root) {
  try {
    const parsed = JSON.parse(root.getAttribute('data-devices') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function select(root, node, devices) {
  const id = node.dataset.node;
  const device = devices.find((d) => d.id === id);
  const detail = root.querySelector('[data-topology-detail]');

  root.querySelectorAll('[data-node]').forEach((el) => {
    el.setAttribute('aria-pressed', String(el === node));
  });

  root.querySelectorAll('[data-link-from]').forEach((link) => {
    const related = link.dataset.linkFrom === id || link.dataset.linkTo === id;
    link.dataset.active = String(related);
  });

  if (!detail) return;
  if (!device) {
    detail.innerHTML =
      '<p class="topology__detail-name">No device selected</p><p class="u-dim">Choose a node in the diagram to see its role and addressing.</p>';
    return;
  }

  const links = (device.links || []).filter(Boolean);
  detail.innerHTML = `
    <p class="topology__detail-name">${escapeHtml(device.label)}</p>
    <dl>
      <dt>Role</dt><dd>${escapeHtml(TYPE_LABELS[device.type] || device.type || 'Device')}</dd>
      ${device.model ? `<dt>Model</dt><dd>${escapeHtml(device.model)}</dd>` : ''}
      ${device.ip ? `<dt>Address</dt><dd>${escapeHtml(device.ip)}</dd>` : ''}
      ${links.length ? `<dt>Links</dt><dd>${escapeHtml(links.join(', '))}</dd>` : ''}
    </dl>`;
}

function init(root) {
  if (root.dataset.topologyReady === 'true') return;
  root.dataset.topologyReady = 'true';

  const devices = parseDevices(root);
  const nodes = Array.from(root.querySelectorAll('[data-node]'));
  if (!nodes.length) return;

  nodes.forEach((node) => {
    node.addEventListener('click', () => select(root, node, devices));
    node.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        select(root, node, devices);
      }
    });
  });
}

function initAll() {
  document.querySelectorAll('[data-topology]').forEach(init);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}