/**
 * cli.js - Compact Cisco IOS CLI Simulator
 * Supports the commands needed for the 3 CCNA path lessons.
 */

class CLI {
    constructor(device) {
        this.device = device;
        this.history = [];
        this.historyIndex = -1;
        this.pendingPassword = false;
    }

    execute(input) {
        const d = this.device;
        const parts = input.trim().split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        // PC commands
        if (d.type === 'pc') {
            return this.executePC(cmd, args);
        }

        // Switch commands
        switch (d.mode) {
            case 'user':
                return this.executeUser(cmd, args);
            case 'privileged':
                return this.executePrivileged(cmd, args);
            case 'config':
                return this.executeConfig(cmd, args);
            case 'config-interface':
                return this.executeInterface(cmd, args);
            case 'config-vlan':
                return this.executeVlan(cmd, args);
            default:
                return { type: 'error', message: '% Invalid input detected at \'^\' marker.' };
        }
    }

    // ============================================================
    // PC COMMANDS
    // ============================================================
    executePC(cmd, args) {
        const d = this.device;
        if (cmd === 'ipconfig' || cmd === 'ip') {
            return {
                type: 'output',
                message: `Ethernet adapter Ethernet0:\n\n   Connection-specific DNS Suffix  . :\n   Link-local IPv6 Address . . . . . : fe80::${d.macAddress.replace(/:/g, '').toLowerCase().slice(0, 4)}%12\n   IPv4 Address. . . . . . . . . . . : ${d.ipAddress || '192.168.1.' + (d.name === 'PC-A' ? '10' : '20')}\n   Subnet Mask . . . . . . . . . . . : ${d.ipMask}\n   Default Gateway . . . . . . . . . : ${d.gateway || '192.168.1.1'}`
            };
        }
        if (cmd === 'ping') {
            const target = args[0] || '';
            if (!target) return { type: 'error', message: 'Usage: ping <ip-address>' };
            return {
                type: 'output',
                message: `Pinging ${target} with 32 bytes of data:\nReply from ${target}: bytes=32 time=1ms TTL=128\nReply from ${target}: bytes=32 time=1ms TTL=128\nReply from ${target}: bytes=32 time=1ms TTL=128\nReply from ${target}: bytes=32 time=1ms TTL=128\n\nPing statistics for ${target}:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`
            };
        }
        if (cmd === 'arp' && args[0] === '-a') {
            return {
                type: 'output',
                message: `Interface: ${d.ipAddress || '192.168.1.' + (d.name === 'PC-A' ? '10' : '20')} --- 0xc\n  Internet Address      Physical Address      Type\n  192.168.1.1           00-1b-2f-3c-4d-01     dynamic\n  192.168.1.20          00-1b-2f-3c-4d-5f     dynamic`
            };
        }
        if (cmd === 'help' || cmd === '?') {
            return { type: 'output', message: 'Available commands:\n  ipconfig     Show IP configuration\n  ping <ip>    Send echo messages\n  arp -a       Show ARP table\n  help         Show this help' };
        }
        if (cmd === 'exit' || cmd === 'logout') {
            return { type: 'info', message: 'Connection closed by foreign host.' };
        }
        return { type: 'error', message: `'${cmd}' is not recognized as an internal or external command.` };
    }

    // ============================================================
    // USER EXEC MODE
    // ============================================================
    executeUser(cmd, args) {
        const d = this.device;
        if (cmd === 'enable') {
            if (d.enableSecret || d.enablePassword) {
                this.pendingPassword = true;
                return { type: 'password', message: 'Password: ' };
            }
            d.mode = 'privileged';
            return { type: 'success', message: '' };
        }
        if (cmd === 'show') return this.handleShow(args);
        if (cmd === 'ping') return this.handlePing(args);
        if (cmd === 'exit' || cmd === 'logout') {
            return { type: 'info', message: 'Connection closed by foreign host.' };
        }
        if (cmd === 'help' || cmd === '?') return this.showHelp('user');
        if (cmd === 'terminal') {
            if (args[0] === 'monitor') return { type: 'success', message: '' };
            return { type: 'error', message: '% Invalid input detected at \'^\' marker.' };
        }
        return { type: 'error', message: `% Invalid input detected at '^' marker.` };
    }

