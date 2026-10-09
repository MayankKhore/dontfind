/**
 * calculators.js — interactive network tools (progressive enhancement).
 *
 * Each tool declares `data-calculator="<name>"` on a container and exposes
 * input hooks via data attributes. Outputs are written into matching
 * `data-<name>-out` slots. Only pages that render a tool load this module.
 */

import {
  isValidIP,
  ipToInt,
  intToIp,
  cidrToMask,
  maskToCidr,
} from '../lib/validation.js';
import { announce } from '../lib/a11y.js';

/** Convert a 32-bit integer to a dotted binary string. */
function toBinary(int) {
  return [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255]
    .map((o) => o.toString(2).padStart(8, '0'))
    .join('.');
}

function setText(root, key, value) {
  root.querySelectorAll(`[data-subnet-out="${key}"]`).forEach((el) => {
    el.textContent = value;
  });
}

function computeSubnet(root) {
  const ipInput = root.querySelector('[data-subnet-ip]');
  const cidrInput = root.querySelector('[data-subnet-cidr]');
  if (!ipInput || !cidrInput) return;

  let ip = ipInput.value.trim();
  let cidr = Number(cidrInput.value);

  // Allow "192.168.1.10/24" typed into the IP field.
  if (ip.includes('/')) {
    const [addr, c] = ip.split('/');
    ip = addr;
    if (!cidr || cidr < 0) cidr = Number(c);
  }

  if (!isValidIP(ip) || !(cidr >= 0 && cidr <= 32)) {
    setText(root, 'network', '—');
    ['broadcast', 'firstHost', 'lastHost', 'hosts', 'mask', 'wildcard', 'binary', 'class', 'range'].forEach(
      (k) => setText(root, k, '—'),
    );
    const err = root.querySelector('[data-subnet-error]');
    if (err) err.hidden = false;
    return;
  }

  const err = root.querySelector('[data-subnet-error]');
  if (err) err.hidden = true;

  const int = ipToInt(ip);
  const mask = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const wildcard = (~mask) >>> 0;
  const network = (int & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const totalHosts = Math.max(0, 2 ** (32 - cidr) - 2);
  const firstHost = cidr >= 31 ? network : (network + 1) >>> 0;
  const lastHost = cidr >= 31 ? broadcast : (broadcast - 1) >>> 0;

  const firstOctet = Number(ip.split('.')[0]);
  const cls =
    firstOctet < 128 ? 'A' : firstOctet < 192 ? 'B' : firstOctet < 224 ? 'C' : firstOctet < 240 ? 'D' : 'E';

  setText(root, 'network', intToIp(network));
  setText(root, 'broadcast', intToIp(broadcast));
  setText(root, 'firstHost', intToIp(firstHost));
  setText(root, 'lastHost', intToIp(lastHost));
  setText(root, 'hosts', totalHosts.toLocaleString());
  setText(root, 'mask', cidrToMask(cidr));
  setText(root, 'wildcard', intToIp(wildcard));
  setText(root, 'binary', toBinary(mask));
  setText(root, 'class', `Class ${cls}`);
  setText(root, 'range', `${intToIp(network)} - ${intToIp(broadcast)}`);

  announce(`Subnet ${intToIp(network)}/${cidr}`);
}

/** Mask <-> CIDR converter. */
function computeMaskConvert(root) {
  const from = root.querySelector('[data-mask-input]');
  const out = root.querySelector('[data-mask-out]');
  if (!from || !out) return;
  const value = from.value.trim();
  let cidr = null;
  if (/^\d{1,2}$/.test(value)) cidr = Number(value);
  else if (isValidIP(value)) cidr = maskToCidr(value);
  out.textContent = cidr === null ? '—' : `/` + cidr;
}

function bind(root) {
  const name = root.getAttribute('data-calculator');
  const run = () => {
    if (name === 'subnet') computeSubnet(root);
    else if (name === 'mask') computeMaskConvert(root);
  };
  root.querySelectorAll('input, select').forEach((el) => {
    el.addEventListener('input', run);
    el.addEventListener('change', run);
  });
  run();
}

function initAll() {
  document.querySelectorAll('[data-calculator]').forEach(bind);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
