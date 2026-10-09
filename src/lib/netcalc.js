

/**
 * netcalc.js - the shared calculation engine behind every CCNA Path tool.
 *
 * Pure functions, no DOM and no framework imports, so the identical code runs
 * in the browser (bundled into the tool widgets) and in the Node test suite
 * (scripts/test-netcalc.mjs). One implementation, no drift.
 *
 * Conventions:
 *   - IPv4 addresses are unsigned 32-bit integers. JavaScript bitwise
 *     operators work on signed 32-bit values, so every result is followed by
 *     >>> 0 to keep it unsigned.
 *   - IPv6 addresses are BigInt. 128 bits does not fit in a Number, and
 *     silently wrapping would produce confidently wrong answers.
 *   - Failures throw NetCalcError carrying a message the UI shows verbatim
 *     next to the offending field.
 */

/** A calculation failure the UI can show next to a field. */
export class NetCalcError extends Error {
  constructor(code, message, field) {
    super(message);
    this.name = 'NetCalcError';
    this.code = code;
    this.field = field;
  }
}

/* ------------------------------------------------------------------ *
 * IPv4 primitives
 * ------------------------------------------------------------------ */

const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/** True when the value is a dotted-quad IPv4 address. */
export function isIPv4(value) {
  const m = IPV4_RE.exec(String(value).trim());
  if (!m) return false;
  for (let i = 1; i <= 4; i += 1) {
    // Reject "01" so 010.0.0.1 is never read as octal.
    if (String(Number(m[i])) !== m[i]) return false;
    if (Number(m[i]) > 255) return false;
  }
  return true;
}

/** IPv4 string to unsigned 32-bit integer. Throws on invalid input. */
export function ipv4ToInt(value, field = 'ip') {
  const text = String(value).trim();
  if (!isIPv4(text)) {
    throw new NetCalcError(
      'invalid-ipv4',
      'Enter a valid IPv4 address, for example 192.168.1.10.',
      field,
    );
  }
  return text.split('.').reduce((acc, octet) => ((acc << 8) + Number(octet)) >>> 0, 0);
}