    // ============================================================
    // PRIVILEGED EXEC MODE
    // ============================================================
    executePrivileged(cmd, args) {
        const d = this.device;
        if (cmd === 'disable') {
            d.mode = 'user';
            return { type: 'success', message: '' };
        }
        if (cmd === 'configure' || cmd === 'conf') {
            const sub = (args[0] || '').toLowerCase();
            if (!sub || sub === 'terminal' || sub.startsWith('t')) {
                d.modeStack.push(d.mode);
                d.mode = 'config';
                return { type: 'success', message: 'Enter configuration commands, one per line.  End with CNTL/Z.' };
            }
            return { type: 'error', message: '% Unknown command or computer name, or unable to find computer address' };
        }
        if (cmd === 'show') return this.handleShow(args);
        if (cmd === 'write' || cmd === 'wr') return this.handleWrite(args);
        if (cmd === 'copy') return this.handleCopy(args);
        if (cmd === 'ping') return this.handlePing(args);
        if (cmd === 'reload') {
            d.mode = 'user';
            d.modeStack = [];
            return { type: 'output', message: 'Proceed with reload? [confirm]\n\nSystem configuration has been modified. Save? [yes/no]: ' };
        }
        if (cmd === 'exit') {
            d.mode = 'user';
            return { type: 'success', message: '' };
        }
        if (cmd === 'help' || cmd === '?') return this.showHelp('privileged');
        if (cmd === 'clear') {
            if (args[0] === 'mac' && args[1] === 'address-table') {
                d.macTable = [];
                return { type: 'success', message: '' };
            }
            return { type: 'error', message: '% Incomplete command.' };
        }
        return { type: 'error', message: `% Invalid input detected at '^' marker.` };
    }

    // ============================================================
    // GLOBAL CONFIG MODE
    // ============================================================
    executeConfig(cmd, args) {
        const d = this.device;
        if (cmd === 'hostname') {
            if (!args[0]) return { type: 'error', message: '% Incomplete command.' };
            d.hostname = args[0];
            return { type: 'config-output', message: `${d.hostname}(config)#` };
        }
        if (cmd === 'interface' || cmd === 'int') {
            if (!args[0]) return { type: 'error', message: '% Incomplete command.' };
            const iface = d.findInterface(args[0]);
            if (!iface) return { type: 'error', message: '% Invalid interface type and number' };
            d.currentInterface = iface;
            d.modeStack.push(d.mode);
            d.mode = 'config-interface';
            return { type: 'config-output', message: `${d.hostname}(config-if)#` };
        }
        if (cmd === 'vlan') {
            if (!args[0]) return { type: 'error', message: '% Incomplete command.' };
            const id = parseInt(args[0], 10);
            if (!NetworkDevice.isValidVLAN(id)) return { type: 'error', message: '% VLAN ID must be between 1 and 4094' };
            let vlan = d.findVLAN(id);
            if (!vlan) {
                const r = d.createVLAN(id);
                if (r.error) return { type: 'error', message: `% ${r.error}` };
                vlan = d.findVLAN(id);
            }
            d.currentVlan = vlan;
            d.modeStack.push(d.mode);
            d.mode = 'config-vlan';
            return { type: 'config-output', message: `${d.hostname}(config-vlan)#` };
        }
        if (cmd === 'enable') {
            if (args[0] === 'secret' && args[1]) {
                d.enableSecret = args[1];
                return { type: 'success', message: '' };
            }
            if (args[0] === 'password' && args[1]) {
                d.enablePassword = args[1];
                return { type: 'success', message: '' };
            }
            return { type: 'error', message: '% Incomplete command.' };
        }
        if (cmd === 'no') {
            if (args[0] === 'ip' && args[1] === 'domain-lookup') return { type: 'success', message: '' };
            return { type: 'error', message: '% Invalid input detected at \'^\' marker.' };
        }
        if (cmd === 'exit') {
            const prev = d.modeStack.pop() || 'privileged';
            d.mode = prev;
            return { type: 'config-output', message: `${d.getPrompt()}` };
        }
        if (cmd === 'end') {
            d.mode = 'privileged';
            d.modeStack = [];
            d.currentInterface = null;
            d.currentVlan = null;
            return { type: 'config-output', message: `${d.getPrompt()}` };
        }
        if (cmd === 'help' || cmd === '?') return this.showHelp('config');
        return { type: 'error', message: `% Invalid input detected at '^' marker.` };
    }

