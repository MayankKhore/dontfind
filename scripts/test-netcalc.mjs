/**
 * test-netcalc.mjs — accuracy tests for the shared calculation engine.
 *
 * These cover the cases that are easy to get wrong and expensive to get
 * wrong on the exam: /31 and /32 host arithmetic, non-contiguous masks,
 * IPv6 :: compression, unsigned 32-bit overflow, and VLSM ordering.
 *
 * Run with: npm run test:net
 */
import * as n from '../src/lib/netcalc.js';

let passed = 0;
let failed = 0;
const failures = [];

/**
 * Run one assertion.
 *
 * Accepts either a value or a zero-argument function, so a call that throws
 * is reported as a failure rather than aborting the whole run.
 */
function check(label, actual, expected) {
  let got;
  try {
    got = typeof actual === 'function' ? actual() : actual;
  } catch (error) {
    failed += 1;
    failures.push(`${label}: threw ${error.message}`);
    console.log(`  ERROR ${label}: ${error.message}`);
    return;
  }

  const a = JSON.stringify(got);
  const b = JSON.stringify(expected);
  if (a === b) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    failures.push(`${label}\n      got  ${a}\n      want ${b}`);
    console.log(`  FAIL  ${label}`);
  }
}

/** Assert that fn() throws a NetCalcError carrying the expected code. */
function throwsCode(label, fn, code) {
  let thrown;
  try {
    fn();
  } catch (error) {
    thrown = error;
  }
  check(label, thrown ? thrown.code || thrown.message : 'no error thrown', code);
}

console.log('\nIPv4 parsing');
check('accepts 0.0.0.0', () => n.isIPv4('0.0.0.0'), true);
check('accepts 255.255.255.255', () => n.isIPv4('255.255.255.255'), true);
check('rejects leading zeros', () => n.isIPv4('010.0.0.1'), false);
check('rejects 256', () => n.isIPv4('192.168.1.256'), false);
check('rejects three octets', () => n.isIPv4('192.168.1'), false);
check('round-trips an address', () => n.intToIPv4(n.ipv4ToInt('172.16.254.1')), '172.16.254.1');
throwsCode('rejects a hostname', () => n.ipv4ToInt('router.local'), 'invalid-ipv4');

console.log('\nSubnet masks');
check('/0 mask', () => n.intToIPv4(n.maskFromPrefix(0)), '0.0.0.0');
check('/24 mask', () => n.intToIPv4(n.maskFromPrefix(24)), '255.255.255.0');
check('/32 mask', () => n.intToIPv4(n.maskFromPrefix(32)), '255.255.255.255');
check('255.255.255.0 -> 24', () => n.prefixFromMask('255.255.255.0'), 24);
check('0.0.0.0 -> 0', () => n.prefixFromMask('0.0.0.0'), 0);
check('255.255.255.255 -> 32', () => n.prefixFromMask('255.255.255.255'), 32);
check('wildcard is the inverse', () => n.intToIPv4(n.wildcardFromMask('255.255.240.0')), '0.0.15.255');
check('mask from wildcard', () => n.intToIPv4(n.maskFromWildcard('0.0.15.255')), '255.255.240.0');
// 255.0.255.0 has a zero run followed by a one run: not a subnet mask.
throwsCode('rejects non-contiguous mask', () => n.prefixFromMask('255.0.255.0'), 'non-contiguous-mask');
throwsCode('rejects prefix 33', () => n.maskFromPrefix(33), 'invalid-prefix');
throwsCode('rejects a fractional prefix', () => n.maskFromPrefix(24.5), 'invalid-prefix');