/** Unsigned 32-bit integer to dotted-quad string. */
export function intToIPv4(int) {
  const n = int >>> 0;
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

/** Prefix length (0-32) to unsigned 32-bit mask. */
export function maskFromPrefix(prefix, field = 'prefix') {
  // Accept "/24" as well as 24, so CIDR input needs no pre-stripping.
  const raw = String(prefix).trim().replace(/^\//, '');
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0 || n > 32) {
    throw new NetCalcError(
      'invalid-prefix',
      'The prefix length must be a whole number between 0 and 32.',
      field,
    );
  }
  return n === 0 ? 0 : (0xffffffff << (32 - n)) >>> 0;
}

/** Dotted-quad mask to prefix length. Throws when the mask is not contiguous. */
export function prefixFromMask(mask, field = 'mask') {
  const int = ipv4ToInt(mask, field);
  const bits = (int >>> 0).toString(2).padStart(32, '0');
  // The "1+" is deliberately "+" not "*": 0.0.0.0 (a /0) is a valid mask.
  // Using "1*" would have rejected it as non-contiguous.
  if (!/^1+0*$/.test(bits) && !/^0+$/.test(bits)) {
    throw new NetCalcError(
      'non-contiguous-mask',
      'A subnet mask must be a run of 1s followed by a run of 0s. ' +
        mask +
        ' is not contiguous, so it is not a valid subnet mask.',
      field,
    );
  }
  return bits.indexOf('0') === -1 ? 32 : bits.indexOf('0');
}

/** True when a mask is a valid, contiguous subnet mask. */
export function isContiguousMask(mask) {
  try {
    prefixFromMask(mask);
    return true;
  } catch {
    return false;
  }
}

/** Subnet mask to wildcard mask (the bitwise inverse). */
export function wildcardFromMask(mask) {
  return (~ipv4ToInt(mask)) >>> 0;
}

/** Wildcard mask to subnet mask. */
export function maskFromWildcard(wildcard) {
  return (~ipv4ToInt(wildcard)) >>> 0;
}

/** Format a 32-bit value as binary digits, optionally grouped into octets. */
export function toBinary32(int, grouped = true) {
  const bits = (int >>> 0).toString(2).padStart(32, '0');
  return grouped ? bits.match(/.{8}/g).join('.') : bits;
}

/** RFC 1918 and other special-use ranges. */
export function classifyIPv4(ip) {
  const n = ipv4ToInt(ip);
  const ranges = [
    ['Private (RFC 1918)', '10.0.0.0', '10.255.255.255'],
    ['Private (RFC 1918)', '172.16.0.0', '172.31.255.255'],
    ['Private (RFC 1918)', '192.168.0.0', '192.168.255.255'],
    ['Carrier-grade NAT', '100.64.0.0', '100.127.255.255'],
    ['Link-local', '169.254.0.0', '169.254.255.255'],
    ['Loopback', '127.0.0.0', '127.255.255.255'],
    ['Documentation (TEST-NET-1)', '192.0.2.0', '192.0.2.255'],
    ['Documentation (TEST-NET-2)', '198.51.100.0', '198.51.100.255'],
    ['Documentation (TEST-NET-3)', '203.0.113.0', '203.0.113.255'],
    ['Multicast', '224.0.0.0', '239.255.255.255'],
    ['Reserved', '240.0.0.0', '255.255.255.255'],
  ];
  for (const row of ranges) {
    if (n >= ipv4ToInt(row[1]) && n <= ipv4ToInt(row[2])) return row[0];
  }
  return 'Public (globally routable)';
}

/** Historic classful class, still asked about in the CCNA exam. */
export function classfulClass(ip) {
  const first = Number(String(ip).split('.')[0]);
  if (first < 128) return 'A';
  if (first < 192) return 'B';
  if (first < 224) return 'C';
  if (first < 240) return 'D';
  return 'E';
}

/**
 * Full IPv4 subnet calculation.
 *
 * Edge cases handled explicitly, because they are exactly what the exam tests
 * and exactly what naive calculators get wrong:
 *   /31  RFC 3021 point-to-point links: both addresses usable, no broadcast.
 *   /32  a single host: one usable address, no network or broadcast.
 *   /0   the whole address space; naive usable-host maths would underflow.
 */
export function ipv4Subnet(input) {
  const parsed = parseIPv4Cidr(input, 'ip');
  const ip = parsed.ip;
  const prefix = parsed.prefix;
  const mask = maskFromPrefix(prefix, 'prefix');
  const wildcard = (~mask) >>> 0;

  const network = (ip & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const totalAddresses = prefix === 0 ? 2 ** 32 : 2 ** (32 - prefix);

  let usableHosts;
  let firstHost;
  let lastHost;
  let note;

  if (prefix >= 31) {
    // /31 and /32 reserve no network or broadcast address.
    usableHosts = prefix === 31 ? 2 : 1;
    firstHost = network;
    lastHost = broadcast;
    note =
      prefix === 31
        ? 'A /31 reserves no network or broadcast address, so both addresses are usable (RFC 3021 point-to-point links).'
        : 'A /32 is a single host address. There is no network or broadcast address.';
  } else {
    usableHosts = totalAddresses - 2;
    firstHost = (network + 1) >>> 0;
    lastHost = (broadcast - 1) >>> 0;
    note =
      'The first and last addresses are reserved as the network (subnet) and broadcast address.';
  }

  return {
    input: String(input).trim(),
    notation: parsed.notation,
    address: intToIPv4(ip),
    prefix,
    cidr: `${intToIPv4(network)}/${prefix}`,
    network: intToIPv4(network),
    broadcast: prefix >= 31 ? 'n/a' : intToIPv4(broadcast),
    firstHost: intToIPv4(firstHost),
    lastHost: intToIPv4(lastHost),
    usableHosts,
    totalAddresses,
    hostBits: 32 - prefix,
    mask: intToIPv4(mask),
    wildcard: intToIPv4(wildcard),
    maskBinary: toBinary32(mask, false),
    addressBinary: toBinary32(ip, false),
    networkBinary: toBinary32(network, false),
    classfulClass: classfulClass(intToIPv4(ip)),
    classification: classifyIPv4(intToIPv4(ip)),
    range: `${intToIPv4(network)} - ${intToIPv4(broadcast)}`,
    isPrivate: classifyIPv4(intToIPv4(ip)).startsWith('Private'),
    isUsable: ip !== network && (prefix >= 31 || ip !== broadcast),
    note,
  };
}

/** Parse "192.168.1.0/24", "192.168.1.0 255.255.255.0" or a bare address. */
export function parseIPv4Cidr(input, field = 'ip') {
  const text = String(input).trim();
  if (!text) {
    throw new NetCalcError('empty', 'Enter an IPv4 address or network.', field);
  }

  if (text.includes('/')) {
    const parts = text.split('/');
    return {
      ip: ipv4ToInt(parts[0], field),
      // The prefix length, not the mask it converts to.
      prefix: Number(String(parts[1]).trim().replace(/^\//, '')),
      notation: 'cidr',
    };
  }

  if (text.includes(' ')) {
    const parts = text.split(/\s+/);
    return {
      ip: ipv4ToInt(parts[0], field),
      prefix: prefixFromMask(parts[1], field),
      notation: 'dotted',
    };
  }

  // A bare address: assume a host route (/32) rather than silently guessing.
  return { ip: ipv4ToInt(text, field), prefix: 32, notation: 'host' };
}

/** Each IPv6 group is 1 to 4 hexadecimal digits. */
const IPV6_CHUNK = /^[0-9A-Fa-f]{1,4}$/;

/**
 * Parse any legal IPv6 notation into a BigInt.
 *
 * Handles full form, "::" compression, and the IPv4-mapped form
 * (::ffff:192.0.2.1) found in dual stacks. A zone index (fe80::1%eth0)
 * is accepted and ignored for arithmetic.
 */
export function ipv6ToBigInt(value, field = 'ip') {
  let text = String(value).trim().split('%')[0];

  if (!text) {
    throw new NetCalcError('empty', 'Enter an IPv6 address.', field);
  }

  // An embedded IPv4 tail (::ffff:192.0.2.1) becomes two hex groups.
  const lastColon = text.lastIndexOf(':');
  const tail = text.slice(lastColon + 1);
  if (tail.includes('.')) {
    if (!isIPv4(tail)) {
      throw new NetCalcError('invalid-ipv6', 'The embedded IPv4 address is not valid.', field);
    }
    const n = ipv4ToInt(tail, field);
    // Hex, not decimal: 49152 means nothing as an IPv6 group.
    const high = ((n >>> 16) & 0xffff).toString(16);
    const low = (n & 0xffff).toString(16);
    text = `${text.slice(0, lastColon + 1)}${high}:${low}`;
  }

  const doubleColons = (text.match(/::/g) || []).length;
  if (doubleColons > 1) {
    throw new NetCalcError(
      'invalid-ipv6',
      'An IPv6 address may only use :: once, to compress a run of zero groups.',
      field,
    );
  }

  const [head, tailPart] = doubleColons === 1 ? text.split('::') : [text, null];

  const headGroups = head === '' ? [] : head.split(':').filter(Boolean);
  const tailGroups = tailPart === null ? [] : tailPart === '' ? [] : tailPart.split(':');

  for (const group of [...headGroups, ...tailGroups]) {
    if (!IPV6_CHUNK.test(group)) {
      throw new NetCalcError(
        'invalid-ipv6',
        '"' + group + '" is not a valid IPv6 group. Each group is 1-4 hexadecimal digits.',
        field,
      );
    }
  }

  let groups;
  if (tailPart === null) {
    if (headGroups.length !== 8) {
      throw new NetCalcError(
        'invalid-ipv6',
        `An IPv6 address needs exactly 8 groups, but this one has ${headGroups.length}. Use :: to compress the zeros.`,
        field,
      );
    }
    groups = headGroups;
  } else {
    const missing = 8 - headGroups.length - tailGroups.length;
    if (missing < 1) {
      throw new NetCalcError(
        'invalid-ipv6',
        'This address has more than 8 groups once :: is expanded.',
        field,
      );
    }
    groups = [...headGroups, ...Array(missing).fill('0'), ...tailGroups];
  }

  return groups.reduce((acc, group) => (acc << 16n) + BigInt(`0x${group}`), 0n);
}

/** True when the value parses as IPv6. */
export function isIPv6(value) {
  try {
    ipv6ToBigInt(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * BigInt to RFC 5952 canonical text.
 *
 * RFC 5952 requires lowercase hex, no leading zeros, the longest run of two
 * or more zero groups replaced by ::, and the leftmost run winning on ties.
 * Emitting one consistent form is what makes two spellings of the same
 * address compare equal.
 */
export function bigIntToIPv6(value) {
  const groups = [];
  for (let shift = 112n; shift >= 0n; shift -= 16n) {
    groups.push(Number((value >> shift) & 0xffffn));
  }

  let bestStart = -1;
  let bestLength = 0;
  let runStart = -1;
  let runLength = 0;

  groups.forEach((group, i) => {
    if (group === 0) {
      if (runStart === -1) runStart = i;
      runLength += 1;
      if (runLength > bestLength) {
        bestLength = runLength;
        bestStart = runStart;
      }
    } else {
      runStart = -1;
      runLength = 0;
    }
  });

  const hex = groups.map((g) => g.toString(16));
  if (bestLength < 2) return hex.join(':');

  return `${hex.slice(0, bestStart).join(':')}::${hex.slice(bestStart + bestLength).join(':')}`;
}

/** IPv6 prefix -> 128-bit network mask as a BigInt. */
export function ipv6MaskFromPrefix(prefix, field = 'prefix') {
  const n = Number(prefix);
  if (!Number.isInteger(n) || n < 0 || n > 128) {
    throw new NetCalcError(
      'invalid-prefix',
      'An IPv6 prefix length must be a whole number between 0 and 128.',
      field,
    );
  }
  if (n === 0) return 0n;
  const allOnes = (1n << 128n) - 1n;
  return (allOnes << BigInt(128 - n)) & allOnes;
}

/**
 * Render a BigInt count readably.
 *
 * Below 10^15 the exact number is safe to print; above that, scientific
 * notation communicates the scale better than 39 digits.
 */
export function formatBigCount(value) {
  const n = BigInt(value);
  if (n <= 1000000000000000n) return n.toLocaleString('en-US');
  // BigInt has no toExponential, so format from the digit string.
  const digits = n.toString();
  const exponent = digits.length - 1;
  const mantissa = `${digits[0]}.${digits.slice(1, 4)}`;
  return `${mantissa} x 10^${exponent}`;
}

/**
 * IPv6 subnet calculation.
 *
 * The host model differs completely from IPv4: there is no broadcast
 * address, and the subnet-router anycast address is the all-zeros host, so a
 * /64 has 2^64 - 1 usable addresses rather than 2^64 - 2.
 */
export function ipv6Subnet(address, prefixInput) {
  const addressBig = ipv6ToBigInt(address, 'ip');
  const prefix = Number(prefixInput);
  const mask = ipv6MaskFromPrefix(prefix, 'prefix');

  const network = addressBig & mask;
  const hostBits = 128 - prefix;

  const allOnes = (1n << 128n) - 1n;
  const blockSize = 1n << BigInt(hostBits);
  const end = network | (~mask & allOnes);

  const firstHost = hostBits === 0 ? network : network + 1n;
  const lastHost = hostBits === 0 ? network : end - 1n;
  const usableHosts = hostBits === 0 ? 1n : blockSize - 1n;

  return {
    input: `${String(address).trim()}/${prefix}`,
    address: bigIntToIPv6(addressBig),
    prefix,
    hostBits,
    cidr: `${bigIntToIPv6(network)}/${prefix}`,
    network: bigIntToIPv6(network),
    firstHost: bigIntToIPv6(firstHost),
    lastHost: bigIntToIPv6(lastHost),
    broadcast: 'n/a',
    usableHosts: formatBigCount(usableHosts),
    totalAddresses: formatBigCount(blockSize),
    // RFC 4291 hands a single /64 to each subscriber.
    recommendedPrefix: 64,
    note:
      'IPv6 has no broadcast address. The subnet-router anycast address (all zeros in the host part) is reserved, so usable addresses are 2^hostbits - 1.',
  };
}

/* ================================================================== *
 * VLSM planning
 * ================================================================== */

/**
 * Longest prefix (smallest block) that can hold `hosts` usable addresses.
 *
 * A /31 holds 2 usable hosts (RFC 3021 point-to-point links) and a /32 holds
 * 1, because neither reserves a network or broadcast address. That is why the
 * search stops at /31 rather than /30: a planner that reserved /31 would
 * refuse to place two hosts on a router-to-router link.
 */
export function prefixForHosts(hosts, field = 'hosts') {
  const n = Number(hosts);
  if (!Number.isInteger(n) || n < 1) {
    throw new NetCalcError(
      'invalid-hosts',
      'Each subnet needs at least one usable host. Enter a whole number of 1 or more.',
      field,
    );
  }

  // Usable addresses per prefix: 1 host at /32, 2 at /31, then 2^(32-p) - 2.
  const usableAt = (prefix) => {
    if (prefix >= 31) return 2 ** (32 - prefix);
    return 2 ** (32 - prefix) - 2;
  };

  for (let prefix = 32; prefix >= 0; prefix -= 1) {
    if (usableAt(prefix) >= n) return prefix;
  }
  return 0;
}

/**
 * Variable Length Subnet Masking planner.
 *
 * Fixed-length subnetting wastes space whenever requirements differ. VLSM
 * allocates largest-first from one pool, which is what makes the result fit
 * without overlap.
 */
export function planVlsm(poolCidr, requirements) {
  const pool = parseIPv4Cidr(poolCidr, 'pool');
  const poolMask = maskFromPrefix(pool.prefix, 'pool');
  const poolNetwork = (pool.ip & poolMask) >>> 0;
  const poolSize = pool.prefix === 0 ? 2 ** 32 : 2 ** (32 - pool.prefix);
  const poolEnd = (poolNetwork + poolSize - 1) >>> 0;

  if (!requirements.length) {
    throw new NetCalcError(
      'no-requirements',
      'Add at least one subnet, one per line, as "name, host count".',
      'requirements',
    );
  }

  const sized = requirements.map((req, i) => ({
    index: i,
    name: req.name,
    hosts: Number(req.hosts),
    prefix: prefixForHosts(req.hosts, 'requirements'),
  }));

  // Largest first: that ordering is what guarantees the pack fits.
  const sorted = [...sized].sort((a, b) => a.prefix - b.prefix);

  let cursor = poolNetwork;
  let overflow = null;

  const allocations = sorted.map((req) => {
    const size = 2 ** (32 - req.prefix);
    // start is aligned by the AND, and the size arithmetic can exceed 2^31,
    // so both additions are forced back into unsigned range with >>> 0.
    const start = (cursor + (size - 1)) & ~(size - 1) >>> 0;
    const end = (start + size - 1) >>> 0;
    cursor = (start + size) >>> 0;

    // /31 and /32 reserve no network or broadcast address, so they are not
    // reduced by 2. This must match prefixForHosts() or a /31 would be
    // reported as holding 0 usable hosts.
    const usable = req.prefix >= 31 ? size : size - 2;

    // Compare addresses numerically, not as strings.
    if (end > poolEnd && !overflow) {
      overflow =
        `"${req.name}" needs ${size.toLocaleString()} addresses but ${intToIPv4(poolNetwork)}/${pool.prefix} has run out of space. ` +
        'Reduce a requirement, or start from a larger pool.';
    }

    return {
      ...req,
      size,
      usable,
      wasted: usable - req.hosts,
      start: intToIPv4(start),
      end: intToIPv4(end),
      cidr: `${intToIPv4(start)}/${req.prefix}`,
      mask: intToIPv4(maskFromPrefix(req.prefix)),
      fits: usable >= req.hosts,
    };
  });

  const used = allocations.reduce((sum, a) => sum + a.size, 0);
  const wasted = allocations.reduce((sum, a) => sum + Math.max(0, a.wasted), 0);

  return {
    pool: `${intToIPv4(poolNetwork)}/${pool.prefix}`,
    poolSize,
    allocations,
    overflow,
    used,
    efficiency: poolSize === 0 ? 0 : Math.round((used / poolSize) * 100),
    wasted,
    totalHosts: allocations.reduce((sum, a) => sum + a.hosts, 0),
    totalUsable: allocations.reduce((sum, a) => sum + a.usable, 0),
    note:
      'Subnets are allocated largest-first. That ordering is what guarantees the plan fits without overlap.',
  };
}

/* ================================================================== *
 * Address range <-> CIDR
 * ================================================================== */

/**
 * Convert a start/end address range into the smallest set of CIDR blocks
 * covering exactly that range.
 *
 * The inverse of subnetting: given a span of addresses handed to you by a
 * provider or a firewall policy, work out which prefixes it comprises.
 */
export function rangeToCidrs(startInput, endInput) {
  const start = ipv4ToInt(startInput, 'start');
  const end = ipv4ToInt(endInput, 'end');

  if (end < start) {
    throw new NetCalcError(
      'invalid-range',
      'The end address must be the same as or higher than the start address.',
      'end',
    );
  }

  const blocks = [];
  let current = start;

  // Guard the loop: a bug here would otherwise spin until the heap dies.
  const maxIterations = 64;

  for (let guard = 0; guard < maxIterations && current <= end; guard += 1) {
    // Find the largest block (longest prefix) that is aligned at `current`
    // and still ends inside the range. Each candidate is tested before it is
    // accepted, otherwise the loop overshoots by one prefix.
    let prefix = 32;
    while (prefix > 0) {
      const biggerSize = 2 ** (32 - (prefix - 1));
      // Divide rather than mask: current + size - 1 can exceed 2^32 and wrap,
      // and the wrapped value would look aligned when it is not.
      const remainder = current % biggerSize;
      if (remainder !== 0) break;
      const last = current + biggerSize - 1;
      if (last > 0xffffffff || last > end) break;
      prefix -= 1;
    }

    const size = 2 ** (32 - prefix);
    blocks.push({
      cidr: `${intToIPv4(current)}/${prefix}`,
      network: intToIPv4(current),
      prefix,
      size,
      last: intToIPv4((current + size - 1) >>> 0),
    });

    current = current + size;
    // 2^32 addresses do not fit in a Number-safe 32-bit int: when the range
    // reaches 255.255.255.255 the next value is 2^32, which must end the loop
    // rather than wrap back to 0 and re-emit blocks forever.
    if (current > 0xffffffff) break;
  }

  return {
    start: intToIPv4(start),
    end: intToIPv4(end),
    total: end - start + 1,
    blocks,
    blockCount: blocks.length,
    note:
      blocks.length === 1
        ? 'This range is exactly one CIDR block.'
        : `This range needs ${blocks.length} CIDR blocks to cover it exactly.`,
  };
}

/**
 * Summarise a set of networks into the smallest covering aggregate.
 *
 * Route summarisation has a strict rule: every address covered by the
 * aggregate must belong to one of the input networks, or the router
 * advertises reachability it does not have.
 */
export function supernet(networksInput) {
  const networks = String(networksInput)
    .split(/[\s,]+/)
    .map((n) => n.trim())
    .filter(Boolean);

  if (!networks.length) {
    throw new NetCalcError(
      'empty',
      'Enter at least one network, for example 192.168.1.0/24.',
      'networks',
    );
  }

  const parsed = networks.map((entry, i) => {
    const { ip, prefix } = parseIPv4Cidr(entry, 'networks');
    const mask = maskFromPrefix(prefix, 'networks');
    return { input: entry, index: i, prefix, mask, network: (ip & mask) >>> 0 };
  });

  const min = Math.min(...parsed.map((p) => p.network));
  // Number arithmetic throughout. "(~p.mask) >>> 0" is correct but obscure, and
  // mixing it with the plain-Number comparisons below invites wraparound bugs,
  // so the last address is computed as network + size - 1.
  const max = Math.max(...parsed.map((p) => p.network + 2 ** (32 - p.prefix) - 1));

  // Find the *longest* prefix (narrowest block) that covers the whole span.
  //
  // Iterate from the narrowest candidate upward and stop at the first that
  // works. Iterating from /0 downward would always match immediately, since
  // the entire address space trivially covers everything.
  //
  // Arithmetic stays in ordinary Numbers: a /0 block is 2^32 addresses, which
  // wraps to a small number under >>> 0 and would corrupt the comparisons.
  let prefix = 32;
  for (let candidate = 32; candidate >= 0; candidate -= 1) {
    const size = 2 ** (32 - candidate);
    // Round `min` down to the candidate block boundary.
    const start = min - (min % size);
    const last = start + size - 1;
    if (start <= min && last >= max) {
      prefix = candidate;
      break;
    }
  }

  const mask = maskFromPrefix(prefix, 'networks');
  const aggregateNetwork = (min & mask) >>> 0;
  const aggregateSize = 2 ** (32 - prefix);
  const aggregateEnd = aggregateNetwork + aggregateSize - 1;

  /**
   * Whether the aggregate is safe to advertise: every address it covers must
   * belong to one of the input networks.
   *
   * Comparing total sizes is not enough. Two /25s and a /24 have identical
   * size totals, yet the /25s leave a hole in the middle - and that hole is
   * exactly the reachability a router would wrongly claim. The inputs are
   * therefore walked in order and each must begin precisely where the
   * previous one ended.
   *
   * Number arithmetic throughout: at /0 a bitwise loop would wrap and spin.
   */
  const sorted = [...parsed].sort((a, b) => a.network - b.network);
  const coveredSize = sorted.reduce((sum, p) => sum + 2 ** (32 - p.prefix), 0);

  let isSafe = true;
  let cursor = aggregateNetwork;
  const missing = [];

  for (const p of sorted) {
    if (p.network > cursor) {
      // A hole between the previous network and this one.
      missing.push(intToIPv4(cursor));
      if (missing.length >= 50) {
        isSafe = false;
        break;
      }
    }
    const lastOf = p.network + 2 ** (32 - p.prefix) - 1;
    cursor = Math.max(cursor, lastOf + 1);
  }

  // A tail gap after the final network is just as unsafe as a hole.
  if (cursor <= aggregateEnd && missing.length < 50) missing.push(intToIPv4(cursor));
  if (missing.length) isSafe = false;

  return {
    aggregate: `${intToIPv4(aggregateNetwork)}/${prefix}`,
    prefix,
    mask: intToIPv4(mask),
    wildcard: intToIPv4((~mask) >>> 0),
    range: `${intToIPv4(aggregateNetwork)} - ${intToIPv4(aggregateEnd)}`,
    inputs: parsed.map((p) => `${intToIPv4(p.network)}/${p.prefix}`),
    inputCount: parsed.length,
    saved: parsed.length - 1,
    // A summary that swallows extra space is unsafe; say so loudly.
    isSafe,
    extraAddresses: Math.max(0, aggregateSize - coveredSize),
    extraNetworks: missing,
    note:
      missing.length === 0
        ? 'This summary covers exactly the networks you entered, so it is safe to advertise.'
        : `This summary also covers ${missing.length} network(s) you did not list, starting at ${missing[0]}. A router would advertise reachability it does not have - include the missing networks or use a longer prefix.`,
  };
}

/* ================================================================== *
 * Masks and wildcards
 * ================================================================== */

/**
 * Convert any accepted notation into every other notation.
 *
 * Accepts a dotted-quad mask, a wildcard or a prefix, so the same engine
 * serves the mask, wildcard and CIDR tools.
 */
export function maskDetails(input) {
  const text = String(input).trim();

  let prefix;
  let source;

  if (text.includes('/')) {
    // The prefix length, not the mask maskFromPrefix would return.
    prefix = Number(String(text.split('/')[1]).trim());
    source = 'CIDR prefix';
  } else if (/^\d{1,2}$/.test(text)) {
    prefix = Number(text);
    source = 'CIDR prefix';
  } else {
    prefix = prefixFromMask(text, 'input');
    source = 'dotted-decimal mask';
  }

  const mask = maskFromPrefix(prefix);
  const wildcard = (~mask) >>> 0;
  const hostBits = 32 - prefix;

  return {
    input: text,
    prefix,
    source,
    mask: intToIPv4(mask),
    wildcard: intToIPv4(wildcard),
    maskBinary: toBinary32(mask, false),
    wildcardBinary: toBinary32(wildcard, false),
    contiguous: isContiguousMask(intToIPv4(mask)),
    blockSize: 2 ** hostBits,
    usableHosts: prefix >= 31 ? 2 ** hostBits : 2 ** hostBits - 2,
    bits: `${prefix} network bits, ${hostBits} host bits`,
    example:
      prefix >= 31
        ? `A /${prefix} has no reserved network or broadcast address, so all ${2 ** hostBits} addresses are usable.`
        : `A /${prefix} reserves the network and broadcast address, leaving ${(2 ** hostBits - 2).toLocaleString()} usable hosts.`,
  };
}

/* ================================================================== *
 * MAC addresses
 * ================================================================== */

const MAC_STYLES = {
  colon: { separator: ':', label: 'Colon' },
  dash: { separator: '-', label: 'Hyphen' },
  cisco: { separator: '.', label: 'Cisco' },
  plain: { separator: '', label: 'Plain' },
};

/** Accepts colon, hyphen, dot and bare notation. Returns 6 hex pairs. */
export function normalizeMac(value, field = 'mac') {
  const text = String(value).trim().toLowerCase();
  if (!/^([0-9a-f]{2}[:-]){5}[0-9a-f]{2}$/.test(text) && !/^[0-9a-f]{12}$/.test(text)) {
    if (/^([0-9a-f]{4}\.){2}[0-9a-f]{4}$/.test(text)) {
      return text.replace(/\./g, '').match(/.{2}/g);
    }
    throw new NetCalcError(
      'invalid-mac',
      'Enter a 48-bit MAC address, for example 00:1A:2B:3C:4D:5E or 001a.2b3c.4d5e.',
      field,
    );
  }
  // A dash inside a character class must come first, otherwise ":-." is read
  // as a range from ":" (0x3A) to "." (0x2E), which is back to front.
  return text.replace(/[-:.]/g, '').match(/.{2}/g);
}

/**
 * Render a MAC in the requested notation.
 *
 * Cisco notation is three groups of four hex digits (aabb.ccdd.eeff), not
 * three groups of two pairs - a common mistake when transcribing configs.
 */
export function formatMac(value, style = 'colon') {
  const pairs = normalizeMac(value);
  if (!MAC_STYLES[style]) {
    throw new NetCalcError('invalid-style', 'Unknown MAC notation.', 'style');
  }
  if (style === 'cisco') {
    const hex = pairs.join('');
    return `${hex.slice(0, 4)}.${hex.slice(4, 8)}.${hex.slice(8, 12)}`;
  }
  if (style === 'plain') return pairs.join('');
  return pairs.join(MAC_STYLES[style].separator);
}

/** Describe a MAC address: notation, broadcast flag and the OUI. */
export function macInfo(value) {
  const pairs = normalizeMac(value);
  const hex = pairs.join('');
  const firstOctet = parseInt(pairs[0], 16);

  // The I/G bit (low bit of the first octet) separates unicast from group
  // addresses. This single bit is a favourite exam question.
  const isMulticast = (firstOctet & 1) === 1;
  const isLocallyAdministered = (firstOctet & 2) === 2;

  return {
    mac: formatMac(value, 'colon'),
    cisco: formatMac(value, 'cisco'),
    dash: formatMac(value, 'dash'),
    plain: formatMac(value, 'plain'),
    hex,
    binary: hex.split('').map((c) => parseInt(c, 16).toString(2).padStart(4, '0')).join(' '),
    oui: pairs.slice(0, 3).join(':').toUpperCase(),
    eui48: formatMac(value, 'cisco'),
    type: isMulticast ? 'Multicast / broadcast' : 'Unicast',
    assignment: isLocallyAdministered
      ? 'Locally administered (assigned on the local network)'
      : 'Universally administered (assigned by the manufacturer)',
    broadcast: isMulticast ? 'Yes' : 'No',
    note: isMulticast
      ? 'The I/G bit is 1, so this is a group address. Hosts use these for multicast and broadcast traffic; unicast traffic needs a unicast address.'
      : 'The I/G bit is 0, so this is a unicast address, the normal form for a device interface.',
  };
}

/* ================================================================== *
 * MTU, MSS and bandwidth
 * ================================================================== */
/* ================================================================== *
 * MTU, MSS and bandwidth
 * ================================================================== */

/** Encapsulation overhead per link type, in bytes. */
export const MTU_PRESETS = {
  ethernet: { label: 'Ethernet', overhead: 0, note: '1500 bytes of payload plus a 14-byte header and 4-byte trailer.' },
  ppp: { label: 'PPP', overhead: 2, note: 'Adds a 2-byte PPP header.' },
  vlan: { label: '802.1Q VLAN', overhead: 4, note: 'Adds a 4-byte 802.1Q VLAN tag.' },
  pppoe: { label: 'PPPoE', overhead: 8, note: 'Adds a 6-byte PPPoE header plus 2 bytes at the link layer.' },
  gre: { label: 'GRE', overhead: 24, note: 'Adds a 24-byte GRE header.' },
  vxlan: { label: 'VXLAN', overhead: 50, note: 'Wraps the inner frame in a UDP, IP and Ethernet envelope.' },
  ipsec: { label: 'IPsec tunnel', overhead: 38, note: 'Typical ESP overhead without NAT traversal.' },
  tunnels: { label: 'PPPoE + VLAN + IPsec', overhead: 46, note: 'A realistic double-NAT VPN path, the usual cause of black-hole MTU problems.' },
};

/**
 * MTU and TCP MSS.
 *
 * MSS is the largest TCP segment that still fits the path MTU once the IP and
 * TCP headers are removed. When the two ends advertise different values the
 * smaller one wins, which is how Path MTU Discovery faults usually surface.
 */
export function mtuDetails(mtuInput, preset = 'ethernet') {
  const mtu = Number(mtuInput);
  if (!Number.isInteger(mtu) || mtu < 68 || mtu > 9216) {
    throw new NetCalcError(
      'invalid-mtu',
      'An MTU must be a whole number between 68 and 9216 bytes. 1500 is the Ethernet default.',
      'mtu',
    );
  }

  const config = MTU_PRESETS[preset];
  if (!config) throw new NetCalcError('invalid-preset', 'Unknown link type.', 'preset');

  const pathMtu = mtu - config.overhead;
  if (pathMtu < 68) {
    throw new NetCalcError(
      'mtu-too-small',
      `A ${mtu}-byte MTU leaves ${pathMtu} bytes after ${config.label} overhead, below the 68-byte IPv4 minimum.`,
      'mtu',
    );
  }

  const mss = pathMtu - 20 - 20; // IPv4 header + TCP header

  return {
    mtu,
    linkType: config.label,
    overhead: config.overhead,
    note: config.note,
    pathMtu,
    mss,
    mssWithOptions: mss - 12, // 12 bytes of TCP timestamps
    fragmentationRisk:
      mss + 40 + config.overhead > mtu
        ? `A full ${mtu}-byte segment (${mss + 40} bytes of headers and payload) does not fit inside a ${mtu}-byte MTU, so it must be fragmented.`
        : 'A full-sized segment fits inside this MTU, so no fragmentation is needed on the direct path.',
    hint:
      mtu >= 1500
        ? 'If a tunnel lowers the effective MTU below 1500 without Path MTU Discovery, TCP stalls on large segments. Compare the tunnel MTU against the MSS advertised by the far end.'
        : 'A reduced MTU is normal behind VPNs and PPPoE. Check that ICMP "fragmentation needed" messages are not being filtered.',
  };
}

/** Parse "1 Gb/s", "500M", "250" (assumed Mb/s) into bits per second. */
export function parseBandwidth(value, field = 'bandwidth') {
  const text = String(value).trim().toLowerCase();
  const m = text.match(/^(\d+(?:\.\d+)?)\s*([kmg]?)b?(?:it)?(?:\/s|ps)?$/);
  if (!m) {
    throw new NetCalcError(
      'invalid-bandwidth',
      'Enter a throughput such as 100M, 1G or 250 (Mb/s).',
      field,
    );
  }
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n) || n < 0) {
    throw new NetCalcError('invalid-bandwidth', 'Enter a throughput of zero or more.', field);
  }
  return n * ({ '': 1e6, k: 1e3, m: 1e6, g: 1e9 }[m[2]] ?? 1e6);
}

/** Parse "500 MB", "2 GB", "1024" (assumed MB) into bytes. */
export function parseSize(value, field = 'size') {
  const text = String(value).trim().toLowerCase();
  const m = text.match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb|tb|kib|mib|gib|tib)?b?$/);
  if (!m) {
    throw new NetCalcError('invalid-size', 'Enter a size such as 500MB, 2GB or 1024.', field);
  }
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n) || n < 0) {
    throw new NetCalcError('invalid-size', 'Enter a size of zero or more.', field);
  }
  const binary = /i[bB]$/.test(text);
  const unit = (m[2] || 'mb').replace('i', '').toLowerCase();
  const base = binary ? 1024 : 1000;
  return n * { b: 1, kb: base, mb: base ** 2, gb: base ** 3, tb: base ** 4 }[unit];
}

/**
 * Transfer time, and the Mb/s vs MB/s trap.
 *
 * Network gear is quoted in megabits per second while file sizes are quoted
 * in megabytes. Dividing a GB file by a Mb/s line rate is the most common
 * bandwidth miscalculation there is, so both figures are always shown.
 */
export function transferDetails(bandwidthInput, sizeInput, efficiencyInput) {
  const bitsPerSecond = parseBandwidth(bandwidthInput, 'bandwidth');
  const bytes = parseSize(sizeInput, 'size');
  const efficiency = Number(efficiencyInput);

  if (!Number.isFinite(efficiency) || efficiency <= 0 || efficiency > 100) {
    throw new NetCalcError(
      'invalid-efficiency',
      'Link efficiency must be a percentage between 1 and 100.',
      'efficiency',
    );
  }
  if (bitsPerSecond === 0) {
    throw new NetCalcError(
      'zero-bandwidth',
      'A throughput of zero cannot transfer anything. Enter a real line rate.',
      'bandwidth',
    );
  }

  const usable = (bitsPerSecond * efficiency) / 100;
  const seconds = (bytes * 8) / usable;
  const minutes = Math.floor(seconds / 60);
  const mbps = bitsPerSecond / 1e6;
  const mbytesPerSecond = usable / 8 / 1e6;

  return {
    bandwidth: formatBandwidth(bitsPerSecond),
    bitsPerSecond,
    size: formatSize(bytes),
    bytes,
    efficiency,
    usableThroughput: formatBandwidth(usable),
    seconds: Math.round(seconds * 100) / 100,
    time: minutes > 0 ? `${minutes} min ${Math.round(seconds % 60)} s` : `${Math.round(seconds)} s`,
    mbps,
    mbytesPerSecond,
    note:
      `Line speed is in megabits per second (Mb/s) but files are measured in megabytes (MB). ` +
      `One MB is 8 million bits, so a ${mbps} Mb/s link moves about ${mbytesPerSecond.toFixed(1)} MB of file data per second at full efficiency.`,
  };
}

/** Human bandwidth, e.g. 1000000000 -> "1 Gb/s". */
export function formatBandwidth(bitsPerSecond) {
  const n = Number(bitsPerSecond);
  if (n >= 1e9) return `${+(n / 1e9).toFixed(2)} Gb/s`;
  if (n >= 1e6) return `${+(n / 1e6).toFixed(2)} Mb/s`;
  if (n >= 1e3) return `${+(n / 1e3).toFixed(2)} Kb/s`;
  return `${Math.round(n)} b/s`;
}

/** Human size, e.g. 2000000000 -> "2 GB". */
export function formatSize(bytes) {
  const n = Number(bytes);
  if (n >= 1e12) return `${+(n / 1e12).toFixed(2)} TB`;
  if (n >= 1e9) return `${+(n / 1e9).toFixed(2)} GB`;
  if (n >= 1e6) return `${+(n / 1e6).toFixed(2)} MB`;
  if (n >= 1e3) return `${+(n / 1e3).toFixed(2)} KB`;
  return `${Math.round(n)} B`;
}