    // ============================================================
    // INTERFACE CONFIG MODE
    // ============================================================
    executeInterface(cmd, args) {
        const d = this.device;
        const iface = d.currentInterface;
        if (cmd === 'switchport') {
            if (args[0] === 'mode' && args[1] === 'access') {
                iface.mode = 'access';
                return { type: 'success', message: '' };
            }
            if (args[0] === 'mode' && args[1] === 'trunk') {
                iface.mode = 'trunk';
                return { type: 'success', message: '' };
            }
            if (args[0] === 'access' && args[1] === 'vlan') {
                const vlanId = parseInt(args[2], 10);
                if (!NetworkDevice.isValidVLAN(vlanId)) return { type: 'error', message: '% VLAN ID must be between 1 and 4094' };
                if (!d.findVLAN(vlanId)) return { type: 'error', message: `% VLAN ${vlanId} does not exist` };
                iface.vlan = vlanId;
                return { type: 'success', message: '' };
            }
            return { type: 'error', message: '% Invalid input detected at \'^\' marker.' };
        }
        if (cmd === 'shutdown') {
            d.setInterfaceStatus(iface, 'down');
            return { type: 'success', message: `%LINK-5-CHANGED: Interface ${iface.name}, changed state to administratively down\n%LINEPROTO-5-UPDOWN: Line protocol on Interface ${iface.name}, changed state to down` };
        }
        if (cmd === 'no') {
            if (args[0] === 'shutdown') {
                d.setInterfaceStatus(iface, 'up');
                return { type: 'success', message: `%LINK-3-UPDOWN: Interface ${iface.name}, changed state to up\n%LINEPROTO-5-UPDOWN: Line protocol on Interface ${iface.name}, changed state to up` };
            }
            return { type: 'error', message: '% Invalid input detected at \'^\' marker.' };
        }
        if (cmd === 'description') {
            if (!args.length) return { type: 'error', message: '% Incomplete command.' };
            iface.description = args.join(' ');
            return { type: 'success', message: '' };
        }
        if (cmd === 'speed') {
            if (!args[0] || !['auto', '10', '100', '1000'].includes(args[0])) {
                return { type: 'error', message: '% Invalid input detected at \'^\' marker.' };
            }
            iface.speed = parseInt(args[0], 10) || 'auto';
            return { type: 'success', message: '' };
        }
        if (cmd === 'duplex') {
            if (!args[0] || !['auto', 'full', 'half'].includes(args[0])) {
                return { type: 'error', message: '% Invalid input detected at \'^\' marker.' };
            }
            iface.duplex = args[0];
            return { type: 'success', message: '' };
        }
        if (cmd === 'exit') {
            const prev = d.modeStack.pop() || 'config';
            d.mode = prev;
            d.currentInterface = null;
            return { type: 'config-output', message: `${d.getPrompt()}` };
        }
        if (cmd === 'end') {
            d.mode = 'privileged';
            d.modeStack = [];
            d.currentInterface = null;
            d.currentVlan = null;
            return { type: 'config-output', message: `${d.getPrompt()}` };
        }
        if (cmd === 'help' || cmd === '?') return this.showHelp('config-interface');
        return { type: 'error', message: `% Invalid input detected at '^' marker.` };
    }

    // ============================================================
    // VLAN CONFIG MODE
    // ============================================================
    executeVlan(cmd, args) {
        const d = this.device;
        if (cmd === 'name') {
            if (!args[0]) return { type: 'error', message: '% Incomplete command.' };
            d.currentVlan.name = args.join(' ');
            return { type: 'success', message: '' };
        }
        if (cmd === 'exit') {
            const prev = d.modeStack.pop() || 'config';
            d.mode = prev;
            d.currentVlan = null;
            return { type: 'config-output', message: `${d.getPrompt()}` };
        }
        if (cmd === 'end') {
            d.mode = 'privileged';
            d.modeStack = [];
            d.currentInterface = null;
            d.currentVlan = null;
            return { type: 'config-output', message: `${d.getPrompt()}` };
        }
        if (cmd === 'help' || cmd === '?') return this.showHelp('config-vlan');
        return { type: 'error', message: `% Invalid input detected at '^' marker.` };
    }

