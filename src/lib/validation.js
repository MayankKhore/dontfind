/**
 * validation.js — pure validation + IPv4 math helpers.
 *
 * These are shared by the CLI simulation, the subnet calculator and content
 * schema refinement. Keeping them in one module avoids the duplicated
 * validators that previously lived inside the device classes.
 */

/** Valid dotted-quad IPv4 address. */
export function isValidIP(ip) {
  const parts = String(ip).split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    if (p === '' || !/^\d{1,3}$/.test(p)) return false;
    const n = Number(p);
    return n >= 0 && n <= 255 && String(n) === p;
  });
}

/** Valid MAC address (colon or dash separated). */
export function isValidMAC(mac) {
  return /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/.test(String(mac).trim());
}

/** Valid VLAN id (1–4094). */
export function isValidVLAN(id) {
  const n = Number(id);
  return Number.isInteger(n) && n >= 1 && n <= 4094;
}

/** Valid CIDR prefix length (0–32). */
export function isValidCidr(cidr) {
  const n = Number(cidr);
  return Number.isInteger(n) && n >= 0 && n <= 32;
}

/** Convert an IPv4 address to a 32-bit unsigned integer. */
export function ipToInt(ip) {
  if (!isValidIP(ip)) return null;
  return ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

/** Convert a 32-bit unsigned integer back to a dotted-quad string. */
export function intToIp(int) {
  return [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join('.');
}

/** Convert a CIDR prefix (0–32) to a dotted-quad subnet mask. */
export function cidrToMask(cidr) {
  if (!isValidCidr(cidr)) return null;
  const mask = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  return intToIp(mask);
}

/** Convert a subnet mask to its CIDR prefix length, or null if invalid. */
export function maskToCidr(mask) {
  if (!isValidIP(mask)) return null;
  const int = ipToInt(mask);
  // A valid mask is a run of 1s followed by a run of 0s.
  const binary = (int >>> 0).toString(2).padStart(32, '0');
  if (!/^1*0*$/.test(binary)) return null;
  return binary.split('1').length - 1;
}

/** Valid hostname / domain label (simple, permissive). */
export function isValidHostname(value) {
  return /^(?=.{1,253}$)([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
    String(value).trim(),
  );
}

/** Non-empty after trimming. */
export function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