console.log('\nIPv4 subnetting');
check('/24 network', () => n.ipv4Subnet('192.168.1.10/24').network, '192.168.1.0');
check('/24 broadcast', () => n.ipv4Subnet('192.168.1.10/24').broadcast, '192.168.1.255');
check('/24 usable hosts', () => n.ipv4Subnet('192.168.1.10/24').usableHosts, 254);
check('/24 wildcard', () => n.ipv4Subnet('192.168.1.10/24').wildcard, '0.0.0.255');
check('/24 first host', () => n.ipv4Subnet('192.168.1.10/24').firstHost, '192.168.1.1');
check('/24 last host', () => n.ipv4Subnet('192.168.1.10/24').lastHost, '192.168.1.254');
check('/30 usable hosts', () => n.ipv4Subnet('192.168.1.0/30').usableHosts, 2);
check('/30 hosts', () => [n.ipv4Subnet('192.168.1.0/30').firstHost, n.ipv4Subnet('192.168.1.0/30').lastHost], ['192.168.1.1', '192.168.1.2']);
// RFC 3021: a /31 has no reserved addresses, so both are usable.
check('/31 usable hosts', () => n.ipv4Subnet('10.0.0.0/31').usableHosts, 2);
check('/31 has no broadcast', () => n.ipv4Subnet('10.0.0.0/31').broadcast, 'n/a');
check('/32 usable hosts', () => n.ipv4Subnet('8.8.8.8/32').usableHosts, 1);
check('/32 network is the host', () => n.ipv4Subnet('8.8.8.8/32').network, '8.8.8.8');
// The whole address space: naive "2^host - 2" maths would go negative here.
check('/0 network', () => n.ipv4Subnet('1.2.3.4/0').network, '0.0.0.0');
check('/0 total addresses', () => n.ipv4Subnet('1.2.3.4/0').totalAddresses, 4294967296);
check('/0 usable hosts', () => n.ipv4Subnet('1.2.3.4/0').usableHosts, 4294967294);
// The top of the space must not wrap negative when the block size is added.
check('top-of-space /24 broadcast', () => n.ipv4Subnet('255.255.255.255/24').broadcast, '255.255.255.255');
check('classful class B', () => n.ipv4Subnet('172.16.0.1/16').classfulClass, 'B');
check('classful class D', () => n.ipv4Subnet('224.0.0.1/24').classfulClass, 'D');
check('private range', () => n.classifyIPv4('192.168.1.1'), 'Private (RFC 1918)');

console.log('\nIPv6');
check('::1', () => n.bigIntToIPv6(n.ipv6ToBigInt('::1')), '::1');
check(':: compresses zeros', () => n.bigIntToIPv6(n.ipv6ToBigInt('2001:0db8:0000:0000:0000:0000:0000:0001')), '2001:db8::1');
check('full form', () => n.bigIntToIPv6(n.ipv6ToBigInt('2001:db8:0:1:1:1:1:1')), '2001:db8:0:1:1:1:1:1');
check('v4 mapped', () => n.bigIntToIPv6(n.ipv6ToBigInt('::ffff:192.0.2.1')), '::ffff:c000:201');
check('leading zeros stripped', () => n.bigIntToIPv6(n.ipv6ToBigInt('2001:0db8:0000:0000:0000:0000:0000:0000')), '2001:db8::');
check('zone index ignored', () => n.bigIntToIPv6(n.ipv6ToBigInt('fe80::1%eth0')), 'fe80::1');
check('isIPv6 accepts', () => n.isIPv6('2001:db8::1'), true);
check('isIPv6 rejects IPv4', () => n.isIPv6('192.168.1.1'), false);
throwsCode('rejects two :: groups', () => n.ipv6ToBigInt('1::2::3'), 'invalid-ipv6');
throwsCode('rejects a 5-digit group', () => n.ipv6ToBigInt('2001:db8::12345'), 'invalid-ipv6');
check('a /64 has no broadcast', () => n.ipv6Subnet('2001:db8::1', 64).broadcast, 'n/a');
check('/64 host bits', () => n.ipv6Subnet('2001:db8::1', 64).hostBits, 64);
check('/64 network', () => n.ipv6Subnet('2001:db8::1', 64).network, '2001:db8::');
check('/127 first host', () => n.ipv6Subnet('2001:db8::1', 127).firstHost, '2001:db8::1');
check('/0 is the whole space', () => n.ipv6Subnet('2001:db8::1', 0).network, '::');
throwsCode('rejects prefix 129', () => n.ipv6Subnet('2001:db8::1', 129), 'invalid-prefix');