    // ============================================================
    // SHOW COMMANDS
    // ============================================================
    handleShow(args) {
        const d = this.device;
        const sub = (args[0] || '').toLowerCase();

        if (!sub) return { type: 'error', message: '% Incomplete command.' };

        if (sub === 'version' || sub === 'ver') {
            return {
                type: 'output',
                message: `Cisco IOS Software, C2960 Software (C2960-LANBASEK9-M), Version ${d.iosVersion}, RELEASE SOFTWARE (fc1)\nCopyright (c) 1986-2013 by Cisco Systems, Inc.\nCompiled Thu 26-Jul-13 18:45 by prod_rel_team\n\nROM: Bootstrap program is C2960 boot loader\n\n${d.hostname} uptime is 0 weeks, 0 days, 1 hour, 5 minutes\nSystem returned to ROM by power-on\nSystem image file is "flash:c2960-lanbasek9-mz.122-55.SE11.bin"\n\ncisco WS-C2960-24TT-L (PowerPC405) processor with 65536K bytes of memory.\nProcessor board ID FOC1234ABCDE\nLast reset from power-on\n\n24 FastEthernet/IEEE 802.3 interface(s)\n2 Gigabit Ethernet/IEEE 802.3 interface(s)\n\nMAC address : ${d.macAddress}\nModel number : WS-C2960-24TT\nSystem serial number : FOC1234ABCDE`
            };
        }

        if (sub === 'interfaces' || sub === 'interface') {
            // show interfaces status / show interface status
            if (args[1] === 'status' || args[1] === 'st') {
                let out = `\nPort      Name   Status       Vlan       Duplex  Speed Type\n`;
                d.interfaces.forEach(iface => {
                    const short = iface.name.replace('FastEthernet0/', 'Fa0/').replace('GigabitEthernet0/', 'Gi0/');
                    const status = iface.status === 'up' ? 'connected' : 'notconnect';
                    const vlan = iface.mode === 'trunk' ? 'trunk' : iface.vlan;
                    const duplex = iface.duplex === 'auto' ? 'a-full' : iface.duplex;
                    const speed = iface.speed === 'auto' ? 'a-100' : String(iface.speed);
                    const type = iface.type === 'fastethernet' ? '10/100BaseTX' : '10/100/1000BaseTX';
                    out += `${short.padEnd(8)} ${(iface.description || '').padEnd(7)} ${status.padEnd(11)} ${String(vlan).padEnd(9)} ${duplex.padEnd(8)} ${speed.padEnd(6)} ${type}\n`;
                });
                return { type: 'output', message: out };
            }
            // show interface <name>
            const ifaceName = args[1];
            if (ifaceName) {
                const iface = d.findInterface(ifaceName);
                if (!iface) return { type: 'error', message: '% Invalid interface type and number' };
                return {
                    type: 'output',
                    message: `${iface.name} is ${iface.status === 'up' ? 'up' : 'administratively down'}, line protocol is ${iface.status === 'up' ? 'up' : 'down'}\n  Hardware is Fast Ethernet, address is ${iface.macAddress}\n  MTU 1500 bytes, BW 100000 Kbit/sec, DLY 100 usec\n  ${iface.description ? 'Description: ' + iface.description + '\n  ' : ''}Auto-duplex, Auto-speed, media type is 10/100BaseTX\n  input packets 0, bytes 0, no buffer\n  output packets 0, bytes 0, underruns`
                };
            }
            return { type: 'error', message: '% Incomplete command.' };
        }

        if (sub === 'running-config' || sub === 'run') {
            if (d.mode === 'user') return { type: 'error', message: '% Invalid input detected at \'^\' marker.' };
            return { type: 'output', message: d.generateRunningConfig() };
        }

        if (sub === 'startup-config') {
            if (d.mode === 'user') return { type: 'error', message: '% Invalid input detected at \'^\' marker.' };
            return { type: 'output', message: 'startup-config is not present' };
        }

        if (sub === 'vlan') {
            if (args[1] === 'brief' || args[1] === 'br') {
                let out = `\nVLAN Name                             Status    Ports\n---- -------------------------------- --------- -------------------------------\n`;
                d.vlans.forEach(v => {
                    const ports = d.interfaces.filter(i => i.vlan === v.id && i.mode === 'access').map(i => i.name.replace('FastEthernet0/', 'Fa0/')).join(', ');
                    out += `${String(v.id).padEnd(5)} ${v.name.padEnd(32)} ${v.status.padEnd(10)} ${ports}\n`;
                });
                return { type: 'output', message: out };
            }
            return { type: 'error', message: '% Incomplete command.' };
        }

        if (sub === 'mac' || sub === 'mac-address-table') {
            if (args[1] === 'address-table' || args[1] === 'address' || sub === 'mac-address-table') {
                let out = `\n          Mac Address Table\n-------------------------------------------\nVlan    Mac Address       Type        Ports\n----    -----------       --------    -----\n`;
                if (d.macTable.length === 0) {
                    out += `   1    0000.0000.0000    STATIC      CPU\n`;
                }
                d.macTable.forEach(m => {
                    out += `   ${m.vlan}    ${m.mac.replace(/:/g, '.').toLowerCase()}    DYNAMIC     ${m.port.replace('FastEthernet0/', 'Fa0/')}\n`;
                });
                out += `Total Mac Addresses for this criterion: ${d.macTable.length}\n`;
                return { type: 'output', message: out };
            }
            return { type: 'error', message: '% Incomplete command.' };
        }

        if (sub === 'ip') {
            if (args[1] === 'interface' || args[1] === 'int') {
                return { type: 'output', message: `Vlan1 is up, line protocol is up\n  Internet address is 192.168.1.2/24\n  MTU is 1500 bytes` };
            }
            return { type: 'error', message: '% Incomplete command.' };
        }

        if (sub === 'clock') {
            const now = new Date();
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const time = `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')} ${now.getFullYear()}`;
            return { type: 'output', message: `*${time} UTC` };
        }

        if (sub === 'history') {
            let out = `\n`;
            this.history.slice(-10).forEach((h, i) => {
                out += `  ${i + 1}  ${h}\n`;
            });
            return { type: 'output', message: out };
        }

        if (sub === 'users') {
            return { type: 'output', message: '    Line       User       Host(s)              Idle       Location\n*  0 con 0                idle                 00:00:00' };
        }

        if (sub === 'cdp') {
            if (args[1] === 'neighbors') {
                return { type: 'output', message: `Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge\n                  S - Switch, H - Host, I - IGMP, r - Repeater, P - Phone\n\nDevice ID    Local Intrfce   Holdtme    Capability  Platform  Port ID\nSW2          Gig 0/1         122         S I        WS-C2960  Gig 0/1` };
            }
            return { type: 'error', message: '% Incomplete command.' };
        }

        if (sub === 'spanning-tree') {
            return {
                type: 'output',
                message: `VLAN0001\n  Spanning tree enabled protocol ieee\n  Root ID    Priority    32769\n             Address     ${d.macAddress}\n             This bridge is the root\n\n  Bridge ID  Priority    32769  (priority 32768 sys-id-ext 1)\n             Address     ${d.macAddress}\n             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec\n\nInterface        Role Sts Cost      Prio.Nbr Type\n---------------- ---- --- --------- -------- --------------------------------\nFa0/1            Desg FWD 19        128.1    P2p\nFa0/2            Desg FWD 19        128.2    P2p`
            };
        }

        if (sub === 'port-security') {
            return { type: 'output', message: `Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action\n                (Count)       (Count)          (Count)\n--------------------------------------------------------------------------\nFa0/1                1            0              0              Shutdown` };
        }

        if (sub === 'trunk') {
            return { type: 'output', message: `Port        Mode             Encapsulation  Status        Native vlan\nGi0/1       on               802.1q         trunking      1\n\nPort        Vlans allowed on trunk\nGi0/1       1-4094` };
        }

        if (sub === 'flash') {
            return { type: 'output', message: `System flash directory:\nFile  Length   Name/status\n  1   9437184  c2960-lanbasek9-mz.122-55.SE11.bin\n  2     20717  config.text\n\n32514048 bytes total (23076864 bytes free)` };
        }

        return { type: 'error', message: `% Invalid input detected at '^' marker.` };
    }

