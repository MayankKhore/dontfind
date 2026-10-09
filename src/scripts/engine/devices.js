/**
 * devices.js - PC and Switch device classes (compact)
 */

class NetworkDevice {
    constructor(name) {
        this.name = name;
        this.hostname = name;
        this.mode = 'user';
        this.modeStack = [];
        this.currentInterface = null;
        this.currentVlan = null;
        this.enableSecret = '';
        this.enablePassword = '';
        this.interfaces = [];
        this.vlans = [];
        this.macTable = [];
        /** Snapshot of running-config saved via `write`/`copy run start`. */
        this.startupConfig = null;
    }

    getPrompt() {
        switch (this.mode) {
            case 'user': return `${this.hostname}>`;
            case 'privileged': return `${this.hostname}#`;
            case 'config': return `${this.hostname}(config)#`;
            case 'config-interface': return `${this.hostname}(config-if)#`;
            case 'config-vlan': return `${this.hostname}(config-vlan)#`;
            default: return `${this.hostname}>`;
        }
    }

    getModeName() {
        const names = {
            user: 'User EXEC',
            privileged: 'Privileged EXEC',
            config: 'Global Config',
            'config-interface': 'Interface Config',
            'config-vlan': 'VLAN Config'
        };
        return names[this.mode] || 'User EXEC';
    }

    static isValidIP(ip) {
        const parts = ip.split('.');
        if (parts.length !== 4) return false;
        return parts.every(p => {
            const n = parseInt(p, 10);
            return n >= 0 && n <= 255 && String(n) === p;
        });
    }

    static isValidMAC(mac) {
        return /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/.test(mac);
    }

    static isValidVLAN(id) {
        const n = parseInt(id, 10);
        return n >= 1 && n <= 4094;
    }

    static genMAC() {
        const hex = '0123456789ABCDEF';
        let mac = '00:1B:';
        for (let i = 0; i < 4; i++) {
            if (i > 0) mac += ':';
            mac += hex[Math.floor(Math.random() * 16)] + hex[Math.floor(Math.random() * 16)];
        }
        return mac;
    }
}

class PC extends NetworkDevice {
    constructor(name) {
        super(name);
        this.type = 'pc';
        this.model = 'PC';
        this.macAddress = NetworkDevice.genMAC();
        this.ipAddress = '';
        this.ipMask = '255.255.255.0';
        this.gateway = '';
        this.interfaces = [{
            name: 'Ethernet0',
            type: 'ethernet',
            macAddress: this.macAddress,
            ipAddress: this.ipAddress,
            ipMask: this.ipMask,
            status: 'up',
            adminStatus: 'up'
        }];
    }

    getPrompt() {
        return `${this.hostname}>`;
    }
}

class Switch extends NetworkDevice {
    constructor(name) {
        super(name);
        this.type = 'switch';
        this.model = 'WS-C2960-24TT';
        this.macAddress = NetworkDevice.genMAC();
        this.iosVersion = '12.2(55)SE11';
        this.initInterfaces();
        this.initVLANs();
    }

    initInterfaces() {
        this.interfaces = [];
        for (let i = 1; i <= 24; i++) {
            this.interfaces.push({
                name: `FastEthernet0/${i}`,
                type: 'fastethernet',
                speed: 100,
                duplex: 'auto',
                adminStatus: 'up',
                status: 'down',
                vlan: 1,
                mode: 'access',
                macAddress: NetworkDevice.genMAC(),
                description: ''
            });
        }
        for (let i = 1; i <= 2; i++) {
            this.interfaces.push({
                name: `GigabitEthernet0/${i}`,
                type: 'gigabitethernet',
                speed: 1000,
                duplex: 'auto',
                adminStatus: 'up',
                status: 'down',
                vlan: 1,
                mode: 'access',
                macAddress: NetworkDevice.genMAC(),
                description: ''
            });
        }
    }

    initVLANs() {
        this.vlans = [
            { id: 1, name: 'default', status: 'active' },
            { id: 1002, name: 'fddi-default', status: 'act/unsup' },
            { id: 1003, name: 'token-ring-default', status: 'act/unsup' },
            { id: 1004, name: 'fddinet-default', status: 'act/unsup' },
            { id: 1005, name: 'trnet-default', status: 'act/unsup' }
        ];
    }

    findInterface(name) {
        if (!name) return null;
        const n = name.toLowerCase().replace(/\s+/g, '');
        const aliases = {
            fa: 'fastethernet', fast: 'fastethernet', fastethernet: 'fastethernet',
            gi: 'gigabitethernet', gig: 'gigabitethernet', gigabitethernet: 'gigabitethernet',
            eth: 'ethernet', ethernet: 'ethernet'
        };
        for (const iface of this.interfaces) {
            const lower = iface.name.toLowerCase().replace(/\s+/g, '');
            if (lower === n) return iface;
            const m = n.match(/^([a-z]+)(\d+)(?:\/(\d+))?$/);
            if (m) {
                const alias = aliases[m[1]];
                const port = m[3] ? parseInt(m[3], 10) : parseInt(m[2], 10);
                if (alias === 'fastethernet' && port >= 0 && port <= 24 && iface.name === `FastEthernet0/${port}`) return iface;
                if (alias === 'gigabitethernet' && port >= 0 && port <= 2 && iface.name === `GigabitEthernet0/${port}`) return iface;
            }
        }
        return null;
    }

    findVLAN(idOrName) {
        const id = parseInt(idOrName, 10);
        if (!isNaN(id)) return this.vlans.find(v => v.id === id) || null;
        return this.vlans.find(v => v.name.toLowerCase() === idOrName.toLowerCase()) || null;
    }

    createVLAN(id, name) {
        if (!NetworkDevice.isValidVLAN(id)) return { error: 'VLAN ID must be between 1 and 4094' };
        if (this.findVLAN(id)) return { error: `VLAN ${id} already exists` };
        this.vlans.push({ id, name: name || `VLAN${id}`, status: 'active' });
        return { success: true };
    }

    setInterfaceStatus(iface, status) {
        iface.adminStatus = status;
        iface.status = status;
    }

    generateRunningConfig() {
        let c = `Building configuration...\n\nCurrent configuration : ${2048 + Math.floor(Math.random() * 2048)} bytes\n!\nversion 12.2\n`;
        c += `no service timestamps log datetime msec\nno service password-encryption\n!\n`;
        c += `hostname ${this.hostname}\n!\n`;
        this.vlans.forEach(v => {
            if (v.id === 1) return;
            c += `vlan ${v.id}\n name ${v.name}\n!\n`;
        });
        this.interfaces.forEach(iface => {
            c += `interface ${iface.name}\n switchport mode ${iface.mode}\n`;
            if (iface.mode === 'trunk') {
                c += ` switchport trunk native vlan 1\n`;
            } else {
                c += ` switchport access vlan ${iface.vlan}\n`;
            }
            if (iface.description) c += ` description ${iface.description}\n`;
            c += `!\n`;
        });
        c += `\nline con 0\n line vty 0 4\n login\n!\nend\n`;
        return c;
    }
}
export { NetworkDevice, PC, Switch };