console.log('\nVLSM');
// A /32 holds exactly one usable address; a /31 holds two (RFC 3021).
check('prefix for 1 host', () => n.prefixForHosts(1), 32);
check('prefix for 2 hosts', () => n.prefixForHosts(2), 31);
check('prefix for 50 hosts', () => n.prefixForHosts(50), 26);
check('prefix for 254 hosts', () => n.prefixForHosts(254), 24);
check(
  'allocates largest first',
  n.planVlsm('192.168.1.0/24', [{ name: 'HQ', hosts: 50 }, { name: 'Branch', hosts: 25 }]).allocations.map((a) => [a.name, a.cidr, a.usable]),
  [['HQ', '192.168.1.0/26', 62], ['Branch', '192.168.1.64/27', 30]],
);
check(
  'three subnets fit in one /24',
  n.planVlsm('192.168.1.0/24', [{ name: 'A', hosts: 100 }, { name: 'B', hosts: 50 }, { name: 'C', hosts: 10 }]).allocations.map((a) => a.cidr),
  ['192.168.1.0/25', '192.168.1.128/26', '192.168.1.192/28'],
);
check(
  'flags an over-subscribed pool',
  n.planVlsm('192.168.1.0/24', [{ name: 'A', hosts: 200 }, { name: 'B', hosts: 200 }]).overflow !== null,
  true,
);
throwsCode('rejects zero hosts', () => n.prefixForHosts(0), 'invalid-hosts');

console.log('\nAddress range to CIDR');
check('an awkward range splits', () => n.rangeToCidrs('192.168.1.0', '192.168.1.130').blocks.map((b) => b.cidr), ['192.168.1.0/25', '192.168.1.128/31', '192.168.1.130/32']);
check('an exact block stays one', () => n.rangeToCidrs('10.0.0.0', '10.0.0.255').blocks.map((b) => b.cidr), ['10.0.0.0/24']);
check('a single address is a /32', () => n.rangeToCidrs('10.1.1.5', '10.1.1.5').blocks.map((b) => b.cidr), ['10.1.1.5/32']);
check('the top of the space does not wrap', () => n.rangeToCidrs('255.255.255.254', '255.255.255.255').blocks.map((b) => b.cidr), ['255.255.255.254/31']);
throwsCode('rejects an inverted range', () => n.rangeToCidrs('192.168.1.10', '192.168.1.1'), 'invalid-range');

console.log('\nSupernetting');
check(
  'four /26s summarise to a /24',
  (() => { const r = n.supernet('192.168.1.0/26 192.168.1.64/26 192.168.1.128/26 192.168.1.192/26'); return [r.aggregate, r.isSafe]; })(),
  ['192.168.1.0/24', true],
);
// Two /25s are contiguous and do tile the /24 exactly, so that is safe.
// The unsafe case needs a real hole: two /26s that skip the middle two blocks.
check(
  'two /26s with a hole are flagged',
  (() => { const r = n.supernet('192.168.1.0/26 192.168.1.128/26'); return [r.aggregate, r.isSafe, r.extraNetworks]; })(),
  ['192.168.1.0/24', false, ['192.168.1.64', '192.168.1.192']],
);
check(
  'two contiguous /25s tile a /24 safely',
  (() => { const r = n.supernet('192.168.1.0/25 192.168.1.128/25'); return [r.aggregate, r.isSafe]; })(),
  ['192.168.1.0/24', true],
);
check('a single network summarises to itself', () => n.supernet('10.1.1.0/24').aggregate, '10.1.1.0/24');

console.log('\nMAC addresses');
check('colon notation', () => n.formatMac('00:1a:2b:3c:4d:5e', 'colon'), '00:1a:2b:3c:4d:5e');
// Cisco notation groups hex digits in fours, not in pairs.
check('cisco notation', () => n.formatMac('00:1a:2b:3c:4d:5e', 'cisco'), '001a.2b3c.4d5e');
check('hyphen notation', () => n.formatMac('00:1a:2b:3c:4d:5e', 'dash'), '00-1a-2b-3c-4d-5e');
check('plain notation', () => n.formatMac('00:1a:2b:3c:4d:5e', 'plain'), '001a2b3c4d5e');
check('accepts cisco input', () => n.formatMac('001a.2b3c.4d5e', 'colon'), '00:1a:2b:3c:4d:5e');
check('a multicast OUI is detected', () => (() => { const r = n.macInfo('01:00:5E:00:00:FB'); return [r.type, r.broadcast]; })(), ['Multicast / broadcast', 'Yes']);
check('a unicast address', () => n.macInfo('00:1a:2b:3c:4d:5e').type, 'Unicast');
check('locally administered bit', () => n.macInfo('02:1a:2b:3c:4d:5e').assignment.includes('Locally'), true);
throwsCode('rejects a short MAC', () => n.normalizeMac('00:1a:2b:3c:4d'), 'invalid-mac');