    // ============================================================
    // OTHER COMMANDS
    // ============================================================
    handlePing(args) {
        const target = args[0] || '';
        if (!target) return { type: 'error', message: 'Usage: ping <ip-address>' };
        return {
            type: 'output',
            message: `Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms`
        };
    }

    handleWrite(args) {
        const d = this.device;
        if (args[0] === 'memory' || args[0] === 'terminal' || args.length === 0) {
            return { type: 'output', message: `Building configuration...\n[OK]` };
        }
        return { type: 'error', message: '% Invalid input detected at \'^\' marker.' };
    }

    handleCopy(args) {
        if (args[0] === 'running-config' && args[1] === 'startup-config') {
            return { type: 'output', message: `Destination filename [startup-config]?\nBuilding configuration...\n[OK]` };
        }
        return { type: 'error', message: '% Invalid input detected at \'^\' marker.' };
    }

    // ============================================================
    // HELP
    // ============================================================
    showHelp(mode) {
        const helps = {
            user: `Exec commands:\n  enable    Turn on privileged commands\n  exit      Exit from the EXEC\n  help      Description of the interactive help system\n  ping      Send echo messages\n  show      Show running system information\n  terminal  Set terminal line parameters`,
            privileged: `Exec commands:\n  clear     Reset functions\n  configure Enter configuration mode\n  copy      Copy from one file to another\n  disable   Turn off privileged commands\n  exit      Exit from the EXEC\n  ping      Send echo messages\n  reload    Halt and reload the device\n  show      Show running system information\n  write     Write running configuration to memory`,
            config: `Configure commands:\n  enable    Modify enable password parameters\n  exit      Exit from configuration mode\n  hostname  Set system's network name\n  interface Select an interface to configure\n  vlan      Configure VLAN parameters\n  end       Exit from configuration mode`,
            'config-interface': `Interface configuration commands:\n  description  Interface specific description\n  duplex       Configure duplex operation\n  exit         Exit from interface configuration mode\n  no           Negate a command or set its defaults\n  shutdown     Shutdown the selected interface\n  speed        Configure speed operation\n  switchport   Set switching mode characteristics\n  end          Exit from configuration mode`,
            'config-vlan': `VLAN configuration commands:\n  exit  Exit from VLAN configuration mode\n  name  Ascii name of the VLAN\n  no    Negate a command or set its defaults\n  end   Exit from configuration mode`
        };
        return { type: 'output', message: helps[mode] || helps.user };
    }

    getCompletions(input) {
        const d = this.device;
        const parts = input.trim().split(/\s+/);
        const partial = parts[parts.length - 1].toLowerCase();
        if (!partial) return [];

        let commands = [];
        if (d.type === 'pc') {
            commands = ['ipconfig', 'ping', 'arp', 'help'];
        } else {
            switch (d.mode) {
                case 'user': commands = ['enable', 'show', 'exit', 'logout', 'ping', 'help', 'terminal']; break;
                case 'privileged': commands = ['disable', 'configure', 'show', 'write', 'copy', 'ping', 'reload', 'exit', 'clear', 'help']; break;
                case 'config': commands = ['hostname', 'interface', 'vlan', 'enable', 'exit', 'end', 'no', 'help']; break;
                case 'config-interface': commands = ['switchport', 'shutdown', 'no', 'description', 'speed', 'duplex', 'exit', 'end', 'help']; break;
                case 'config-vlan': commands = ['name', 'exit', 'end', 'no', 'help']; break;
            }
        }

        // If we're completing a subcommand
        if (parts.length > 1) {
            const first = parts[0].toLowerCase();
            if (first === 'show') {
                const showCmds = ['version', 'interfaces', 'running-config', 'startup-config', 'vlan', 'mac', 'mac-address-table', 'ip', 'clock', 'history', 'users', 'cdp', 'spanning-tree', 'port-security', 'trunk', 'flash'];
                return showCmds.filter(c => c.startsWith(partial));
            }
            if (first === 'switchport') {
                const spCmds = ['mode', 'access'];
                return spCmds.filter(c => c.startsWith(partial));
            }
            if (first === 'interface') {
                const ifaces = d.interfaces.map(i => i.name);
                return ifaces.filter(i => i.toLowerCase().startsWith(partial));
            }
        }

        return commands.filter(c => c.startsWith(partial));
    }
}