console.log('\nMTU and MSS');
check('1500 Ethernet MSS', () => (() => { const r = n.mtuDetails(1500, 'ethernet'); return [r.pathMtu, r.mss]; })(), [1500, 1460]);
check('IPsec tunnel MSS', () => (() => { const r = n.mtuDetails(1500, 'ipsec'); return [r.pathMtu, r.mss]; })(), [1462, 1422]);
check('VLAN tagged MSS', () => n.mtuDetails(1500, 'vlan').mss, 1456);
check('PPP overhead', () => n.mtuDetails(1500, 'ppp').mss, 1458);
check('PPPoE overhead', () => n.mtuDetails(1500, 'pppoe').mss, 1452);
// 100 bytes is a legal MTU, but 46 bytes of tunnel overhead leaves 54, below
// the 68-byte IPv4 minimum, so it must report mtu-too-small rather than a value.
throwsCode('rejects an MTU too small for the overhead', () => n.mtuDetails(100, 'tunnels'), 'mtu-too-small');
throwsCode('rejects an MTU below the IPv4 minimum', () => n.mtuDetails(10, 'ethernet'), 'invalid-mtu');
throwsCode('rejects a huge MTU', () => n.mtuDetails(99999, 'ethernet'), 'invalid-mtu');

console.log('\nBandwidth and transfer time');
check('100 Mb/s parses to 100e6', () => n.parseBandwidth('100M'), 100000000);
check('1G parses to 1e9', () => n.parseBandwidth('1G'), 1000000000);
check('a bare number is Mb/s', () => n.parseBandwidth('250'), 250000000);
check('1 GB is 1e9 bytes', () => n.parseSize('1GB'), 1000000000);
check('1 GiB is 2^30 bytes', () => n.parseSize('1GiB'), 1073741824);
check('1 MiB is 2^20 bytes', () => n.parseSize('1MiB'), 1048576);
// 2 GB at 100 Mb/s: 16 Gbit / 100 Mbit/s = 160 s = 2 min 40 s.
check('2 GB at 100 Mb/s', () => (() => { const r = n.transferDetails('100M', '2GB', 100); return [r.time, r.mbytesPerSecond.toFixed(2)]; })(), ['2 min 40 s', '12.50']);
check('efficiency is applied', () => n.transferDetails('100M', '2GB', 50).seconds, 320);
throwsCode('rejects zero throughput', () => n.transferDetails('0M', '1GB', 100), 'zero-bandwidth');
throwsCode('rejects zero efficiency', () => n.transferDetails('100M', '1GB', 0), 'invalid-efficiency');

console.log('\nMask notation');
check('from a dotted quad', () => (() => { const r = n.maskDetails('255.255.240.0'); return [r.prefix, r.mask, r.wildcard, r.usableHosts]; })(), [20, '255.255.240.0', '0.0.15.255', 4094]);
check('from a prefix', () => n.maskDetails('/24').mask, '255.255.255.0');
check('a /31 keeps both addresses', () => n.maskDetails('/31').usableHosts, 2);
check('a /32 keeps one address', () => n.maskDetails('/32').usableHosts, 1);
throwsCode('rejects a non-contiguous mask', () => n.maskDetails('255.0.255.0'), 'non-contiguous-mask');

/* ------------------------------------------------------------------ */

console.log(`\n${passed} passed, ${failed} failed\n`);

if (failures.length) {
  console.error('Failures:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

check('loopback range', () => n.classifyIPv4('127.0.0.1'), 'Loopback');
check('public range', () => n.classifyIPv4('8.8.8.8'), 'Public (globally routable)');
