/**
 * data.js - CCNA Path Lab Data (isolated per stage)
 *
 * Structure:
 *   LABS = {
 *     'meet-cli':           { stage: 1, lessons: { ... } },
 *     'learn-foundation':   { stage: 2, lessons: { ... } },
 *     'vlan-trunking':     { stage: 3, lessons: { ... } },
 *     'spanning-tree':     { stage: 4, lessons: { ... } },
 *     'security':          { stage: 5, lessons: { ... } },
 *     'link-aggregation':  { stage: 6, lessons: { ... } },
 *     'discovery-mgmt':    { stage: 7, lessons: { ... } },
 *     'layer3-switching':  { stage: 8, lessons: { ... } },
 *     'monitoring-ops':    { stage: 9, lessons: { ... } },
 *     'troubleshooting':   { stage: 10, lessons: { ... } }
 *   }
 *
 * Each stage is fully isolated so the Lab tab can scale independently
 * from Home / CLI sandbox tabs.
 */

const LABS = {

    // ============================================================
    // STAGE 1: MEET THE CLI
    // ============================================================
    'meet-cli': {
        id: 'meet-cli',
        stage: 1,
        stageName: 'Meet the CLI',
        lessons: {

            1: {
                id: 1,
                title: 'Your First Switch Config',
                scenario: 'Configure the switch hostname to SW1 and verify your work.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'hostname',
                    'show version', 'show running-config', 'write memory',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enter privileged EXEC mode with enable', cmd: 'enable' },
                    { text: 'Enter global configuration mode', cmd: 'configure terminal' },
                    { text: 'Set the hostname to SW1', cmd: 'hostname SW1' }
                ],
                concepts: [
                    {
                        title: 'CLI Modes',
                        body: 'A Cisco switch has modes. User EXEC (>) is read-only. Privileged EXEC (#) unlocks powerful commands. Global config (config)# lets you change the device.',
                        code: 'Switch> enable\nSwitch# configure terminal\nSwitch(config)#'
                    },
                    {
                        title: 'The ? Help System',
                        body: 'Type ? at any prompt to see available commands. Type a partial command + ? to see valid options.',
                        code: 'Switch> ?\nSwitch> show ?'
                    },
                    {
                        title: 'Tab Completion',
                        body: 'Type the first letters and press Tab. The switch fills in the rest. "conf t" is short for "configure terminal".',
                        code: 'Switch# conf t\nSwitch(config)#'
                    },
                    {
                        title: 'Saving Your Work',
                        body: 'Changes live in RAM (running-config). Save with "write memory" so they survive a reboot.',
                        code: 'SW1# write memory\nBuilding configuration...\n[OK]'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            2: {
                id: 2,
                title: 'CLI Modes & Navigation',
                scenario: 'Move between User EXEC, Privileged EXEC, and Global Config modes confidently.',
                duration: '6 min',
                allowedCommands: [
                    'enable', 'disable', 'configure terminal',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enter privileged EXEC mode', cmd: 'enable' },
                    { text: 'Enter global configuration mode', cmd: 'configure terminal' },
                    { text: 'Return to privileged EXEC mode', cmd: 'exit' }
                ],
                concepts: [
                    {
                        title: 'User EXEC Mode (>)',
                        body: 'The default mode when you connect. Read-only commands only. The prompt ends with ">".',
                        code: 'Switch>'
                    },
                    {
                        title: 'Privileged EXEC Mode (#)',
                        body: 'Type "enable" to enter. The prompt ends with "#". Unlocks show, write, copy, and configure commands.',
                        code: 'Switch> enable\nSwitch#'
                    },
                    {
                        title: 'Global Config Mode (config)#',
                        body: 'Type "configure terminal" from privileged mode. The prompt shows "(config)#". Use "exit" to go back one level, "end" to jump to privileged.',
                        code: 'Switch# configure terminal\nSwitch(config)# exit\nSwitch#'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            3: {
                id: 3,
                title: 'Help & Tab Completion',
                scenario: 'Use the ? help system and Tab completion to discover commands without memorizing everything.',
                duration: '6 min',
                allowedCommands: [
                    'enable', 'show', 'configure terminal',
                    'help', '?', 'exit', 'end'
                ],
                objectives: [
                    { text: 'View available commands with ?', cmd: '?' },
                    { text: 'View show subcommands', cmd: 'show ?' },
                    { text: 'Use Tab to complete "conf"', cmd: 'conf' }
                ],
                concepts: [
                    {
                        title: 'The ? Help System',
                        body: 'Type ? at any prompt to list available commands. Type "show ?" to see what you can show.',
                        code: 'Switch> ?\nSwitch> show ?'
                    },
                    {
                        title: 'Tab Completion',
                        body: 'Type the first few letters and press Tab. The switch completes the command for you.',
                        code: 'Switch# conf<Tab>\nSwitch# configure'
                    },
                    {
                        title: 'Abbreviations',
                        body: 'Cisco IOS accepts abbreviations as long as they are unambiguous. "conf t" = "configure terminal".',
                        code: 'Switch# conf t\nSwitch(config)#'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            4: {
                id: 4,
                title: 'Saving Your Work',
                scenario: 'Save your running configuration so changes survive a reboot.',
                duration: '5 min',
                allowedCommands: [
                    'enable', 'write memory', 'copy running-config startup-config',
                    'show running-config', 'show startup-config',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View the running configuration', cmd: 'show running-config' },
                    { text: 'Save to startup-config', cmd: 'write memory' }
                ],
                concepts: [
                    {
                        title: 'Running vs Startup Config',
                        body: 'Running-config lives in RAM and changes immediately. Startup-config lives in NVRAM and loads on boot. Unsaved changes are lost on reboot.',
                        code: 'RAM:  running-config (active)\nNVRAM: startup-config (boot)'
                    },
                    {
                        title: 'Saving Configuration',
                        body: 'Use "write memory" (or "copy running-config startup-config") to save. Always save before rebooting.',
                        code: 'SW1# write memory\nBuilding configuration...\n[OK]'
                    },
                    {
                        title: 'Verifying Saved Config',
                        body: '"show running-config" shows active config. "show startup-config" shows what will load on boot.',
                        code: 'SW1# show startup-config'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            5: {
                id: 5,
                title: 'Show Commands Basics',
                scenario: 'Use show commands to inspect the switch version, interfaces, and clock.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'show version', 'show interfaces status',
                    'show clock', 'show running-config',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View the switch version', cmd: 'show version' },
                    { text: 'Check interface status', cmd: 'show interfaces status' },
                    { text: 'View the system clock', cmd: 'show clock' }
                ],
                concepts: [
                    {
                        title: 'show version',
                        body: 'Displays IOS version, hardware model, uptime, and MAC address. Great first command on any Cisco device.',
                        code: 'SW1# show version\nCisco IOS Software, C2960 Software...'
                    },
                    {
                        title: 'show interfaces status',
                        body: 'Shows every port, its status (connected/notconnect), VLAN, duplex, and speed.',
                        code: 'SW1# show interfaces status\nPort   Status   Vlan   Duplex  Speed\nFa0/1  connected 1     a-full  a-100'
                    },
                    {
                        title: 'show clock',
                        body: 'Displays the current system time. Useful for logging and troubleshooting.',
                        code: 'SW1# show clock\n*Thu Aug 21 17:30:00.123 UTC'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            6: {
                id: 6,
                title: 'Interface Basics',
                scenario: 'Configure interface descriptions and control port state with shutdown / no shutdown.',
                duration: '9 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface', 'description',
                    'shutdown', 'no shutdown', 'show interfaces status',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enter interface configuration', cmd: 'interface FastEthernet0/1' },
                    { text: 'Add a description', cmd: 'description Link to PC-A' },
                    { text: 'Shut down the interface', cmd: 'shutdown' },
                    { text: 'Bring the interface back up', cmd: 'no shutdown' }
                ],
                concepts: [
                    {
                        title: 'Interface Configuration',
                        body: 'Enter interface config mode with "interface <name>". The prompt becomes "(config-if)#".',
                        code: 'SW1(config)# interface FastEthernet0/1\nSW1(config-if)#'
                    },
                    {
                        title: 'Descriptions',
                        body: 'Descriptions document what a port connects to. They appear in show commands and running-config.',
                        code: 'SW1(config-if)# description Link to PC-A'
                    },
                    {
                        title: 'Shutdown / No Shutdown',
                        body: '"shutdown" administratively disables a port. "no shutdown" re-enables it. Ports are up by default.',
                        code: 'SW1(config-if)# shutdown\n%LINK-5-CHANGED: Interface Fa0/1, changed state to administratively down'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            39: {
                id: 39,
                title: 'Running Config vs Startup Config',
                scenario: 'Understand the difference between running-config and startup-config and how to manage both.',
                duration: '6 min',
                allowedCommands: [
                    'enable', 'show running-config', 'show startup-config',
                    'copy running-config startup-config', 'write memory',
                    'copy startup-config running-config', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View running config', cmd: 'show running-config' },
                    { text: 'View startup config', cmd: 'show startup-config' },
                    { text: 'Save running to startup', cmd: 'write memory' }
                ],
                concepts: [
                    {
                        title: 'Running Config',
                        body: 'The running-config is the active configuration stored in RAM. Changes take effect immediately.',
                        code: 'SW1# show running-config\n! Active configuration — lives in RAM'
                    },
                    {
                        title: 'Startup Config',
                        body: 'The startup-config is stored in NVRAM. It loads into RAM when the switch boots.',
                        code: 'SW1# show startup-config\n! Boot configuration — lives in NVRAM'
                    },
                    {
                        title: 'Saving & Restoring',
                        body: 'Use "write memory" or "copy running-config startup-config" to save. Use "copy startup-config running-config" to restore.',
                        code: 'Save:   write memory\nRestore: copy startup-config running-config'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            40: {
                id: 40,
                title: 'Configuration Modes',
                scenario: 'Navigate between global config, interface config, and other sub-modes.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface', 'line',
                    'vlan', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enter global config mode', cmd: 'configure terminal' },
                    { text: 'Enter interface config mode', cmd: 'interface FastEthernet0/1' },
                    { text: 'Return to privileged mode', cmd: 'end' }
                ],
                concepts: [
                    {
                        title: 'Config Sub-modes',
                        body: 'From global config (#), you can enter interface config (config-if)#, line config (config-line)#, VLAN config (config-vlan)#, and more.',
                        code: 'Switch# configure terminal\nSwitch(config)# interface FastEthernet0/1\nSwitch(config-if)#'
                    },
                    {
                        title: 'Exiting Modes',
                        body: '"exit" goes back one level. "end" jumps directly to privileged EXEC. "Ctrl+Z" also exits to privileged.',
                        code: 'Switch(config-if)# exit\nSwitch(config)# end\nSwitch#'
                    },
                    {
                        title: 'Prompt Indicators',
                        body: 'The prompt tells you which mode you are in: (config)#, (config-if)#, (config-line)#, (config-vlan)#.',
                        code: '(config)#     → global config\n(config-if)#   → interface config\n(config-line)# → VTY/consoles'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            41: {
                id: 41,
                title: 'Interface Naming & Range',
                scenario: 'Learn how Cisco names interfaces and how to configure multiple ports at once with interface range.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface', 'interface range',
                    'show interfaces status', 'show interfaces',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enter interface config', cmd: 'interface FastEthernet0/1' },
                    { text: 'Configure interface range', cmd: 'interface range FastEthernet0/1 - 4' },
                    { text: 'Verify interfaces', cmd: 'show interfaces status' }
                ],
                concepts: [
                    {
                        title: 'Interface Naming',
                        body: 'Cisco interfaces are named by type, module, and port. Examples: FastEthernet0/1, GigabitEthernet0/1, VLAN1.',
                        code: 'FastEthernet0/1 → Fa0/1\nGigabitEthernet0/1 → Gi0/1\nVLAN 1 → Vlan1'
                    },
                    {
                        title: 'Interface Range',
                        body: 'Use "interface range" to configure multiple ports at once. Saves time on access ports or shutdown commands.',
                        code: 'SW1(config)# interface range FastEthernet0/1 - 4\nSW1(config-if-range)# switchport mode access'
                    },
                    {
                        title: 'Verifying Interfaces',
                        body: '"show interfaces status" gives a quick overview. "show interfaces" gives detailed info per port.',
                        code: 'SW1# show interfaces status\nPort   Status   Vlan   Duplex  Speed\nFa0/1  connected 1     a-full  a-100'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            42: {
                id: 42,
                title: 'Basic IOS Error Messages',
                scenario: 'Recognize and interpret common IOS error messages.',
                duration: '5 min',
                allowedCommands: [
                    'enable', 'show running-config', 'show interfaces status',
                    'show ip interface brief', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View running config', cmd: 'show running-config' },
                    { text: 'View interface status', cmd: 'show interfaces status' }
                ],
                concepts: [
                    {
                        title: '% Invalid Input',
                        body: 'Appears when you type a command IOS does not recognize. Check spelling and mode.',
                        code: 'SW1# shwow version\n         ^\n% Invalid input detected at \'^\' marker'
                    },
                    {
                        title: '% Incomplete Command',
                        body: 'Appears when a command is missing required parameters. IOS does not know what to do.',
                        code: 'SW1# show ip\n% Incomplete command'
                    },
                    {
                        title: '% Ambiguous Command',
                        body: 'Appears when an abbreviation matches multiple commands. Type more characters or use ?.',
                        code: 'SW1# sh ip\n% Ambiguous command\nSW1# show ip ?'
                    },
                    {
                        title: '% Bad IP Address',
                        body: 'Appears when you enter an invalid IP address or mask.',
                        code: 'SW1(config-if)# ip address 999.999.999.999 255.255.255.0\n% Bad IP address'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            }
        }
    },

    // ============================================================
    // STAGE 2: LEARN FOUNDATION
    // ============================================================
    'learn-foundation': {
        id: 'learn-foundation',
        stage: 2,
        stageName: 'Learn Foundation',
        lessons: {

            7: {
                id: 7,
                title: 'Network Foundations',
                scenario: 'Inspect the switch to understand frames, MAC addresses, and how the switch learns.',
                duration: '10 min',
                allowedCommands: [
                    'enable', 'show version', 'show interfaces status',
                    'show mac address-table', 'show vlan brief',
                    'show running-config', 'show ip interface', 'show clock',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View the switch version', cmd: 'show version' },
                    { text: 'Check interface status', cmd: 'show interfaces status' },
                    { text: 'View the MAC address table', cmd: 'show mac address-table' }
                ],
                concepts: [
                    {
                        title: 'Frames & Packets',
                        body: 'Data travels as frames (Layer 2) inside packets (Layer 3). Frames carry MAC addresses; packets carry IP addresses.',
                        code: 'Frame: [MAC src][MAC dst][Packet]\nPacket: [IP src][IP dst][Data]'
                    },
                    {
                        title: 'MAC Addresses',
                        body: 'Every NIC has a unique 48-bit MAC address like 00:1B:2F:3C:4D:5E. Switches use MACs to forward frames to the right port.',
                        code: 'PC-A MAC: 00:1B:2F:3C:4D:5E\nPC-B MAC: 00:1B:2F:3C:4D:5F'
                    },
                    {
                        title: 'How Switches Learn',
                        body: 'A switch learns MAC addresses by reading the source MAC of every frame. It builds a MAC address table mapping MAC → port.',
                        code: 'Switch# show mac address-table\nMAC Address    Port\n00:1B:2F:3C:4D:5E  Fa0/1\n00:1B:2F:3C:4D:5F  Fa0/2'
                    },
                    {
                        title: 'Broadcast Behavior',
                        body: 'If the switch does not know a destination MAC, it floods the frame out all ports (except the source). This is how ARP works.',
                        code: 'Unknown MAC → flood to all ports'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            8: {
                id: 8,
                title: 'MAC Tables & ARP',
                scenario: 'Understand how the switch builds its MAC table and how ARP resolves IP to MAC.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'show mac address-table', 'show ip interface',
                    'show interfaces status', 'show vlan brief',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View the MAC address table', cmd: 'show mac address-table' },
                    { text: 'Check the switch IP interface', cmd: 'show ip interface' }
                ],
                concepts: [
                    {
                        title: 'MAC Address Table',
                        body: 'The switch learns source MACs and stores them with the port they arrived on. Dynamic entries age out after 300 seconds.',
                        code: 'Vlan  Mac Address       Type     Ports\n1     00:1B:2F:3C:4D:5E  DYNAMIC  Fa0/1'
                    },
                    {
                        title: 'ARP (Address Resolution Protocol)',
                        body: 'ARP maps IP addresses to MAC addresses. When a device knows the IP but not the MAC, it broadcasts an ARP request.',
                        code: 'Who has 192.168.1.10? → broadcast\n192.168.1.10 replies with its MAC'
                    },
                    {
                        title: 'show ip interface',
                        body: 'Shows the management IP of the switch (VLAN 1 interface). Used for remote management.',
                        code: 'SW1# show ip interface\nVlan1 is up, line protocol is up\nInternet address is 192.168.1.2/24'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            43: {
                id: 43,
                title: 'Ethernet Frame',
                scenario: 'Understand the structure of an Ethernet frame and how data is encapsulated.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'show interfaces status', 'show interfaces',
                    'show mac address-table', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View interface status', cmd: 'show interfaces status' },
                    { text: 'View interface details', cmd: 'show interfaces' }
                ],
                concepts: [
                    {
                        title: 'Ethernet Frame Structure',
                        body: 'An Ethernet frame has: Preamble (7 bytes), SFD (1 byte), Destination MAC (6), Source MAC (6), Length/Type (2), Payload (46-1500), FCS (4).',
                        code: 'Preamble | SFD | Dst MAC | Src MAC | Type | Payload | FCS\n   7B  | 1B  |  6B   |  6B   | 2B   | 46-1500B | 4B'
                    },
                    {
                        title: 'Frame Types',
                        body: 'Ethernet II (DIX) is the most common. It has a Type field (0x0800 = IPv4, 0x0806 = ARP).',
                        code: 'Type 0x0800 → IPv4 packet\nType 0x0806 → ARP packet'
                    },
                    {
                        title: 'MTU',
                        body: 'Maximum Transmission Unit is 1500 bytes for standard Ethernet. Larger packets are fragmented.',
                        code: 'MTU = 1500 bytes (standard Ethernet)\nJumbo frames = 9000 bytes'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            44: {
                id: 44,
                title: 'MAC Addresses',
                scenario: 'Understand MAC address format, types, and how they identify devices.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'show mac address-table', 'show interfaces',
                    'show interfaces status', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View the MAC address table', cmd: 'show mac address-table' },
                    { text: 'View interface details', cmd: 'show interfaces' }
                ],
                concepts: [
                    {
                        title: 'MAC Address Format',
                        body: 'A MAC address is 48 bits (6 bytes) written as 00:1B:2F:3C:4D:5E. The first 3 bytes are the OUI (vendor), last 3 are the host.',
                        code: '00:1B:2F → Cisco OUI\n3C:4D:5E → Host portion'
                    },
                    {
                        title: 'MAC Address Types',
                        body: 'Unicast (bit 0 of first octet = 0), Multicast (bit 0 = 1), Broadcast (FF:FF:FF:FF:FF:FF).',
                        code: 'Unicast:   00:1B:2F:3C:4D:5E\nMulticast: 01:00:5E:00:00:01\nBroadcast:  FF:FF:FF:FF:FF:FF'
                    },
                    {
                        title: 'Burned-in vs Assigned',
                        body: 'BIA (Burned-in Address) is factory-set. AUI (Administered) is software-assigned. The 2nd bit of the first octet indicates this.',
                        code: 'BIA: 00:1B:2F (bit 1 = 0)\nAssigned: 02:1B:2F (bit 1 = 1)'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            45: {
                id: 45,
                title: 'Unicast, Broadcast & Multicast',
                scenario: 'Understand the three types of traffic: unicast, broadcast, and multicast.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'show mac address-table', 'show interfaces',
                    'show interfaces status', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View the MAC address table', cmd: 'show mac address-table' },
                    { text: 'View interface status', cmd: 'show interfaces status' }
                ],
                concepts: [
                    {
                        title: 'Unicast',
                        body: 'One-to-one communication. The frame has a specific destination MAC. Switches forward unicast frames to one port.',
                        code: 'PC-A → PC-B: unicast\nDst MAC: 00:1B:2F:3C:4D:5F'
                    },
                    {
                        title: 'Broadcast',
                        body: 'One-to-all communication. Destination is FF:FF:FF:FF:FF:FF. Switches flood broadcasts out all ports in the VLAN.',
                        code: 'ARP request: broadcast\nDst MAC: FF:FF:FF:FF:FF:FF'
                    },
                    {
                        title: 'Multicast',
                        body: 'One-to-many communication. Destination is a multicast MAC (01:00:5E:xx:xx:xx). Switches flood multicast like broadcast.',
                        code: 'Video stream: multicast\nDst MAC: 01:00:5E:00:00:01'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            46: {
                id: 46,
                title: 'Collision Domain vs Broadcast Domain',
                scenario: 'Understand the difference between collision domains and broadcast domains.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'show interfaces status', 'show interfaces',
                    'show mac address-table', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View interface status', cmd: 'show interfaces status' },
                    { text: 'View interface details', cmd: 'show interfaces' }
                ],
                concepts: [
                    {
                        title: 'Collision Domain',
                        body: 'A collision domain is a network segment where packets can collide. Each switch port is its own collision domain.',
                        code: 'Hub: 1 collision domain (all ports)\nSwitch: 1 collision domain per port'
                    },
                    {
                        title: 'Broadcast Domain',
                        body: 'A broadcast domain is a group of devices that receive each other broadcast frames. All ports in a VLAN share one broadcast domain.',
                        code: 'VLAN 1: broadcast domain\nVLAN 10: broadcast domain\nEach VLAN = separate broadcast domain'
                    },
                    {
                        title: 'Switch vs Hub',
                        body: 'A switch creates a separate collision domain per port but shares broadcast domains per VLAN. A hub shares both.',
                        code: 'Hub:  shared collision + broadcast domain\nSwitch: separate collision, shared broadcast per VLAN'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            47: {
                id: 47,
                title: 'Duplex & Speed',
                scenario: 'Understand full vs half duplex and interface speed settings.',
                duration: '6 min',
                allowedCommands: [
                    'enable', 'show interfaces', 'show interfaces status',
                    'configure terminal', 'interface', 'speed', 'duplex',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View interface details', cmd: 'show interfaces' },
                    { text: 'Set speed to 100', cmd: 'speed 100' },
                    { text: 'Set full duplex', cmd: 'duplex full' }
                ],
                concepts: [
                    {
                        title: 'Duplex Modes',
                        body: 'Half-duplex: devices take turns transmitting (like a hub). Full-duplex: devices can send and receive simultaneously (like a switch).',
                        code: 'Half-duplex: 1 direction at a time\nFull-duplex:  both directions at once'
                    },
                    {
                        title: 'Speed',
                        body: 'Speed is the data rate: 10, 100, 1000 Mbps. Auto-negotiation is the default.',
                        code: 'SW1(config-if)# speed 100\nSW1(config-if)# duplex full'
                    },
                    {
                        title: 'Duplex Mismatch',
                        body: 'If one side is full and the other is half, you get late collisions and poor performance.',
                        code: 'Side A: full-duplex\nSide B: half-duplex → collisions!'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            48: {
                id: 48,
                title: 'Auto-Negotiation',
                scenario: 'Understand how auto-negotiation works and how to configure speed/duplex manually.',
                duration: '6 min',
                allowedCommands: [
                    'enable', 'show interfaces', 'show interfaces status',
                    'configure terminal', 'interface', 'speed', 'duplex',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View interface status', cmd: 'show interfaces status' },
                    { text: 'Disable auto-negotiation', cmd: 'speed 100' }
                ],
                concepts: [
                    {
                        title: 'Auto-Negotiation',
                        body: 'Auto-negotiation is an IEEE 802.3z standard. Devices exchange capabilities and choose the highest common speed/duplex.',
                        code: 'SW1(config-if)# speed auto\nSW1(config-if)# duplex auto'
                    },
                    {
                        title: 'Manual Configuration',
                        body: 'If you set speed manually, duplex must also be set manually. Setting only speed disables auto-negotiation.',
                        code: 'SW1(config-if)# speed 100\nSW1(config-if)# duplex full'
                    },
                    {
                        title: 'Best Practice',
                        body: 'Leave auto-negotiation enabled unless troubleshooting. Manual settings can cause mismatches.',
                        code: 'Default: speed auto, duplex auto\nManual: speed 100, duplex full'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            49: {
                id: 49,
                title: 'ARP (Address Resolution Protocol)',
                scenario: 'Understand how ARP resolves IP addresses to MAC addresses.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'show ip arp', 'show interfaces',
                    'show ip interface', 'ping', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View ARP table', cmd: 'show ip arp' },
                    { text: 'View IP interface', cmd: 'show ip interface' }
                ],
                concepts: [
                    {
                        title: 'What is ARP?',
                        body: 'ARP maps IP addresses to MAC addresses. When a device knows the IP but not the MAC, it broadcasts an ARP request.',
                        code: 'Who has 192.168.1.10? Tell 192.168.1.2\n192.168.1.10 is at 00:1B:2F:3C:4D:5E'
                    },
                    {
                        title: 'ARP Process',
                        body: '1. Check ARP cache. 2. If not found, broadcast ARP request. 3. Target replies with its MAC. 4. Cache the mapping.',
                        code: 'Step 1: Check ARP cache\nStep 2: Broadcast ARP request\nStep 3: Receive ARP reply\nStep 4: Cache MAC'
                    },
                    {
                        title: 'ARP Cache',
                        body: '"show ip arp" shows the ARP table. Entries expire after a timeout (typically 4 hours).',
                        code: 'SW1# show ip arp\nProtocol  Address      Age  MAC Address\nInternet  192.168.1.10  0   00:1B:2F:3C:4D:5E'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            50: {
                id: 50,
                title: 'Default Gateway Concept',
                scenario: 'Understand how a default gateway allows communication with remote networks.',
                duration: '6 min',
                allowedCommands: [
                    'enable', 'show ip interface', 'show running-config',
                    'show ip route', 'ping', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View IP interface', cmd: 'show ip interface' },
                    { text: 'View running config', cmd: 'show running-config' }
                ],
                concepts: [
                    {
                        title: 'Default Gateway',
                        body: 'A default gateway is the IP address of a router that forwards traffic to other networks. Without it, a device can only reach its local subnet.',
                        code: 'PC-A: 192.168.1.10/24\nGateway: 192.168.1.1\nWithout gateway: can only reach 192.168.1.x'
                    },
                    {
                        title: 'How It Works',
                        body: 'When a device wants to send to an IP outside its subnet, it sends the frame to the gateway MAC. The gateway routes it.',
                        code: 'PC-A → 10.0.0.5 (different subnet)\nPC-A sends to gateway MAC\nGateway routes to 10.0.0.5'
                    },
                    {
                        title: 'Verifying',
                        body: 'Use "ping" to test connectivity. "show ip interface" shows the configured gateway.',
                        code: 'SW1# ping 192.168.1.1\n!!!!!\nSuccess rate is 100 percent'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            51: {
                id: 51,
                title: 'IPv4 Addressing',
                scenario: 'Understand IPv4 address structure, classes, and private addressing.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'show ip interface', 'show ip interface brief',
                    'show running-config', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View IP interface', cmd: 'show ip interface' },
                    { text: 'View interface brief', cmd: 'show ip interface brief' }
                ],
                concepts: [
                    {
                        title: 'IPv4 Address Structure',
                        body: 'IPv4 addresses are 32 bits, written as 4 octets (e.g., 192.168.1.1). Each octet is 0-255.',
                        code: '192.168.1.1\n  8  8  8  8 = 32 bits'
                    },
                    {
                        title: 'Address Classes',
                        body: 'Class A (1-126), Class B (128-191), Class C (192-223). Class D is multicast, Class E is reserved.',
                        code: 'Class A: 10.x.x.x (8-bit network)\nClass B: 172.16-31.x.x (16-bit network)\nClass C: 192.168.x.x (24-bit network)'
                    },
                    {
                        title: 'Private Addresses',
                        body: 'Private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. Not routable on the internet.',
                        code: '10.0.0.0 - 10.255.255.255\n172.16.0.0 - 172.31.255.255\n192.168.0.0 - 192.168.255.255'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            52: {
                id: 52,
                title: 'Subnet Mask',
                scenario: 'Understand subnet masks, CIDR notation, and how they define network boundaries.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'show ip interface', 'show ip interface brief',
                    'show running-config', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View IP interface', cmd: 'show ip interface' },
                    { text: 'View interface brief', cmd: 'show ip interface brief' }
                ],
                concepts: [
                    {
                        title: 'Subnet Mask',
                        body: 'A subnet mask determines which part of an IP is the network and which is the host. 255.255.255.0 = /24.',
                        code: 'IP: 192.168.1.10\nMask: 255.255.255.0 (/24)\nNetwork: 192.168.1.0\nHost: 192.168.1.10'
                    },
                    {
                        title: 'CIDR Notation',
                        body: 'CIDR (Classless Inter-Domain Routing) uses /N to indicate the number of network bits. /24 = 255.255.255.0.',
                        code: '/8  = 255.0.0.0\n/16 = 255.255.0.0\n/24 = 255.255.255.0\n/30 = 255.255.255.252'
                    },
                    {
                        title: 'Subnetting',
                        body: 'Subnetting divides a large network into smaller subnets. Each subnet has a network address, hosts, and a broadcast address.',
                        code: '192.168.1.0/24 → 256 addresses (254 hosts)\n192.168.1.0/25 → 128 addresses (126 hosts)'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            53: {
                id: 53,
                title: 'MAC Learning & Flooding',
                scenario: 'Understand how switches learn MAC addresses and handle unknown unicast and broadcast flooding.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'show mac address-table', 'show interfaces',
                    'show interfaces status', 'clear mac address-table',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View MAC address table', cmd: 'show mac address-table' },
                    { text: 'View interface status', cmd: 'show interfaces status' }
                ],
                concepts: [
                    {
                        title: 'How Switches Learn',
                        body: 'A switch learns MAC addresses by reading the source MAC of every frame. It builds a MAC table mapping MAC → port.',
                        code: 'Frame arrives on Fa0/1 with src MAC 00:1B:2F:3C:4D:5E\nSwitch learns: 00:1B:2F:3C:4D:5E → Fa0/1'
                    },
                    {
                        title: 'Unknown Unicast',
                        body: 'If the switch does not know the destination MAC, it floods the frame out all ports in the VLAN (except the source).',
                        code: 'Unknown unicast → flood to all ports in VLAN'
                    },
                    {
                        title: 'Broadcast Flooding',
                        body: 'Broadcast frames (FF:FF:FF:FF:FF:FF) are flooded to all ports in the VLAN. This is how ARP works.',
                        code: 'Broadcast → flood to all ports in VLAN\nARP request → broadcast → all ports'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            }
        }
    },

    // ============================================================
    // STAGE 3: VLAN & TRUNKING
    // ============================================================
    'vlan-trunking': {
        id: 'vlan-trunking',
        stage: 3,
        stageName: 'VLAN & Trunking',
        lessons: {

            9: {
                id: 9,
                title: 'Configure Access VLANs',
                scenario: 'Create VLAN 20, name it ENGINEERING, and assign PC-A to it. Verify the access port.',
                duration: '12 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'vlan', 'name', 'interface',
                    'switchport mode access', 'switchport access vlan',
                    'show vlan brief', 'show interfaces status', 'show running-config',
                    'write memory', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Create VLAN 20', cmd: 'vlan 20' },
                    { text: 'Name it ENGINEERING', cmd: 'name ENGINEERING' },
                    { text: 'Assign Fa0/1 to VLAN 20', cmd: 'switchport access vlan 20' },
                    { text: 'Verify the access port', cmd: 'show vlan brief' }
                ],
                concepts: [
                    {
                        title: 'What is a VLAN?',
                        body: 'A VLAN is a virtual broadcast domain. Devices in VLAN 10 cannot see broadcasts from VLAN 20, even on the same switch.',
                        code: 'VLAN 10 = SALES\nVLAN 20 = ENGINEERING'
                    },
                    {
                        title: 'Creating a VLAN',
                        body: 'Create a VLAN in global config, then give it a name. The name is documentation — it tells you what the VLAN is for.',
                        code: 'SW1(config)# vlan 20\nSW1(config-vlan)# name ENGINEERING'
                    },
                    {
                        title: 'Assigning Access Ports',
                        body: 'An access port belongs to one VLAN. Use "switchport mode access" then "switchport access vlan 20" to place a port in VLAN 20.',
                        code: 'SW1(config)# interface FastEthernet0/1\nSW1(config-if)# switchport mode access\nSW1(config-if)# switchport access vlan 20'
                    },
                    {
                        title: 'Verifying VLANs',
                        body: 'Always verify. "show vlan brief" shows every VLAN and which ports are assigned to it.',
                        code: 'SW1# show vlan brief\nVLAN Name          Status  Ports\n20   ENGINEERING   active  Fa0/1'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '20', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            10: {
                id: 10,
                title: 'Trunk Ports & VLAN Verification',
                scenario: 'Configure a trunk port between switches and verify VLANs are carried correctly.',
                duration: '10 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface',
                    'switchport mode trunk', 'show interfaces trunk',
                    'show vlan brief', 'show interfaces status',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enter GigabitEthernet0/1 config', cmd: 'interface GigabitEthernet0/1' },
                    { text: 'Set the port to trunk mode', cmd: 'switchport mode trunk' },
                    { text: 'Verify the trunk', cmd: 'show interfaces trunk' }
                ],
                concepts: [
                    {
                        title: 'Trunk Ports',
                        body: 'A trunk carries multiple VLANs between switches. It uses 802.1Q tagging so each frame knows its VLAN.',
                        code: 'SW1(config)# interface GigabitEthernet0/1\nSW1(config-if)# switchport mode trunk'
                    },
                    {
                        title: 'Access vs Trunk',
                        body: 'Access ports carry one VLAN (untagged). Trunk ports carry many VLANs (tagged with 802.1Q).',
                        code: 'Access: Fa0/1 → VLAN 20\nTrunk:  Gi0/1 → VLANs 1-4094'
                    },
                    {
                        title: 'Verifying Trunks',
                        body: '"show interfaces trunk" shows trunk status, encapsulation, and which VLANs are allowed.',
                        code: 'SW1# show interfaces trunk\nPort   Mode  Encapsulation  Status\nGi0/1  on    802.1q         trunking'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            11: {
                id: 11,
                title: 'Native VLAN & Trunk Configuration',
                scenario: 'Configure the native VLAN on a trunk and understand untagged traffic.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface',
                    'switchport mode trunk', 'switchport trunk native vlan',
                    'show interfaces trunk', 'show vlan brief',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Set trunk native VLAN to 99', cmd: 'switchport trunk native vlan 99' },
                    { text: 'Verify the trunk', cmd: 'show interfaces trunk' }
                ],
                concepts: [
                    {
                        title: 'Native VLAN',
                        body: 'The native VLAN carries untagged traffic on a trunk. By default it is VLAN 1. Best practice is to change it to an unused VLAN.',
                        code: 'SW1(config-if)# switchport trunk native vlan 99'
                    },
                    {
                        title: 'Why Change Native VLAN?',
                        body: 'VLAN 1 is the default for everything. Changing the native VLAN prevents VLAN hopping attacks and accidental misconfigurations.',
                        code: 'Default native: VLAN 1 (avoid)\nSecure native:   VLAN 99'
                    },
                    {
                        title: 'Verifying Native VLAN',
                        body: '"show interfaces trunk" displays the native VLAN for each trunk port.',
                        code: 'SW1# show interfaces trunk\nPort   Native VLAN\nGi0/1  99'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            12: {
                id: 12,
                title: 'VLAN Trunking Protocol (VTP)',
                scenario: 'Understand VTP modes and configure VTP on the switch.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'vtp mode', 'vtp domain',
                    'show vtp status', 'show vlan brief',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Set VTP mode to transparent', cmd: 'vtp mode transparent' },
                    { text: 'Set VTP domain', cmd: 'vtp domain CCNA' },
                    { text: 'Verify VTP status', cmd: 'show vtp status' }
                ],
                concepts: [
                    {
                        title: 'What is VTP?',
                        body: 'VTP (VLAN Trunking Protocol) propagates VLAN information across trunk links. Modes: Server, Client, Transparent.',
                        code: 'Server: creates VLANs, propagates\nClient: receives VLANs\nTransparent: local only, forwards'
                    },
                    {
                        title: 'VTP Modes',
                        body: 'Server stores and advertises VLANs. Client only learns. Transparent keeps VLANs local and forwards advertisements.',
                        code: 'SW1(config)# vtp mode transparent\nSW1(config)# vtp domain CCNA'
                    },
                    {
                        title: 'Verifying VTP',
                        body: '"show vtp status" shows VTP version, domain, mode, and revision number.',
                        code: 'SW1# show vtp status\nVTP Version: 2\nDomain Name: CCNA\nVTP Mode: Transparent'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            54: {
                id: 54,
                title: 'VLAN Database - VLAN Creation & Deletion',
                scenario: 'Use the VLAN database mode to create, name, and delete VLANs on the switch.',
                duration: '9 min',
                allowedCommands: [
                    'enable', 'vlan database', 'vlan', 'name',
                    'no vlan', 'delete', 'show vlan brief',
                    'show running-config', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enter VLAN database mode', cmd: 'vlan database' },
                    { text: 'Create VLAN 30', cmd: 'vlan 30' },
                    { text: 'Name the VLAN SALES', cmd: 'name SALES' }
                ],
                concepts: [
                    {
                        title: 'VLAN Database Mode',
                        body: 'The VLAN database is an alternative way to manage VLANs. Type "vlan database" to enter it. The prompt becomes "(vlan)#".',
                        code: 'SW1# vlan database\nSW1(vlan)#'
                    },
                    {
                        title: 'Creating a VLAN via Database',
                        body: 'In VLAN database mode, use "vlan <id>" to create a new VLAN. Then give it a meaningful name.',
                        code: 'SW1(vlan)# vlan 30\nVLAN 30 added:\n    Name: VLAN0030\nSW1(vlan)# name SALES'
                    },
                    {
                        title: 'Deleting a VLAN',
                        body: 'Use "no vlan <id>" to delete. Deleting a VLAN removes it from all ports — those ports return to the default VLAN.',
                        code: 'SW1(vlan)# no vlan 30\nDeleting VLAN 30...\nVLAN 30 deleted'
                    },
                    {
                        title: 'Verifying VLAN Database',
                        body: 'After exiting, use "show vlan brief" to confirm the VLAN was created or deleted correctly.',
                        code: 'SW1(vlan)# exit\nAPPLY completed.\nSW1# show vlan brief'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '30', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            55: {
                id: 55,
                title: 'Voice VLAN',
                scenario: 'Configure a voice VLAN so IP phones and PCs share one port without conflict.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface', 'vlan',
                    'name', 'switchport voice vlan', 'switchport access vlan',
                    'switchport mode access', 'show vlan brief', 'show interfaces status',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Create voice VLAN 50', cmd: 'vlan 50' },
                    { text: 'Set port to access mode', cmd: 'switchport mode access' },
                    { text: 'Assign voice VLAN 50', cmd: 'switchport voice vlan 50' }
                ],
                concepts: [
                    {
                        title: 'What is a Voice VLAN?',
                        body: 'A voice VLAN (auxiliary VLAN) carries VoIP telephone traffic. The phone tags its traffic with the voice VLAN, while the PC behind the phone stays in the data VLAN.',
                        code: 'IP Phone → Voice VLAN 50\nPC via phone → Data VLAN 20'
                    },
                    {
                        title: 'Configuring Voice VLAN',
                        body: 'Create the voice VLAN, set the port to access mode, then assign the voice VLAN with "switchport voice vlan".',
                        code: 'SW1(config)# vlan 50\nSW1(config-vlan)# name VOICE\nSW1(config-if)# switchport mode access\nSW1(config-if)# switchport voice vlan 50'
                    },
                    {
                        title: 'Verifying Voice VLAN',
                        body: '"show interfaces status" shows only the Vlan column for ports. Use "show run interface" to see both data and voice VLANs.',
                        code: 'SW1# show running-config interface Fa0/1\nswitchport access vlan 20\nswitchport voice vlan 50'
                    },
                    {
                        title: 'Data + Voice on One Port',
                        body: 'When both are configured, untagged PC traffic goes to the access VLAN and tagged phone traffic goes to the voice VLAN.',
                        code: 'Fa0/1: data VLAN 20 + voice VLAN 50'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '20 (voice 50)', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            56: {
                id: 56,
                title: 'VLAN Pruning Concept',
                scenario: 'Understand why VLAN pruning matters and how to control which VLANs cross a trunk.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface',
                    'switchport trunk allowed vlan', 'switchport trunk allowed vlan add',
                    'switchport trunk allowed vlan remove', 'show interfaces trunk',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Allow only VLANs 10-20 on trunk', cmd: 'switchport trunk allowed vlan 10-20' },
                    { text: 'Verify trunk allowed VLANs', cmd: 'show interfaces trunk' }
                ],
                concepts: [
                    {
                        title: 'What is VLAN Pruning?',
                        body: 'VLAN pruning prevents unnecessary VLAN traffic from crossing trunk links. A trunk only forwards frames for VLANs that actually exist on the far end.',
                        code: 'Trunk Gi0/1: carries VLANs 1-4094 by default\nAfter pruning: only VLANs 10-20 cross'
                    },
                    {
                        title: 'Manual Pruning with Allowed VLANs',
                        body: 'On Cisco IOS, use "switchport trunk allowed vlan" to manually prune. Use "add" to keep existing allowed VLANs.',
                        code: 'SW1(config-if)# switchport trunk allowed vlan 10-20\nSW1(config-if)# switchport trunk allowed vlan add 30'
                    },
                    {
                        title: 'Restoring All VLANs',
                        body: 'Use the keyword "all" to restore the default of carrying every VLAN over the trunk.',
                        code: 'SW1(config-if)# switchport trunk allowed vlan all'
                    },
                    {
                        title: 'Why Prune?',
                        body: 'Pruning reduces unnecessary broadcasts, multicasts, and inefficiency over trunk links. It is especially useful on links to switches/distribution layers that do not need every VLAN.',
                        code: 'Less unnecessary traffic → better use of trunk bandwidth'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            57: {
                id: 57,
                title: 'VLAN Tagging',
                scenario: 'Understand 802.1Q tagging and how trunk frames identify their VLAN.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'show interfaces trunk', 'show interfaces switchport',
                    'show interfaces', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View trunk details', cmd: 'show interfaces trunk' },
                    { text: 'View switchport details', cmd: 'show interfaces switchport' }
                ],
                concepts: [
                    {
                        title: 'Why Tag Frames?',
                        body: 'When multiple VLANs cross one physical link, frames need a tag so the receiving switch knows which VLAN they belong to. This is the job of 802.1Q.',
                        code: 'VLAN 10 frame + VLAN 20 frame → one trunk\nTrunk frame = original frame + 802.1Q tag'
                    },
                    {
                        title: '802.1Q Tag Structure',
                        body: 'The 802.1Q tag is 4 bytes inserted after the source MAC: Tag Protocol ID (TPID) + Priority + VLAN ID (VID, 12 bits = 1-4094).',
                        code: '| Dst MAC | Src MAC | [TPID + VID] | Payload | FCS |\n                      ↑ 802.1Q tag'
                    },
                    {
                        title: 'Tagged vs Untagged',
                        body: 'Access ports send untagged frames. Trunk ports tag all frames EXCEPT the native VLAN, which is sent untagged.',
                        code: 'Access: Fa0/1 → untagged frame\nTrunk: Gi0/1 → tagged + native VLAN untagged'
                    },
                    {
                        title: 'Verifying Tagging',
                        body: '"show interfaces trunk" shows operational mode and encapsulation. "show interfaces switchport" shows switchport admin/operational details.',
                        code: 'SW1# show interfaces trunk\nPort  Mode  Encapsulation  Status  Native vlan\nGi0/1 on    802.1q        trunking  99'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            58: {
                id: 58,
                title: 'VTP Modes & Versions',
                scenario: 'Configure VTP modes and understand how VTP server, client, and transparent behave.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'vtp mode', 'vtp domain',
                    'vtp version', 'vtp password', 'show vtp status',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Set VTP mode to server', cmd: 'vtp mode server' },
                    { text: 'Set VTP version to 2', cmd: 'vtp version 2' },
                    { text: 'Verify VTP status', cmd: 'show vtp status' }
                ],
                concepts: [
                    {
                        title: 'VTP Modes',
                        body: 'VTP has three modes: Server (creates & advertises VLANs), Client (stores & learns, cannot create VLANs), Transparent (local VLANs only, forwards VTP messages).',
                        code: 'Server:     create VLANs, propagates\nClient:     learns VLANs, no create\nTransparent: local only, forwards'
                    },
                    {
                        title: 'VTP Versions',
                        body: 'VTPv1 is the original. VTPv2 adds support for Token Ring and better error handling. VTPv3 supports extended VLANs and password-security features. All switches in a domain should use the same version.',
                        code: 'Version 1: classic\nVersion 2: Token Ring support\nVersion 3: extended VLANs + security'
                    },
                    {
                        title: 'VTP Domain & Revision',
                        body: 'The domain name and revision number identify VTP messages. A higher revision number wins. Be careful — a switch with a high revision can wipe VLANs in the domain.',
                        code: 'SW1(config)# vtp domain CCNA\nSW1(config)# vtp version 2\nSW1(config)# vtp password cisco'
                    },
                    {
                        title: 'Verifying VTP',
                        body: '"show vtp status" shows the mode and version on each switch. Verify all switches agree.',
                        code: 'SW1# show vtp status\nVTP Version: 2\nDomain Name: CCNA\nVTP Mode: Server\nConfiguration Revision: 3'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            59: {
                id: 59,
                title: 'VTP Pruning',
                scenario: 'Enable VTP pruning to stop unnecessary VLAN traffic being sent for VLANs absent on the far switch.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'vtp pruning',
                    'show vtp status', 'show interfaces trunk',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enable VTP pruning', cmd: 'vtp pruning' },
                    { text: 'Verify pruning status', cmd: 'show vtp status' }
                ],
                concepts: [
                    {
                        title: 'What is VTP Pruning?',
                        body: 'VTP Pruning restricts traffic for VLANs on a trunk that are not present on the other end. If a VLAN has no ports on the neighboring switch, the VTP server does not forward it.',
                        code: 'Before: SW1 sends all VLANs over trunk\nAfter:  VTP pruning skips unused VLANs'
                    },
                    {
                        title: 'How VTP Pruning Works',
                        body: 'The VTP server maintains a "prune-eligible" list. Note it is only effective when VTP is in Server mode.',
                        code: 'Prune list → VLANs not to forward\nPruning applies only in VTP Server mode'
                    },
                    {
                        title: 'Enabling VTP Pruning',
                        body: 'Enable globally with "vtp pruning". Verify with "show vtp status" showing "VTP Pruning Mode: Enabled".',
                        code: 'SW1(config)# vtp pruning\nSW1# show vtp status\nVTP Pruning Mode: Enabled'
                    },
                    {
                        title: 'Pruning vs Allowed VLANs',
                        body: 'VTP pruning is automatic per-VLAN. "switchport trunk allowed vlan" is manual. Both reduce unnecessary trunk traffic.',
                        code: 'VTP pruning: dynamic/global\nAllowed VLANs: per-trunk/manual'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            60: {
                id: 60,
                title: 'Private VLAN Basics',
                scenario: 'Understand primary, secondary (isolated & community) VLANs and how to isolate hosts within a VLAN.',
                duration: '9 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'vlan', 'private-vlan',
                    'private-vlan primary', 'private-vlan isolated',
                    'private-vlan community', 'private-vlan association',
                    'switchport private-vlan host', 'switchport private-vlan mapping',
                    'show vlan private-vlan', 'show interfaces switchport',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Create a primary VLAN', cmd: 'vlan 100' },
                    { text: 'Set primary VLAN type', cmd: 'private-vlan primary' },
                    { text: 'Create isolated VLAN', cmd: 'vlan 101' },
                    { text: 'Verify private VLANs', cmd: 'show vlan private-vlan' }
                ],
                concepts: [
                    {
                        title: 'What is a Private VLAN?',
                        body: 'A private VLAN (PVLAN) turns one broadcast domain (primary VLAN) into multiple isolated (sec) sub-domains. Hosts within a set of secondary VLANs can be isolated or grouped.',
                        code: 'Primary VLAN 100\n  → Isolated VLAN 101 (hosts cannot → each other)\n  → Community VLAN 102 (hosts can talk)'
                    },
                    {
                        title: 'Primary & Secondary VLANs',
                        body: 'The primary VLAN is the overall broadcast domain. An "isolated" VLAN means hosts reach only the promiscuous port. "community" VLANs let the group communicate among itself.',
                        code: 'Primary: carries promiscuous port traffic\nIsolated: hosts cannot peers — only promiscuous\nCommunity: peers inside the group can chat'
                    },
                    {
                        title: 'Basic Configuration',
                        body: 'Configure the primary and secondary VLAN kinds, then associate them.',
                        code: 'SW1(config)# vlan 100\nSW1(config-vlan)# private-vlan primary\nSW1(config)# vlan 101\nSW1(config-vlan)# private-vlan isolated\nSW1(config-vlan)# private-vlan association 101'
                    },
                    {
                        title: 'Verifying Private VLANs',
                        body: '"show vlan private-vlan" shows the primary/secondary association table.',
                        code: 'SW1# show vlan private-vlan\nPrimary  Secondary  Ports\n100      101 (iso)  ...\n100      102 (com)  ...'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'private-vlan isolated', vlan: '100/101', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            }
        }
    },

    // ============================================================
    // STAGE 4: SPANNING TREE
    // ============================================================
    'spanning-tree': {
        id: 'spanning-tree',
        stage: 4,
        stageName: 'Spanning Tree',
        lessons: {

            13: {
                id: 13,
                title: 'STP Basics',
                scenario: 'Understand how STP prevents loops and identify the root bridge.',
                duration: '10 min',
                allowedCommands: [
                    'enable', 'show spanning-tree', 'show spanning-tree root',
                    'show interfaces status', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View spanning-tree status', cmd: 'show spanning-tree' },
                    { text: 'View the root bridge', cmd: 'show spanning-tree root' }
                ],
                concepts: [
                    {
                        title: 'Why STP?',
                        body: 'Without STP, redundant links create broadcast storms and MAC table instability. STP blocks redundant paths to create a loop-free topology.',
                        code: 'Redundant links → loops\nSTP → blocks one path → no loops'
                    },
                    {
                        title: 'Root Bridge Election',
                        body: 'The switch with the lowest bridge priority + MAC address becomes the root bridge. All other switches calculate the best path to root.',
                        code: 'Priority: 32768 (default)\nLowest priority + MAC = root'
                    },
                    {
                        title: 'Port Roles',
                        body: 'Root ports (best path to root), designated ports (forward), and blocked ports (prevent loops).',
                        code: 'Root Port: best path to root\nDesignated: forwards traffic\nBlocked:   prevents loops'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            14: {
                id: 14,
                title: 'STP Port States & Roles',
                scenario: 'Learn the STP port states: Blocking, Listening, Learning, Forwarding.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'show spanning-tree', 'show spanning-tree interface',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View STP for VLAN 1', cmd: 'show spanning-tree' },
                    { text: 'View STP for Fa0/1', cmd: 'show spanning-tree interface FastEthernet0/1' }
                ],
                concepts: [
                    {
                        title: 'STP Port States',
                        body: 'Blocking (no forwarding), Listening (learning topology), Learning (building MAC table), Forwarding (normal operation).',
                        code: 'Blocking → Listening → Learning → Forwarding'
                    },
                    {
                        title: 'Forward Delay',
                        body: 'It takes 15 seconds to go from Listening to Learning, and another 15 to Forwarding. Total ~30 seconds convergence.',
                        code: 'Listening: 15s\nLearning:  15s\nTotal:     ~30s'
                    },
                    {
                        title: 'PortFast',
                        body: 'PortFast skips STP states on access ports so devices connect instantly. Only use on ports connected to end devices.',
                        code: 'SW1(config-if)# spanning-tree portfast'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            15: {
                id: 15,
                title: 'Rapid PVST+ (RSTP)',
                scenario: 'Understand Rapid Spanning Tree and how it converges faster than classic STP.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'spanning-tree mode rapid-pvst',
                    'show spanning-tree', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enable Rapid PVST+', cmd: 'spanning-tree mode rapid-pvst' },
                    { text: 'Verify STP mode', cmd: 'show spanning-tree' }
                ],
                concepts: [
                    {
                        title: 'RSTP vs STP',
                        body: 'RSTP (802.1w) converges in seconds instead of 30-50 seconds. It uses port roles: root, designated, alternate, backup.',
                        code: 'STP:  ~30-50s convergence\nRSTP: ~1-3s convergence'
                    },
                    {
                        title: 'RSTP Port Roles',
                        body: 'Alternate ports provide a backup path to root. Backup ports back up designated ports. Both are discarding until needed.',
                        code: 'Root → forwards\nDesignated → forwards\nAlternate → backup to root\nBackup → backup to designated'
                    },
                    {
                        title: 'Enabling RSTP',
                        body: 'Cisco switches use Rapid PVST+ (per-VLAN RSTP). Enable it globally with "spanning-tree mode rapid-pvst".',
                        code: 'SW1(config)# spanning-tree mode rapid-pvst'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            16: {
                id: 16,
                title: 'PortFast & BPDU Guard',
                scenario: 'Configure PortFast and BPDU Guard on access ports for faster convergence and security.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface',
                    'spanning-tree portfast', 'spanning-tree bpduguard enable',
                    'show spanning-tree interface', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enable PortFast on Fa0/1', cmd: 'spanning-tree portfast' },
                    { text: 'Enable BPDU Guard', cmd: 'spanning-tree bpduguard enable' }
                ],
                concepts: [
                    {
                        title: 'PortFast',
                        body: 'PortFast puts an access port directly into Forwarding state, skipping STP delays. For end devices only.',
                        code: 'SW1(config-if)# spanning-tree portfast'
                    },
                    {
                        title: 'BPDU Guard',
                        body: 'BPDU Guard shuts down a port if it receives a BPDU. Prevents rogue switches from joining the network.',
                        code: 'SW1(config-if)# spanning-tree bpduguard enable\n%PM-4-ERR_DISABLE: bpduguard'
                    },
                    {
                        title: 'Best Practice',
                        body: 'Enable both PortFast and BPDU Guard on all access ports. Never on trunk ports.',
                        code: 'Access port: portfast + bpduguard\nTrunk port:  neither'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            61: {
                id: 61,
                title: 'STP Configuration',
                scenario: 'Configure root bridge priority, port costs, and verify spanning-tree operation.',
                duration: '9 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'spanning-tree vlan 1 root primary',
                    'spanning-tree vlan 1 priority', 'spanning-tree cost',
                    'show spanning-tree', 'show spanning-tree root',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Make this switch root', cmd: 'spanning-tree vlan 1 root primary' },
                    { text: 'Set custom priority', cmd: 'spanning-tree vlan 1 priority 4096' },
                    { text: 'Verify root bridge', cmd: 'show spanning-tree root' }
                ],
                concepts: [
                    {
                        title: 'Root Bridge Configuration',
                        body: 'Set a switch as root with "spanning-tree vlan 1 root primary". It automatically lowers the priority below the current root.',
                        code: 'SW1(config)# spanning-tree vlan 1 root primary'
                    },
                    {
                        title: 'Manual Priority',
                        body: 'Set priority manually with "spanning-tree vlan <id> priority". Values are multiples of 4096 (0, 4096, 8192 ... 61440).',
                        code: 'SW1(config)# spanning-tree vlan 1 priority 4096'
                    },
                    {
                        title: 'Port Cost',
                        body: 'A lower port cost makes a port the preferred path. Set it per interface with "spanning-tree cost".',
                        code: 'SW1(config-if)# spanning-tree cost 19\nSW1(config-if)# spanning-tree cost 4'
                    },
                    {
                        title: 'Verifying',
                        body: '"show spanning-tree root" confirms who is root. "show spanning-tree" shows ports, roles, and costs.',
                        code: 'SW1# show spanning-tree root\nRoot ID  Priority 32769, Address 00:1B:2F:3C:4D:5E\nRoot bridge is: SW1 (this switch)'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            62: {
                id: 62,
                title: 'RSTP Configuration',
                scenario: 'Enable Rapid PVST+ and configure edge ports for fast convergence.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'spanning-tree mode rapid-pvst',
                    'interface', 'spanning-tree portfast', 'spanning-tree link-type point-to-point',
                    'show spanning-tree', 'show spanning-tree vlan 1',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enable Rapid PVST+', cmd: 'spanning-tree mode rapid-pvst' },
                    { text: 'Enable PortFast on edge', cmd: 'spanning-tree portfast' },
                    { text: 'Verify RSTP mode', cmd: 'show spanning-tree' }
                ],
                concepts: [
                    {
                        title: 'Enabling Rapid PVST+',
                        body: 'Use "spanning-tree mode rapid-pvst" globally on all switches to run RSTP per VLAN.',
                        code: 'SW1(config)# spanning-tree mode rapid-pvst'
                    },
                    {
                        title: 'Edge Ports',
                        body: 'PortFast marks a port as edge. RSTP uses edge ports to skip the listening/learning states and converge instantly.',
                        code: 'SW1(config)# interface FastEthernet0/1\nSW1(config-if)# spanning-tree portfast'
                    },
                    {
                        title: 'Point-to-Point Links',
                        body: 'RSTP works best on full-duplex point-to-point links. Auto-detected; can force with "spanning-tree link-type point-to-point".',
                        code: 'SW1(config-if)# spanning-tree link-type point-to-point'
                    },
                    {
                        title: 'Verifying RSTP',
                        body: '"show spanning-tree" displays the mode and port roles. RSTP shows alternate/backup roles instead of big blocks.',
                        code: 'SW1# show spanning-tree\nSpanning tree enabled protocol rstp\nRole: ROOT, Altn, Desg, Bcku'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            63: {
                id: 63,
                title: 'MSTP (Multiple Spanning Tree)',
                scenario: 'Understand MSTP regions and configure Multiple Spanning Tree instances.',
                duration: '11 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'spanning-tree mode mst',
                    'spanning-tree mst configuration', 'instance', 'name', 'revision',
                    'spanning-tree mst 0 root primary', 'show spanning-tree mst',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enable MST mode', cmd: 'spanning-tree mode mst' },
                    { text: 'Enter MST config', cmd: 'spanning-tree mst configuration' },
                    { text: 'Map VLANs to instance', cmd: 'instance 1 vlan 10-20' }
                ],
                concepts: [
                    {
                        title: 'What is MSTP?',
                        body: 'MSTP (802.1s) is a spanning tree that can create multiple "instances". Each instance runs its own STP, grouping several VLANs together for better realistic control.',
                        code: 'Instance 0 → default (all VLANs)\nInstance 1 → VLAN 10-20\nInstance 2 → VLAN 30-40'
                    },
                    {
                        title: 'MST Regions',
                        body: 'Switches belong to a region if they share the same name, revision number, and instance-to-VLAN mapping. MSTP only sends BPDUs once per region.',
                        code: 'SW1(config)# spanning-tree mode mst\nSW1(config)# spanning-tree mst configuration\nSW1(config-mst)# name CCNA\nSW1(config-mst)# revision 1'
                    },
                    {
                        title: 'Instance Mapping',
                        body: 'Map VLANs to instances inside MST config. Instance 0 is the default and handles all unmapped VLANs.',
                        code: 'SW1(config-mst)# instance 1 vlan 10-20\nSW1(config-mst)# instance 2 vlan 30-40'
                    },
                    {
                        title: 'Root per Instance',
                        body: 'Each instance elects its own root bridge on every switch in the region.',
                        code: 'SW1(config)# spanning-tree mst 1 root primary'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            64: {
                id: 64,
                title: 'VTP Configuration',
                scenario: 'Configure VTP server, client, and transparent modes and manage the VLAN database over trunks.',
                duration: '9 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'vtp mode', 'vtp domain',
                    'vtp password', 'vtp pruning', 'show vtp status',
                    'show vlan brief', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Set VTP mode server', cmd: 'vtp mode server' },
                    { text: 'Set VTP domain', cmd: 'vtp domain CCNA' },
                    { text: 'Verify VTP status', cmd: 'show vtp status' }
                ],
                concepts: [
                    {
                        title: 'VTP Server',
                        body: 'Server stores the VLAN database and advertises it. Create VLANs here and they propagate to the whole domain.',
                        code: 'SW1(config)# vtp mode server\nSW1(config)# vtp domain CCNA\nSW1(config)# vlan 20\nSW1(config-vlan)# name ENGINEERING'
                    },
                    {
                        title: 'VTP Client',
                        body: 'Client receives VLANs from the server. Cannot create VLANs on its own.',
                        code: 'SW2(config)# vtp mode client\nSW2(config)# vtp domain CCNA'
                    },
                    {
                        title: 'VTP Transparent',
                        body: 'Transparent keeps VLANs local and forwards VTP messages but does not accept domain VLAN updates.',
                        code: 'SW3(config)# vtp mode transparent'
                    },
                    {
                        title: 'VTP Domain & Password',
                        body: 'All switches share the same domain name and password. Mismatches corrupt VLAN database sync.',
                        code: 'SW1(config)# vtp domain CCNA\nSW1(config)# vtp domain cisco\nSW1(config)# vtp pruning'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            65: {
                id: 65,
                title: 'DTP (Dynamic Trunking Protocol)',
                scenario: 'Understand DTP and configure trunk negotiation modes.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface',
                    'switchport mode trunk', 'switchport mode dynamic desirable',
                    'switchport mode dynamic auto', 'switchport nonegotiate',
                    'show interfaces trunk', 'show interfaces switchport',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Set trunk mode', cmd: 'switchport mode trunk' },
                    { text: 'Set dynamic desirable', cmd: 'switchport mode dynamic desirable' },
                    { text: 'Verify DTP', cmd: 'show interfaces trunk' }
                ],
                concepts: [
                    {
                        title: 'What is DTP?',
                        body: 'DTP (Dynamic TTP) runs on switch ports to negotiate trunking. Operational endpoint can be dynamic or static.',
                        code: 'DTP modes: trunk / desirable / auto / negotiate'
                    },
                    {
                        title: 'DTP Modes',
                        body: 'Hard (dynamic desirable) actively enables. Hard (dynamic auto) listens for trunk. Hard (nonegotiate) never forms a trunk, even if the neighbor asks.',
                        code: 'desirable + auto → trunk\nnonegotiate + anything → no trunk'
                    },
                    {
                        title: 'DLGR Security',
                        body: 'Do not use DTP on access ports — attackers can force an access port to become a trunk and jump VLANs.',
                        code: 'interface range Fa0/24\n switchport mode access\n switchport nonegotiate'
                    },
                    {
                        title: 'Verifying DTP',
                        body: '"show interfaces switchport" shows Administrative and Administrative Negotiation of Trunking.',
                        code: 'SW1# show allowed trunking\nFa0/1: DTP on = Dynamic Desirable'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            66: {
                id: 66,
                title: 'CDP Configuration',
                scenario: 'Configure and verify Cisco Discovery Protocol for neighbor discovery.',
                duration: '6 min',
                allowedCommands: [
                    'enable', 'show cdp neighbors', 'show cdp neighbors detail',
                    'configure terminal', 'cdp run', 'interface', 'no cdp enable',
                    'show cdp', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View CDP neighbors', cmd: 'show cdp neighbors' },
                    { text: 'Enable CDP globally', cmd: 'cdp run' },
                    { text: 'Verify CDP', cmd: 'show cdp' }
                ],
                concepts: [
                    {
                        title: 'What is CDP?',
                        body: 'CDP (Cisco Discovery Protocol) is Cisco-proprietary. It discovers directly connected devices and their platform.',
                        code: 'SW1# show cdp neighbors\nSW2 Gig 0/1 WS-C2960 Gig 0/1'
                    },
                    {
                        title: 'Enable / Disable CDP',
                        body: 'CDP is on by default. "cdp run" enables globally; "no cdp enable" disable it per-interface.',
                        code: 'SW1(config)# cdp run\nSW1(config)# interface\nSW1(config-if)# no cdp enable'
                    },
                    {
                        title: 'Security',
                        body: 'Disable CDP/LLDP on ports facing untrusted networks to prevent information leaking',
                        code: 'no cdp enable → hides from foreign networks'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            67: {
                id: 67,
                title: 'LLDP Configuration',
                scenario: 'Configure the open-standard LLDP and verify neighbor information.',
                duration: '6 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'lldp run',
                    'show lldp neighbors', 'show lldp status',
                    'lldp timer', 'lldp holdtime', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enable LLDP', cmd: 'lldp run' },
                    { text: 'View LLDP neighbors', cmd: 'show lldp neighbors' },
                    { text: 'Verify LLDP', cmd: 'show lldp status' }
                ],
                concepts: [
                    {
                        title: 'What is LLDP?',
                        body: 'LLDP (802.1AB) is the open-standard discovery protocol, like CDP but vendor-neutral.',
                        code: 'SW1(config)# lldp run\nSW1# show lldp neighbors'
                    },
                    {
                        title: 'Configuring LLDP',
                        body: 'Enable globally with "lldp run". Change "lldp timer" and "lldp holdtime" values as needed.',
                        code: 'SW1(config)# lldp run\nSW1(config)# lldp timer 30\nSW1(config)# lldp holdtime 120'
                    },
                    {
                        title: 'Verifying LLDP',
                        body: '"show lldp status" lists LLDP state; "show lldp neighbors detail" gives MAC, platform, and port info.',
                        code: 'SW1# show lldp status\nLLDP state: enabled\n'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            68: {
                id: 68,
                title: 'PVST+ Configuration',
                scenario: 'Configure per-VLAN Spanning Tree and a custom root bridge for posting network.',
                duration: '9 min',
                allowedCommands: [
                    'enable', 'configure', 'spanning-tree mode pvst',
                    'spanning-tree vlan 10 root-primary', 'spanning-tree vlan 20 priority 8192',
                    'show spanning-tree', 'show spanning-tree vlan 10',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Verify PVST+ mode', cmd: 'show spanning-tree' },
                    { text: 'Make root for VLAN 10', cmd: 'spanning-tree vlan 10 root primary' },
                    { text: 'Set root priority VLAN 20', cmd: 'spanning-tree vlan 20 priority 8192' }
                ],
                concepts: [
                    {
                        title: 'What is PVST+?',
                        body: 'PVST+ (Per-VLAN Spanning Tree) runs one Spanning Tree instance per VLAN. It is compatible with classic STP and RSTP.',
                        code: 'VLAN 1 → one ST tree\nVLAN 10 → one ST tree\nEach VLAN independent root'
                    },
                    {
                        title: 'Root per VLAN',
                        body: 'Each VLAN can have a different root bridge. Example: SW1 is root for VLAN 10, SW2 root for VLAN 20 to balance duplex summary traffic.',
                        code: 'SW1(config)# spanning-tree vlan 10 root primary\nSW1(config)# spanning-tree vlan 20 priority 8192'
                    },
                    {
                        title: 'Troubleshooting',
                        body: '"show spanning-tree vlan <id>" shows the instance and block ports for that VLAN only.',
                        code: 'SW1# showing spanning-tree vlan 10\nVLAN00010: ST is root\n Bridge ID: 32768 (primary 4096, sys-ext 10)'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            }
        }
    },

    // ============================================================
    // STAGE 5: SECURITY
    // ============================================================
    'security': {
        id: 'security',
        stage: 5,
        stageName: 'Security',
        lessons: {

            17: {
                id: 17,
                title: 'Port Security Basics',
                scenario: 'Secure access ports by limiting which MAC addresses can connect.',
                duration: '9 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface',
                    'switchport port-security', 'switchport port-security maximum',
                    'switchport port-security violation', 'show port-security',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enable port security', cmd: 'switchport port-security' },
                    { text: 'Set max MAC addresses to 1', cmd: 'switchport port-security maximum 1' },
                    { text: 'Set violation mode to shutdown', cmd: 'switchport port-security violation shutdown' },
                    { text: 'Verify port security', cmd: 'show port-security' }
                ],
                concepts: [
                    {
                        title: 'Port Security',
                        body: 'Port security limits how many MAC addresses can use a port. Prevents unauthorized devices from plugging in.',
                        code: 'SW1(config-if)# switchport port-security\nSW1(config-if)# switchport port-security maximum 1'
                    },
                    {
                        title: 'Violation Modes',
                        body: 'Shutdown (port disabled), Restrict (drops traffic + logs), Protect (drops silently). Shutdown is the default.',
                        code: 'shutdown → port disabled\nrestrict → drop + log\nprotect  → drop silently'
                    },
                    {
                        title: 'Verifying Port Security',
                        body: '"show port-security" shows secure ports, max addresses, current count, and violations.',
                        code: 'SW1# show port-security\nSecure Port  MaxSecureAddr  CurrentAddr  Violation\nFa0/1        1              1            0'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            18: {
                id: 18,
                title: 'Sticky MAC & Port Security',
                scenario: 'Use sticky MAC addresses to dynamically learn and secure devices.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface',
                    'switchport port-security', 'switchport port-security mac-address sticky',
                    'show port-security', 'show mac address-table',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enable sticky MAC learning', cmd: 'switchport port-security mac-address sticky' },
                    { text: 'Verify port security', cmd: 'show port-security' }
                ],
                concepts: [
                    {
                        title: 'Sticky MAC',
                        body: 'Sticky MAC dynamically learns MAC addresses and saves them to running-config. They persist until the config is cleared.',
                        code: 'SW1(config-if)# switchport port-security mac-address sticky'
                    },
                    {
                        title: 'How Sticky Works',
                        body: 'The first MAC seen on the port becomes sticky. It is added to running-config and the MAC table.',
                        code: 'Learned MAC → saved to running-config\nSticky entries survive reload if saved'
                    },
                    {
                        title: 'Verifying Sticky MACs',
                        body: '"show port-security" shows sticky MACs. "show mac address-table" shows them as STATIC entries.',
                        code: 'SW1# show port-security\nSecure MAC Addresses:\n00:1B:2F:3C:4D:5E (sticky)'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            28: {
                id: 28,
                title: 'DHCP Snooping',
                scenario: 'Protect the network from rogue DHCP servers with DHCP snooping.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'ip dhcp snooping',
                    'ip dhcp snooping vlan', 'interface', 'ip dhcp snooping trust',
                    'show ip dhcp snooping', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enable DHCP snooping', cmd: 'ip dhcp snooping' },
                    { text: 'Enable for VLAN 1', cmd: 'ip dhcp snooping vlan 1' },
                    { text: 'Trust the uplink port', cmd: 'ip dhcp snooping trust' },
                    { text: 'Verify DHCP snooping', cmd: 'show ip dhcp snooping' }
                ],
                concepts: [
                    {
                        title: 'DHCP Snooping',
                        body: 'DHCP snooping filters DHCP messages. Only trusted ports (uplinks) can send DHCP offers. Rogue DHCP servers are blocked.',
                        code: 'SW1(config)# ip dhcp snooping\nSW1(config)# ip dhcp snooping vlan 1'
                    },
                    {
                        title: 'Trusted vs Untrusted',
                        body: 'Trusted ports connect to legitimate DHCP servers (uplinks). Untrusted ports (access) cannot send DHCP offers.',
                        code: 'SW1(config)# interface GigabitEthernet0/1\nSW1(config-if)# ip dhcp snooping trust'
                    },
                    {
                        title: 'Verifying',
                        body: '"show ip dhcp snooping" shows snooping status, VLANs, and trusted ports.',
                        code: 'SW1# show ip dhcp snooping\nDHCP snooping is enabled\nVLAN 1: enabled\nGi0/1: trusted'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            29: {
                id: 29,
                title: 'Storm Control',
                scenario: 'Protect the switch from broadcast, multicast, and unicast storms.',
                duration: '6 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface',
                    'storm-control broadcast', 'storm-control multicast',
                    'show storm-control', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Limit broadcast traffic', cmd: 'storm-control broadcast level 10' },
                    { text: 'Verify storm control', cmd: 'show storm-control broadcast' }
                ],
                concepts: [
                    {
                        title: 'Storm Control',
                        body: 'Storm control monitors broadcast/multicast/unicast traffic and drops excess traffic above a threshold.',
                        code: 'SW1(config-if)# storm-control broadcast level 10'
                    },
                    {
                        title: 'Thresholds',
                        body: 'Level is a percentage of bandwidth. 10 means 10% of interface bandwidth. Can also use bps or pps.',
                        code: 'level 10 → 10% of bandwidth\nlevel 10pps → 10 packets/sec'
                    },
                    {
                        title: 'Verifying',
                        body: '"show storm-control" shows current thresholds and traffic counters.',
                        code: 'SW1# show storm-control broadcast\nInterface  Filter  State  Upper  Lower  Current\nFa0/1      Bcast   Forwarding  10%   1%    0.00%'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            36: {
                id: 36,
                title: 'Switch Password & Security',
                scenario: 'Secure the switch with enable passwords and encrypted secrets.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'enable secret',
                    'enable password', 'service password-encryption',
                    'show running-config', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Set enable secret', cmd: 'enable secret cisco123' },
                    { text: 'Encrypt passwords', cmd: 'service password-encryption' },
                    { text: 'Verify config', cmd: 'show running-config' }
                ],
                concepts: [
                    {
                        title: 'enable secret vs enable password',
                        body: 'enable secret uses MD5 hashing. enable password is plaintext. Always use enable secret.',
                        code: 'SW1(config)# enable secret cisco123\nSW1(config)# enable password cisco'
                    },
                    {
                        title: 'Password Encryption',
                        body: '"service password-encryption" encrypts all plaintext passwords in the config (weak, but better than nothing).',
                        code: 'SW1(config)# service password-encryption'
                    },
                    {
                        title: 'Verifying',
                        body: '"show running-config" shows whether passwords are hashed or plaintext.',
                        code: 'enable secret 5 $1$mERr$hx5rVt7rPNoS4wqbXKX7m0\nenable password 7 08314F5D'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },
            69: {
                id: 69,
                title: 'Port Security Violation Modes',
                scenario: 'Lock down Fa0/1 with port security and compare the three violation modes.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface fa0/1',
                    'switchport mode access', 'switchport port-security',
                    'switchport port-security maximum 2',
                    'switchport port-security violation protect',
                    'switchport port-security violation restrict',
                    'switchport port-security violation shutdown',
                    'show port-security', 'show port-security interface fa0/1',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enable port security', cmd: 'switchport port-security' },
                    { text: 'Limit MACs to 2', cmd: 'switchport port-security maximum 2' },
                    { text: 'Set restrict mode', cmd: 'switchport port-security violation restrict' },
                    { text: 'Verify port security', cmd: 'show port-security' }
                ],
                concepts: [
                    {
                        title: 'What is Port Security?',
                        body: 'Port security limits how many MAC addresses can send frames into a port. It only works on access (or trunk) ports, not dynamic ports.',
                        code: 'SW1(config-if)# switchport mode access\nSW1(config-if)# switchport port-security'
                    },
                    {
                        title: 'The Three Violation Modes',
                        body: 'protect drops offending frames silently. restrict drops them AND logs + counts violations. shutdown puts the port in err-disabled (this is the default).',
                        code: 'SW1(config-if)# switchport port-security violation protect\nSW1(config-if)# switchport port-security violation restrict\nSW1(config-if)# switchport port-security violation shutdown'
                    },
                    {
                        title: 'Verifying',
                        body: '"show port-security" lists every secured port with its mode and violation count. "show port-security interface fa0/1" gives per-port detail.',
                        code: 'SW1# show port-security\nSecure Port  MaxSecureAddr  Violation\nFa0/1        2              Restrict'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },
            70: {
                id: 70,
                title: 'BPDU Guard & Root Guard',
                scenario: 'Protect the STP topology: BPDU Guard on access ports, Root Guard on the uplink.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface fa0/1',
                    'spanning-tree portfast', 'spanning-tree bpduguard enable',
                    'interface fa0/24', 'spanning-tree guard root',
                    'show spanning-tree', 'show running-config',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enable BPDU Guard on Fa0/1', cmd: 'spanning-tree bpduguard enable' },
                    { text: 'Enable Root Guard on Fa0/24', cmd: 'spanning-tree guard root' },
                    { text: 'Verify STP', cmd: 'show spanning-tree' }
                ],
                concepts: [
                    {
                        title: 'BPDU Guard',
                        body: 'BPDU Guard err-disables any portfast port that receives a BPDU. A host should never send BPDUs — receiving one means someone plugged in a switch.',
                        code: 'SW1(config-if)# spanning-tree portfast\nSW1(config-if)# spanning-tree bpduguard enable'
                    },
                    {
                        title: 'Root Guard',
                        body: 'Root Guard on an interface blocks superior BPDUs. If a rogue switch tries to become root, the port goes root-inconsistent instead of re-electing a new root.',
                        code: 'SW1(config-if)# spanning-tree guard root\n%SPANTREE-2-ROOTGUARD_BLOCK: port Fa0/24 root-inconsistent'
                    },
                    {
                        title: 'BPDU Guard vs Root Guard',
                        body: 'BPDU Guard = ANY BPDU shuts the port (use on access ports). Root Guard = only superior BPDUs are blocked (use on uplinks toward non-root switches).',
                        code: 'Access port:  portfast + bpduguard\nUplink port:  guard root'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },
            71: {
                id: 71,
                title: 'VLAN Hopping Attack',
                scenario: 'Harden the switch against switch spoofing and double-tagging VLAN hopping.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface fa0/1',
                    'switchport mode access', 'switchport access vlan 10',
                    'switchport nonegotiate', 'switchport trunk native vlan 99',
                    'show interfaces trunk', 'show running-config',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Force access mode', cmd: 'switchport mode access' },
                    { text: 'Disable DTP', cmd: 'switchport nonegotiate' },
                    { text: 'Change native VLAN', cmd: 'switchport trunk native vlan 99' }
                ],
                concepts: [
                    {
                        title: 'Switch Spoofing (DTP Attack)',
                        body: 'An attacker sends DTP frames to negotiate a trunk with the switch. Once trunked, they can reach every VLAN. Fix: hardcode access mode and disable DTP.',
                        code: 'SW1(config-if)# switchport mode access\nSW1(config-if)# switchport nonegotiate'
                    },
                    {
                        title: 'Double Tagging',
                        body: 'The attacker sends a frame with two 802.1Q tags. The switch strips the first (native VLAN) tag and forwards the frame into the inner-tag VLAN — no reply path, but one-way injection works.',
                        code: 'Frame: [native tag][victim tag][data]\nSwitch strips native tag → forwards into victim VLAN'
                    },
                    {
                        title: 'Mitigation',
                        body: 'Use a dedicated unused native VLAN on all trunks, force access mode + nonegotiate on host ports, and shut down unused ports.',
                        code: 'SW1(config-if)# switchport trunk native vlan 99'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '10', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '10', peer: 'PC-B' }
                    ]
                }
            },
            72: {
                id: 72,
                title: 'MAC Flooding Attack',
                scenario: 'Understand CAM table overflow and mitigate it with port security.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface fa0/1',
                    'switchport mode access', 'switchport port-security',
                    'switchport port-security maximum 1',
                    'switchport port-security mac-address sticky',
                    'show mac address-table', 'show port-security',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enable port security', cmd: 'switchport port-security' },
                    { text: 'Limit to 1 MAC', cmd: 'switchport port-security maximum 1' },
                    { text: 'View CAM table', cmd: 'show mac address-table' }
                ],
                concepts: [
                    {
                        title: 'How MAC Flooding Works',
                        body: 'The attacker blasts thousands of fake source MAC addresses. The CAM table fills up, and the switch falls back to flooding all frames out every port in the VLAN.',
                        code: 'Attacker → fake MAC #1..N\nCAM table full → switch floods unknown unicast'
                    },
                    {
                        title: 'Why It Is Dangerous',
                        body: 'While flooded, the attacker receives traffic meant for other hosts — a sniffing position inside the same VLAN.',
                        code: 'Normal:  unicast → learned port only\nFlooded: unicast → ALL ports in VLAN'
                    },
                    {
                        title: 'Mitigation',
                        body: 'Port security caps learned MACs per port. With maximum 1 + sticky, the first legitimate MAC is pinned and extras trigger the configured violation mode.',
                        code: 'SW1(config-if)# switchport port-security maximum 1\nSW1(config-if)# switchport port-security mac-address sticky'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },
            73: {
                id: 73,
                title: 'AAA Basics',
                scenario: 'Enable AAA and require local username login on console and VTY lines.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'aaa new-model',
                    'username admin password cisco123',
                    'line console 0', 'login local',
                    'line vty 0 4', 'login local',
                    'show running-config', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enable AAA', cmd: 'aaa new-model' },
                    { text: 'Create local user', cmd: 'username admin password cisco123' },
                    { text: 'Console uses local login', cmd: 'login local' },
                    { text: 'VTY uses local login', cmd: 'login local' }
                ],
                concepts: [
                    {
                        title: 'What is AAA?',
                        body: 'Authentication proves who you are, Authorization controls what you can do, Accounting records what you did.',
                        code: 'AAA = Authentication + Authorization + Accounting'
                    },
                    {
                        title: 'Local vs Server-Based',
                        body: 'Local AAA uses the username database stored on the device itself. Larger networks centralize it with RADIUS or TACACS+ servers.',
                        code: 'SW1(config)# aaa new-model\nSW1(config)# username admin password cisco123'
                    },
                    {
                        title: 'login local',
                        body: 'Applying "login local" on console/VTY lines forces users to authenticate against the local username database instead of a simple line password.',
                        code: 'SW1(config)# line console 0\nSW1(config-line)# login local\nSW1(config)# line vty 0 4\nSW1(config-line)# login local'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },
            74: {
                id: 74,
                title: 'SSH Security',
                scenario: 'Replace Telnet with encrypted SSH for secure remote management.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'ip domain-name ccna.lab',
                    'crypto key generate rsa', 'username admin password cisco123',
                    'line vty 0 4', 'transport input ssh', 'login local',
                    'show running-config', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Set domain name', cmd: 'ip domain-name ccna.lab' },
                    { text: 'Generate RSA keys', cmd: 'crypto key generate rsa' },
                    { text: 'Allow SSH only', cmd: 'transport input ssh' },
                    { text: 'Require local login', cmd: 'login local' }
                ],
                concepts: [
                    {
                        title: 'SSH vs Telnet',
                        body: 'Telnet sends everything — including passwords — in plaintext. SSH encrypts the entire session. Never manage devices over Telnet.',
                        code: 'Telnet: plaintext — sniffable\nSSH:    encrypted — secure'
                    },
                    {
                        title: 'RSA Keys',
                        body: 'SSH needs an RSA keypair. The hostname + domain name form the key name, so set those first. Use at least a 1024-bit modulus.',
                        code: 'SW1(config)# ip domain-name ccna.lab\nSW1(config)# crypto key generate rsa\n  modulus 1024'
                    },
                    {
                        title: 'Restrict VTY to SSH',
                        body: '"transport input ssh" on the VTY lines blocks Telnet completely — only SSH sessions are accepted.',
                        code: 'SW1(config)# line vty 0 4\nSW1(config-line)# transport input ssh\nSW1(config-line)# login local'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },
            75: {
                id: 75,
                title: 'Password Encryption',
                scenario: 'Encrypt every plaintext password and learn to read the hash types in the config.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'service password-encryption',
                    'enable secret cisco123', 'line console 0', 'password cisco',
                    'login', 'show running-config', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Encrypt all passwords', cmd: 'service password-encryption' },
                    { text: 'Set enable secret', cmd: 'enable secret cisco123' },
                    { text: 'Verify hash types', cmd: 'show running-config' }
                ],
                concepts: [
                    {
                        title: 'service password-encryption',
                        body: 'This global command encrypts all plaintext passwords in the config (line passwords, usernames) using weak Type 7 — reversible, but hides them from casual viewing.',
                        code: 'SW1(config)# service password-encryption'
                    },
                    {
                        title: 'Hash Types: 7 vs 5',
                        body: 'Type 7 (password 7 ...) is weak and reversible. Type 5 (secret 5 ...) is a real MD5 hash. Always prefer enable secret over enable password.',
                        code: 'enable secret 5 $1$mERr$hx5rVt7rPNoS4wqbXKX7m0\nenable password 7 08314F5D'
                    },
                    {
                        title: 'Verifying',
                        body: 'Run "show running-config" and check the number after the keyword: 7 = weak reversible, 5 = MD5 hash. Line passwords now show as Type 7 after the service command.',
                        code: 'SW1# show running-config\n line console 0\n  password 7 08314F5D'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            }
        }
    },

    // ============================================================
    // STAGE 6: LINK AGGREGATION
    // ============================================================
    'link-aggregation': {
        id: 'link-aggregation',
        stage: 6,
        stageName: 'Link Aggregation',
        lessons: {

            19: {
                id: 19,
                title: 'EtherChannel Basics',
                scenario: 'Combine multiple physical links into one logical link for more bandwidth and redundancy.',
                duration: '9 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface range',
                    'channel-group', 'show etherchannel summary',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Create EtherChannel group 1', cmd: 'channel-group 1 mode active' },
                    { text: 'Verify EtherChannel', cmd: 'show etherchannel summary' }
                ],
                concepts: [
                    {
                        title: 'What is EtherChannel?',
                        body: 'EtherChannel bundles up to 8 physical links into one logical link. Provides more bandwidth and redundancy.',
                        code: 'Fa0/1 + Fa0/2 + Fa0/3 + Fa0/4 → Port-channel 1'
                    },
                    {
                        title: 'Modes',
                        body: 'active (LACP), passive (LACP), desirable (PAgP), auto (PAgP), on (static). LACP is the open standard.',
                        code: 'LACP:  active / passive\nPAgP:  desirable / auto\nStatic: on'
                    },
                    {
                        title: 'Verifying EtherChannel',
                        body: '"show etherchannel summary" shows the port-channel status and member ports.',
                        code: 'SW1# show etherchannel summary\nGroup  Port-channel  Protocol  Ports\n1      Po1(SU)      LACP      Fa0/1(P) Fa0/2(P)'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            20: {
                id: 20,
                title: 'LACP Configuration',
                scenario: 'Configure Link Aggregation Control Protocol (LACP) between switches.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface range',
                    'channel-group', 'show etherchannel summary', 'show etherchannel port-channel',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Add Fa0/1 to channel 1', cmd: 'channel-group 1 mode active' },
                    { text: 'Add Fa0/2 to channel 1', cmd: 'channel-group 1 mode active' },
                    { text: 'Verify the channel', cmd: 'show etherchannel summary' }
                ],
                concepts: [
                    {
                        title: 'LACP (802.3ad)',
                        body: 'LACP is the open standard for link aggregation. Use "mode active" on both sides to negotiate.',
                        code: 'SW1(config)# interface range FastEthernet0/1-2\nSW1(config-if-range)# channel-group 1 mode active'
                    },
                    {
                        title: 'Requirements',
                        body: 'All member ports must have the same speed, duplex, VLAN, and trunk mode. Otherwise the channel fails.',
                        code: 'Same speed ✓\nSame duplex ✓\nSame VLAN ✓\nSame trunk mode ✓'
                    },
                    {
                        title: 'Load Balancing',
                        body: 'EtherChannel load-balances traffic by source/destination MAC or IP. Default is src-dst MAC.',
                        code: 'SW1(config)# port-channel load-balance src-dst-mac'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },
            76: {
                id: 76,
                title: 'PAgP (Port Aggregation Protocol)',
                scenario: 'Configure Cisco-proprietary PAgP negotiation with desirable and auto modes.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface range',
                    'channel-group 1 mode desirable', 'channel-group 1 mode auto',
                    'show etherchannel summary', 'show pagp neighbor',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Set PAgP desirable', cmd: 'channel-group 1 mode desirable' },
                    { text: 'Set PAgP auto', cmd: 'channel-group 1 mode auto' },
                    { text: 'Verify the channel', cmd: 'show etherchannel summary' }
                ],
                concepts: [
                    {
                        title: 'What is PAgP?',
                        body: 'PAgP (Port Aggregation Protocol) is Cisco-proprietary. It negotiates an EtherChannel between two Cisco switches automatically.',
                        code: 'SW1(config)# interface range FastEthernet0/1-2\nSW1(config-if-range)# channel-group 1 mode desirable'
                    },
                    {
                        title: 'PAgP Modes',
                        body: 'desirable actively asks to form a channel. auto passively waits for the other side to ask. on is static with no negotiation at all.',
                        code: 'desirable: initiates negotiation\nauto:      responds only\non:        static, no PAgP'
                    },
                    {
                        title: 'Mode Combinations',
                        body: 'desirable + desirable = channel forms. desirable + auto = channel forms. auto + auto = NEVER forms (nobody asks).',
                        code: 'desirable + desirable → channel\nauto + auto           → no channel!'
                    },
                    {
                        title: 'Verifying PAgP',
                        body: '"show etherchannel summary" shows the channel protocol as PAgP. "show pagp neighbor" lists the PAgP partner.',
                        code: 'SW1# show etherchannel summary\nGroup  Port-channel  Protocol  Ports\n1      Po1(SU)      PAgP      Fa0/1(P) Fa0/2(P)'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },
            77: {
                id: 77,
                title: 'LACP Passive & Active',
                scenario: 'Configure LACP active and passive modes and learn which combinations form a channel.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface range',
                    'channel-group 1 mode active', 'channel-group 1 mode passive',
                    'show etherchannel summary', 'show lacp neighbor',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Set LACP active', cmd: 'channel-group 1 mode active' },
                    { text: 'Set LACP passive', cmd: 'channel-group 1 mode passive' },
                    { text: 'Verify the channel', cmd: 'show etherchannel summary' }
                ],
                concepts: [
                    {
                        title: 'LACP Active vs Passive',
                        body: 'active sends LACP packets to initiate a channel. passive only responds to LACP packets — it never initiates.',
                        code: 'active:  initiates negotiation\npassive: responds only\non:      static, no LACP'
                    },
                    {
                        title: 'Mode Combinations',
                        body: 'active + active = channel forms. active + passive = channel forms. passive + passive = NEVER forms (nobody initiates).',
                        code: 'active  + active  → channel\nactive  + passive → channel\npassive + passive → no channel!'
                    },
                    {
                        title: 'LACP System Priority',
                        body: 'Each switch has an LACP system priority. The lower priority switch decides which ports actively participate in the channel.',
                        code: 'SW1(config)# lacp system-priority 100'
                    },
                    {
                        title: 'Verifying LACP',
                        body: '"show etherchannel summary" shows the protocol as LACP. "show lacp neighbor" lists the LACP partner details.',
                        code: 'SW1# show etherchannel summary\nGroup  Port-channel  Protocol  Ports\n1      Po1(SU)      LACP      Fa0/1(P) Fa0/2(P)'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },
            78: {
                id: 78,
                title: 'EtherChannel',
                scenario: 'Build a complete EtherChannel bundle and verify load balancing and redundancy.',
                duration: '9 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface range',
                    'channel-group', 'port-channel load-balance',
                    'show etherchannel summary', 'show etherchannel port-channel',
                    'show interfaces port-channel', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Bundle Fa0/1-2 into Po1', cmd: 'channel-group 1 mode active' },
                    { text: 'Set load balancing', cmd: 'port-channel load-balance src-dst-mac' },
                    { text: 'Verify EtherChannel', cmd: 'show etherchannel summary' }
                ],
                concepts: [
                    {
                        title: 'What is EtherChannel?',
                        body: 'EtherChannel bundles up to 8 physical links into one logical port-channel. STP treats the bundle as a single link, so all member links forward traffic.',
                        code: 'Fa0/1 + Fa0/2 → Port-channel 1 (Po1)\nSTP sees ONE link, not two'
                    },
                    {
                        title: 'Configuration Steps',
                        body: '1) Enter interface range. 2) Set matching speed/duplex/VLAN/trunk. 3) Create the channel-group. The Po interface is created automatically.',
                        code: 'SW1(config)# interface range FastEthernet0/1-2\nSW1(config-if-range)# channel-group 1 mode active'
                    },
                    {
                        title: 'Load Balancing',
                        body: 'Traffic is distributed across member links based on a hash: src-mac, dst-mac, src-dst-mac, src-ip, dst-ip, or src-dst-ip.',
                        code: 'SW1(config)# port-channel load-balance src-dst-ip'
                    },
                    {
                        title: 'Verifying EtherChannel',
                        body: '"show etherchannel summary" shows Po1(SU) — S = Layer2, U = in use. (P) next to a port means it is bundled in the channel.',
                        code: 'SW1# show etherchannel summary\n1      Po1(SU)     LACP      Fa0/1(P) Fa0/2(P)'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            }
        }
    },

    // ============================================================
    // STAGE 7: DISCOVERY & MANAGEMENT
    // ============================================================
    'discovery-mgmt': {
        id: 'discovery-mgmt',
        stage: 7,
        stageName: 'Discovery & Management',
        lessons: {

            21: {
                id: 21,
                title: 'CDP & LLDP',
                scenario: 'Discover neighboring devices using Cisco Discovery Protocol and LLDP.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'show cdp neighbors', 'show cdp neighbors detail',
                    'show lldp neighbors', 'configure terminal', 'lldp run',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View CDP neighbors', cmd: 'show cdp neighbors' },
                    { text: 'Enable LLDP', cmd: 'lldp run' },
                    { text: 'View LLDP neighbors', cmd: 'show lldp neighbors' }
                ],
                concepts: [
                    {
                        title: 'CDP',
                        body: 'CDP (Cisco Discovery Protocol) is Cisco-proprietary. It advertises device info to directly connected neighbors.',
                        code: 'SW1# show cdp neighbors\nDevice ID  Local Intrfce  Platform  Port ID\nSW2        Gig 0/1        WS-C2960  Gig 0/1'
                    },
                    {
                        title: 'LLDP',
                        body: 'LLDP (IEEE 802.1AB) is the open standard equivalent. Enable it with "lldp run" globally.',
                        code: 'SW1(config)# lldp run\nSW1# show lldp neighbors'
                    },
                    {
                        title: 'Why Discover?',
                        body: 'CDP/LLDP help map the network, verify connections, and troubleshoot. Disable on untrusted ports for security.',
                        code: 'SW1(config-if)# no cdp enable\nSW1(config-if)# no lldp transmit'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            22: {
                id: 22,
                title: 'Switch Management IP',
                scenario: 'Configure an IP address on VLAN 1 for remote management of the switch.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'interface vlan 1',
                    'ip address', 'no shutdown', 'show ip interface brief',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enter VLAN 1 interface', cmd: 'interface vlan 1' },
                    { text: 'Set management IP', cmd: 'ip address 192.168.1.2 255.255.255.0' },
                    { text: 'Verify the IP', cmd: 'show ip interface brief' }
                ],
                concepts: [
                    {
                        title: 'Management IP',
                        body: 'A switch needs an IP on an SVI (Switch Virtual Interface) for Telnet/SSH management. VLAN 1 is the default.',
                        code: 'SW1(config)# interface vlan 1\nSW1(config-if)# ip address 192.168.1.2 255.255.255.0\nSW1(config-if)# no shutdown'
                    },
                    {
                        title: 'SVI (Switch Virtual Interface)',
                        body: 'An SVI is a virtual interface that represents a VLAN for management or routing. One per VLAN.',
                        code: 'interface vlan 1 → management\ninterface vlan 20 → routing'
                    },
                    {
                        title: 'Verifying Management IP',
                        body: '"show ip interface brief" shows all SVIs and their IP addresses.',
                        code: 'SW1# show ip interface brief\nInterface  IP-Address  Status  Protocol\nVlan1      192.168.1.2 up      up'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            23: {
                id: 23,
                title: 'Default Gateway',
                scenario: 'Configure a default gateway so the switch can reach remote networks.',
                duration: '6 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'ip default-gateway',
                    'show running-config', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Set default gateway', cmd: 'ip default-gateway 192.168.1.1' },
                    { text: 'Verify the config', cmd: 'show running-config' }
                ],
                concepts: [
                    {
                        title: 'Default Gateway',
                        body: 'Layer 2 switches need a default gateway to reach remote networks for management (ping, Telnet, SSH).',
                        code: 'SW1(config)# ip default-gateway 192.168.1.1'
                    },
                    {
                        title: 'Layer 2 vs Layer 3',
                        body: 'Layer 2 switches use "ip default-gateway". Layer 3 switches use "ip route 0.0.0.0 0.0.0.0 <next-hop>".',
                        code: 'L2 switch: ip default-gateway 192.168.1.1\nL3 switch: ip route 0.0.0.0 0.0.0.0 192.168.1.1'
                    },
                    {
                        title: 'Verifying',
                        body: 'Check "show running-config" or ping a remote address to verify the gateway works.',
                        code: 'SW1# ping 192.168.1.1\n!!!!!\nSuccess rate is 100 percent'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            24: {
                id: 24,
                title: 'SSH Configuration',
                scenario: 'Configure SSH for secure remote management instead of Telnet.',
                duration: '10 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'hostname', 'ip domain-name',
                    'crypto key generate rsa', 'username', 'line vty',
                    'transport input ssh', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Set domain name', cmd: 'ip domain-name ccna.local' },
                    { text: 'Create a user', cmd: 'username admin secret cisco' },
                    { text: 'Enable SSH on VTY lines', cmd: 'transport input ssh' }
                ],
                concepts: [
                    {
                        title: 'SSH vs Telnet',
                        body: 'Telnet sends passwords in plaintext. SSH encrypts everything. Always use SSH for remote management.',
                        code: 'Telnet: plaintext (port 23)\nSSH:    encrypted (port 22)'
                    },
                    {
                        title: 'SSH Requirements',
                        body: 'Hostname, domain name, RSA key, local user, and VTY lines configured for SSH.',
                        code: 'SW1(config)# hostname SW1\nSW1(config)# ip domain-name ccna.local\nSW1(config)# crypto key generate rsa'
                    },
                    {
                        title: 'VTY Configuration',
                        body: 'VTY lines are virtual terminal lines for remote access. Restrict them to SSH only.',
                        code: 'SW1(config)# line vty 0 4\nSW1(config-line)# transport input ssh\nSW1(config-line)# login local'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            25: {
                id: 25,
                title: 'Telnet Configuration',
                scenario: 'Configure Telnet access and understand why it is insecure.',
                duration: '6 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'username', 'line vty',
                    'transport input telnet', 'password', 'login',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Create a local user', cmd: 'username admin password cisco' },
                    { text: 'Enable Telnet on VTY', cmd: 'transport input telnet' }
                ],
                concepts: [
                    {
                        title: 'Telnet',
                        body: 'Telnet provides remote CLI access but sends everything in plaintext. Only use in lab environments.',
                        code: 'SW1(config)# line vty 0 4\nSW1(config-line)# transport input telnet'
                    },
                    {
                        title: 'VTY Lines',
                        body: 'VTY 0-4 allows 5 concurrent remote sessions. Configure login and password or local authentication.',
                        code: 'SW1(config-line)# login local\nSW1(config-line)# transport input telnet'
                    },
                    {
                        title: 'Security Warning',
                        body: 'Telnet passwords and data are visible on the wire. Use SSH whenever possible.',
                        code: 'telnet → plaintext (insecure)\nssh → encrypted (secure)'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            }
        }
    },

    // ============================================================
    // STAGE 8: LAYER 3 SWITCHING
    // ============================================================
    'layer3-switching': {
        id: 'layer3-switching',
        stage: 8,
        stageName: 'Layer 3 Switching',
        lessons: {

            26: {
                id: 26,
                title: 'Inter-VLAN Routing (Router on a Stick)',
                scenario: 'Understand how subinterfaces route between VLANs.',
                duration: '9 min',
                allowedCommands: [
                    'enable', 'show vlan brief', 'show interfaces trunk',
                    'show ip interface brief', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View VLANs', cmd: 'show vlan brief' },
                    { text: 'View trunk status', cmd: 'show interfaces trunk' }
                ],
                concepts: [
                    {
                        title: 'Inter-VLAN Routing',
                        body: 'Devices in different VLANs cannot communicate without a Layer 3 device. A router with subinterfaces can route between them.',
                        code: 'VLAN 10 → 192.168.10.0/24\nVLAN 20 → 192.168.20.0/24\nRouter routes between them'
                    },
                    {
                        title: 'Router on a Stick',
                        body: 'One physical router link carries multiple VLANs using subinterfaces with 802.1Q encapsulation.',
                        code: 'Gi0/0.10 → VLAN 10\nGi0/0.20 → VLAN 20\nencapsulation dot1Q 10'
                    },
                    {
                        title: 'Layer 3 Switch Alternative',
                        body: 'Layer 3 switches use SVIs (interface vlan) for routing — faster than router-on-a-stick.',
                        code: 'SW1(config)# interface vlan 10\nSW1(config-if)# ip address 192.168.10.1 255.255.255.0'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            27: {
                id: 27,
                title: 'Layer 3 Switching (SVIs)',
                scenario: 'Configure SVIs on a Layer 3 switch to route between VLANs.',
                duration: '9 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'ip routing',
                    'interface vlan', 'ip address', 'no shutdown',
                    'show ip route', 'show ip interface brief',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Enable IP routing', cmd: 'ip routing' },
                    { text: 'Configure VLAN 10 SVI', cmd: 'interface vlan 10' },
                    { text: 'Verify routes', cmd: 'show ip route' }
                ],
                concepts: [
                    {
                        title: 'Layer 3 Switch',
                        body: 'A Layer 3 switch can route between VLANs using SVIs. Enable routing with "ip routing".',
                        code: 'SW1(config)# ip routing\nSW1(config)# interface vlan 10\nSW1(config-if)# ip address 192.168.10.1 255.255.255.0'
                    },
                    {
                        title: 'SVI Routing',
                        body: 'Each VLAN gets an SVI with an IP. The switch routes between VLANs at wire speed.',
                        code: 'VLAN 10 SVI: 192.168.10.1\nVLAN 20 SVI: 192.168.20.1'
                    },
                    {
                        title: 'Verifying Routes',
                        body: '"show ip route" shows connected and static routes. Directly connected VLANs appear as C routes.',
                        code: 'SW1# show ip route\nC  192.168.10.0/24 is directly connected, Vlan10\nC  192.168.20.0/24 is directly connected, Vlan20'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            }
        }
    },

    // ============================================================
    // STAGE 9: MONITORING & OPERATIONS
    // ============================================================
    'monitoring-ops': {
        id: 'monitoring-ops',
        stage: 9,
        stageName: 'Monitoring & Operations',
        lessons: {

            30: {
                id: 30,
                title: 'Port Mirroring (SPAN)',
                scenario: 'Configure SPAN to copy traffic from one port to a monitoring port.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'configure terminal', 'monitor session',
                    'show monitor', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Create SPAN session', cmd: 'monitor session 1 source interface FastEthernet0/1' },
                    { text: 'Set destination port', cmd: 'monitor session 1 destination interface FastEthernet0/24' },
                    { text: 'Verify SPAN', cmd: 'show monitor session 1' }
                ],
                concepts: [
                    {
                        title: 'SPAN',
                        body: 'SPAN (Switched Port Analyzer) copies traffic from source ports to a destination port for monitoring.',
                        code: 'SW1(config)# monitor session 1 source interface FastEthernet0/1\nSW1(config)# monitor session 1 destination interface FastEthernet0/24'
                    },
                    {
                        title: 'Use Cases',
                        body: 'Traffic analysis, intrusion detection, packet capture with Wireshark, and troubleshooting.',
                        code: 'Monitor port → Wireshark / IDS / IPS'
                    },
                    {
                        title: 'Verifying SPAN',
                        body: '"show monitor session 1" shows source and destination ports.',
                        code: 'SW1# show monitor session 1\nSession 1\nSource Ports: Fa0/1\nDestination Ports: Fa0/24'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            31: {
                id: 31,
                title: 'PoE (Power over Ethernet)',
                scenario: 'Understand and verify Power over Ethernet on switch ports.',
                duration: '6 min',
                allowedCommands: [
                    'enable', 'show power inline', 'show interfaces status',
                    'configure terminal', 'interface', 'power inline never',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View PoE status', cmd: 'show power inline' },
                    { text: 'Disable PoE on a port', cmd: 'power inline never' }
                ],
                concepts: [
                    {
                        title: 'PoE',
                        body: 'PoE delivers power over Ethernet cables to devices like IP phones, cameras, and APs.',
                        code: 'SW1# show power inline\nInterface  Admin  Oper  Power(Watts)\nFa0/1     auto   on    15.4'
                    },
                    {
                        title: 'PoE Standards',
                        body: '802.3af (15.4W), 802.3at PoE+ (30W), 802.3bt PoE++ (60-90W).',
                        code: '802.3af: 15.4W\n802.3at: 30W\n802.3bt: 60-90W'
                    },
                    {
                        title: 'Managing PoE',
                        body: 'Disable PoE on ports that should not provide power for security.',
                        code: 'SW1(config-if)# power inline never'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            32: {
                id: 32,
                title: 'Switch Stacking',
                scenario: 'Understand how switch stacking creates a single logical switch.',
                duration: '5 min',
                allowedCommands: [
                    'enable', 'show switch', 'show version',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View stack members', cmd: 'show switch' },
                    { text: 'View stack version', cmd: 'show version' }
                ],
                concepts: [
                    {
                        title: 'Switch Stacking',
                        body: 'Stacking connects multiple switches with stack cables to act as one logical switch with a single management IP.',
                        code: 'SW1 + SW2 + SW3 → one logical switch'
                    },
                    {
                        title: 'Stack Members',
                        body: 'Each switch has a member number (1-9). The master manages the stack. Members are numbered by priority.',
                        code: 'SW1# show switch\nSwitch/Port  Role     Mac Address\n1           Master   00:1B:2F:3C:4D:5E\n2           Member   00:1B:2F:3C:4D:5F'
                    },
                    {
                        title: 'Benefits',
                        body: 'Single management point, shared config, high availability, and more ports.',
                        code: 'One IP to manage all\nShared configuration\nRedundant master'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            33: {
                id: 33,
                title: 'MAC Address Table Management',
                scenario: 'Manage static and dynamic MAC address table entries.',
                duration: '7 min',
                allowedCommands: [
                    'enable', 'show mac address-table', 'show mac address-table aging-time',
                    'configure terminal', 'mac address-table static',
                    'clear mac address-table', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View MAC table', cmd: 'show mac address-table' },
                    { text: 'Add static MAC entry', cmd: 'mac address-table static 00:1B:2F:3C:4D:5E vlan 1 interface FastEthernet0/1' },
                    { text: 'Clear dynamic entries', cmd: 'clear mac address-table dynamic' }
                ],
                concepts: [
                    {
                        title: 'Static MAC Entries',
                        body: 'Static MAC entries never age out. Useful for servers or security-critical devices.',
                        code: 'SW1(config)# mac address-table static 00:1B:2F:3C:4D:5E vlan 1 interface FastEthernet0/1'
                    },
                    {
                        title: 'Aging Time',
                        body: 'Dynamic entries age out after 300 seconds by default. Can be changed globally or per VLAN.',
                        code: 'SW1(config)# mac address-table aging-time 600'
                    },
                    {
                        title: 'Clearing the Table',
                        body: '"clear mac address-table dynamic" removes all learned entries. Useful after topology changes.',
                        code: 'SW1# clear mac address-table dynamic'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            37: {
                id: 37,
                title: 'Switch Backup & Restore',
                scenario: 'Back up the running configuration and restore it when needed.',
                duration: '6 min',
                allowedCommands: [
                    'enable', 'copy running-config startup-config',
                    'copy startup-config running-config', 'write memory',
                    'show running-config', 'show startup-config',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Save config to NVRAM', cmd: 'write memory' },
                    { text: 'Backup to startup-config', cmd: 'copy running-config startup-config' },
                    { text: 'Restore from startup-config', cmd: 'copy startup-config running-config' }
                ],
                concepts: [
                    {
                        title: 'Backup Locations',
                        body: 'NVRAM (startup-config), TFTP server, or USB. Always keep an off-device backup.',
                        code: 'copy running-config startup-config\ncopy running-config tftp:\ncopy running-config flash:'
                    },
                    {
                        title: 'Restoring',
                        body: 'Copy from backup back into running-config. Merge or replace depending on the source.',
                        code: 'copy startup-config running-config\ncopy tftp: running-config'
                    },
                    {
                        title: 'Best Practice',
                        body: 'Save after every change with "write memory". Keep a TFTP backup for disaster recovery.',
                        code: 'SW1# write memory\nBuilding configuration...\n[OK]'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            38: {
                id: 38,
                title: 'Switch IOS Upgrade',
                scenario: 'Understand the IOS upgrade process and verify the running image.',
                duration: '6 min',
                allowedCommands: [
                    'enable', 'show version', 'show flash',
                    'show boot', 'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View IOS version', cmd: 'show version' },
                    { text: 'View flash contents', cmd: 'show flash' },
                    { text: 'View boot settings', cmd: 'show boot' }
                ],
                concepts: [
                    {
                        title: 'IOS Image',
                        body: 'The IOS image is stored in flash. "show version" shows the running image and version.',
                        code: 'SW1# show version\nSystem image file is "flash:c2960-lanbasek9-mz.122-55.SE11.bin"'
                    },
                    {
                        title: 'Upgrade Process',
                        body: 'Copy new IOS to flash, set boot statement, reload. Verify with "show version".',
                        code: 'copy tftp: flash:\nboot system flash:new-image.bin\nreload'
                    },
                    {
                        title: 'Boot Settings',
                        body: '"show boot" shows which image loads on boot. Multiple images can be configured as fallback.',
                        code: 'SW1# show boot\nBOOT path-list: flash:c2960-lanbasek9-mz.122-55.SE11.bin'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            }
        }
    },

    // ============================================================
    // STAGE 10: TROUBLESHOOTING
    // ============================================================
    'troubleshooting': {
        id: 'troubleshooting',
        stage: 10,
        stageName: 'Troubleshooting',
        lessons: {

            34: {
                id: 34,
                title: 'VLAN Troubleshooting',
                scenario: 'Troubleshoot common VLAN and trunk issues.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'show vlan brief', 'show interfaces trunk',
                    'show interfaces status', 'show running-config',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'Check VLANs', cmd: 'show vlan brief' },
                    { text: 'Check trunks', cmd: 'show interfaces trunk' },
                    { text: 'Check port status', cmd: 'show interfaces status' }
                ],
                concepts: [
                    {
                        title: 'Common VLAN Issues',
                        body: 'Port in wrong VLAN, trunk not configured, native VLAN mismatch, or VLAN not created.',
                        code: 'Check: show vlan brief\nCheck: show interfaces trunk\nCheck: show interfaces status'
                    },
                    {
                        title: 'Trunk Mismatch',
                        body: 'If one side is access and the other is trunk, traffic fails. Both sides must agree on trunk mode.',
                        code: 'SW1: trunk\nSW2: access → mismatch!'
                    },
                    {
                        title: 'Native VLAN Mismatch',
                        body: 'Native VLAN mismatch causes BPDU errors and untagged traffic issues. Both sides must match.',
                        code: 'SW1 native: 99\nSW2 native: 1 → mismatch!'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            },

            35: {
                id: 35,
                title: 'STP Troubleshooting',
                scenario: 'Troubleshoot spanning-tree issues like loops and blocked ports.',
                duration: '8 min',
                allowedCommands: [
                    'enable', 'show spanning-tree', 'show spanning-tree root',
                    'show interfaces status', 'show mac address-table',
                    'exit', 'end', 'help', '?'
                ],
                objectives: [
                    { text: 'View STP state', cmd: 'show spanning-tree' },
                    { text: 'View root bridge', cmd: 'show spanning-tree root' },
                    { text: 'Check MAC table', cmd: 'show mac address-table' }
                ],
                concepts: [
                    {
                        title: 'Loop Symptoms',
                        body: 'High CPU, MAC table flapping, broadcast storms, and slow network. Check STP and look for blocked ports.',
                        code: 'Symptom: MAC flapping\nCheck: show spanning-tree\nCheck: show mac address-table'
                    },
                    {
                        title: 'Root Bridge Issues',
                        body: 'Unexpected root bridge means a rogue switch is winning the election. Set priority to control the root.',
                        code: 'SW1(config)# spanning-tree vlan 1 root primary'
                    },
                    {
                        title: 'PortFast on Trunks',
                        body: 'PortFast on a trunk can cause temporary loops. Never enable PortFast on trunk ports.',
                        code: 'PortFast + trunk = loop risk!'
                    }
                ],
                topology: {
                    devices: [
                        { id: 'pc-a', label: 'PC-A', type: 'pc', x: 60, y: 75 },
                        { id: 'sw1', label: 'SW1', type: 'switch', x: 210, y: 75 },
                        { id: 'pc-b', label: 'PC-B', type: 'pc', x: 360, y: 75 }
                    ],
                    links: [
                        { from: 'pc-a', to: 'sw1', label: 'Fa0/1' },
                        { from: 'pc-b', to: 'sw1', label: 'Fa0/2' }
                    ],
                    table: [
                        { port: 'Fa0/1', mode: 'access', vlan: '1', peer: 'PC-A' },
                        { port: 'Fa0/2', mode: 'access', vlan: '1', peer: 'PC-B' }
                    ]
                }
            }
        }
    }
};

// ============================================================
// CCNA MATERIAL (theory) — stages only. Lessons get added later.
// Reuses the same stage structure as LABS, so the same renderer
// in app.js works for both without duplicating code.
// ============================================================
const MATERIAL_STAGE_NAMES = [
    'Network Intro',
    'Network Component',
    'Transport Layer',
    'Network Layer',
    'IPv4 Addressing',
    'Subnetting',
    'Data Link Layer',
    'Physical Layer',
    'Router & Switch Config',
    'Network Troubleshooting',
    'IPv4 Routing',
    'Dynamic Routing Protocol',
    'IGP',
    'OSPF',
    'VLAN',
    'DHCP',
    'HSRP',
    'STP',
    'EtherChannel',
    'Switch Security',
    'ACL',
    'NAT',
    'IPv6',
    'WAN',
    'Security Concepts',
    'Network Device Security',
    'Wireless Networks',
];

// Build material stages from the list (keeps data tiny + reusable).
const MATERIAL = {};
MATERIAL_STAGE_NAMES.forEach((stageName, i) => {
    const stage = i + 1;
    MATERIAL['stage-' + stage] = {
        id: 'stage-' + stage,
        stage: stage,
        stageName: stageName,
        lessons: {},
    };
});
// ============================================================
// CCNA MATERIAL LESSONS (theory)
// Shape: { id, title, duration, sections: [{ title, body, code? }] }
// IDs start at 101 to avoid clashing with LABS lesson ids.
// ============================================================

// ---------- STAGE 1: NETWORK INTRO ----------
MATERIAL['stage-1'].lessons = {

    101: {
        id: 101,
        title: 'What is a Network?',
        icon: '🌐',
        tagline: 'How devices connect and share things',
        duration: '8 min',
        sections: [
            {
                icon: '🤝',
                title: 'The Simple Idea',
                body: 'A network is just two or more devices connected so they can share things with each other — files, a printer, or the internet. Think of it like a WhatsApp group: everyone is connected, and anyone can send a message to anyone else.',
                points: [
                    'Each device on a network is called a host or end device.',
                    'Every host needs a unique address (like your home address) so data knows exactly where to go.',
                    'Connections can be wires (cables) or wireless (Wi-Fi).'
                ]
            },
            {
                icon: '🧩',
                title: 'The 4 Basic Building Blocks',
                body: 'Almost every network you will ever see is made of these same four pieces:',
                table: {
                    head: ['Piece', 'Job', 'Think of it as...'],
                    rows: [
                        ['End device (PC, phone)', 'Sends / receives data', 'The houses'],
                        ['Cable / Wi-Fi', 'Carries the data', 'The roads'],
                        ['Switch', 'Connects devices inside one place', 'Local traffic police'],
                        ['Router', 'Connects your network to other networks', 'The city gate']
                    ]
                }
            },
            {
                icon: '💬',
                title: 'Client and Server',
                body: 'When you open a website, your computer (the client) asks for a page, and a big computer somewhere (the server) sends it back. One asks, one answers — that is the client/server model.',
                code: 'You (client):     "Give me google.com"\nServer:           "Here is the page" ✔'
            },
            {
                icon: '🌍',
                title: 'From Tiny to Giant',
                body: 'Two laptops at home = a small network. A company connects hundreds of devices across buildings. Connect all the networks of the world together and you get the Internet — literally "a network of networks".'
            },
            {
                icon: '⭐',
                title: 'Why Networks Matter',
                body: 'Networks exist because sharing beats copying:',
                table: {
                    head: ['Benefit', 'Real example'],
                    rows: [
                        ['Share files', 'Send a document to a coworker instantly'],
                        ['Share hardware', 'One printer used by 20 people'],
                        ['Share internet', 'One connection serves the whole house'],
                        ['Central storage', 'Backups kept on a server, not lost PCs']
                    ]
                },
                tip: '💡 Exam tip: know the words host, end device, client, server and "network of networks" — CCNA loves basic definitions.'
            },
        ],
    },

    102: {
        id: 102,
        title: 'LAN — Local Area Network',
        icon: '🏠',
        tagline: 'Your local, fast, private network',
        duration: '7 min',
        sections: [
            {
                icon: '🏠',
                title: 'LAN in One Line',
                body: 'A LAN is a network that lives inside ONE small place — your home, one office floor, or a school building. It is private (you own it), very fast, and everything is close together.'
            },
            {
                icon: '🗺️',
                title: 'What It Looks Like',
                body: 'The switch connects your devices. The router is the exit door to the outside world:',
                code: '[PC] [PC] [Printer]\n   \\   |   /\n   [ Switch ]   <-- this whole thing = LAN\n        |\n    [ Router ] ---> outside world (WAN / Internet)'
            },
            {
                icon: '⚔️',
                title: 'LAN vs WAN',
                body: 'LAN = inside your walls. WAN = the long-distance link between LANs (usually rented from an internet provider).',
                table: {
                    head: ['Feature', 'LAN', 'WAN'],
                    rows: [
                        ['Area', 'One building / home', 'Cities, countries'],
                        ['Speed', 'Very fast (1–10 Gbps)', 'Slower'],
                        ['Who owns it', 'You do', 'Service provider'],
                        ['Cost', 'Cheap', 'Expensive'],
                        ['Example', 'Office network', 'The Internet']
                    ]
                }
            },
            {
                icon: '🔌',
                title: 'What Lives Inside a LAN',
                points: [
                    'End devices — PCs, laptops, printers, IP phones, cameras.',
                    'Switch — plugs them all together.',
                    'Router — the way out to other networks.',
                    'Wi-Fi access point — same LAN, just without wires.',
                    'Optional firewall — a security guard at the door.'
                ]
            },
            {
                icon: '📦',
                title: 'When One LAN Is Not Enough',
                body: 'If 500 devices share one flat LAN, everyone hears every broadcast shout — it gets noisy and slow. Big companies cut the LAN into smaller virtual pieces called VLANs (you will meet them later in this course).',
                tip: '💡 Exam tip: LAN = small area + high speed + privately owned. If a question says "campus network owned by the company", it is a LAN.'
            },
        ],
    },

    103: {
        id: 103,
        title: 'OSI Model & TCP/IP Suite',
        icon: '🧱',
        tagline: 'The 7 layers every network question hides in',
        duration: '12 min',
        sections: [
            {
                icon: '📦',
                title: 'Why Do We Use Layers?',
                body: 'Sending data across the world is too big a job for one step, so we split it into small jobs — layers. Think of mailing a parcel: you write the letter (content), put it in an envelope (wrapping), write the address (label), and the truck carries it (transport). Each layer does ONE job well.',
                points: [
                    'Each layer has its own job.',
                    'Each layer serves the layer above and below it.',
                    'Different companies can build products that still work together.',
                    'Troubleshooting becomes easy: "which layer broke?"'
                ]
            },
            {
                icon: '📚',
                title: 'The OSI Model — 7 Floors of a Building',
                body: 'OSI is a teaching model with 7 layers. Learn what each floor does and which device lives there:',
                table: {
                    head: ['#', 'Layer', 'Its job', 'Device', 'Data unit'],
                    rows: [
                        ['7', 'Application', 'Apps talking (web, email)', '—', 'Data'],
                        ['6', 'Presentation', 'Formats + encryption', '—', 'Data'],
                        ['5', 'Session', 'Starts/stops conversations', '—', 'Data'],
                        ['4', 'Transport', 'Delivery + port numbers', 'Firewall', 'Segment'],
                        ['3', 'Network', 'IP addresses, best path', 'Router', 'Packet'],
                        ['2', 'Data Link', 'MAC addresses, frames', 'Switch', 'Frame'],
                        ['1', 'Physical', 'Bits on wire/radio', 'Hub, cables', 'Bits']
                    ]
                }
            },
            {
                icon: '🎁',
                title: 'Encapsulation — Packing the Parcel',
                body: 'When data travels DOWN the layers, each floor adds its own label (header). Going UP at the other side, labels are removed one by one:',
                code: 'Your words          = Data\n+ TCP header        = Segment   (L4)\n+ IP header         = Packet    (L3)\n+ Ethernet header   = Frame     (L2)\n-> electric/light   = Bits      (L1)'
            },
            {
                icon: '🧠',
                title: 'TCP/IP — The Real-World Version',
                body: 'Real networks do not use all 7 OSI layers; they use the simpler TCP/IP model. Same ideas, fewer boxes. For the exam you must map them:',
                table: {
                    head: ['TCP/IP Layer', 'Covers OSI'],
                    rows: [
                        ['Application', 'Layers 7 + 6 + 5'],
                        ['Transport', 'Layer 4'],
                        ['Internet', 'Layer 3'],
                        ['Network Access', 'Layers 2 + 1']
                    ]
                }
            },
            {
                icon: '✅',
                title: 'Memory Tricks',
                points: [
                    'Top-down: "All People Seem To Need Data Processing" (Application -> Physical).',
                    'Bottom-up: "Please Do Not Throw Sausage Pizza Away".',
                    'Devices: Switch = 2 letters = L2. Router = R looks like 3 = L3.'
                ],
                tip: '💡 Exam tip: memorize "data → segment → packet → frame → bits". Questions love asking the PDU name at each layer.'
            },
        ],
    },
};

// ---------- STAGE 2: NETWORK COMPONENT ----------
MATERIAL['stage-2'].lessons = {

    104: {
        id: 104,
        title: 'Switch',
        icon: '🔀',
        tagline: 'The smart traffic cop of your LAN',
        duration: '8 min',
        sections: [
            {
                icon: '🔀',
                title: 'What a Switch Does',
                body: 'A switch connects many devices inside one LAN. It is smart: instead of shouting every message to everyone, it delivers each frame only to the port of the device it is meant for. Every port gets its own private lane, so many devices can talk at the same time with no collisions.'
            },
            {
                icon: '📖',
                title: 'How It Learns Who Lives Where',
                body: 'The switch keeps a little notebook called the MAC address table. When a frame arrives it: (1) writes down the sender MAC + which port it came in, (2) checks the destination MAC.',
                points: [
                    'Destination known → forward out just that ONE port.',
                    'Destination unknown or broadcast → flood out all other ports.'
                ],
                code: 'MAC Address Table\n---------------------------\nFa0/1   aaaa.bbbb.cccc   PC-A\nFa0/2   dddd.eeee.ffff   PC-B\n# show mac address-table'
            },
            {
                icon: '🚪',
                title: 'Two Important Domains',
                table: {
                    head: ['Domain', 'Meaning', 'Switch behavior'],
                    rows: [
                        ['Collision domain', 'Area where two sends crash', 'ONE PER PORT ✔'],
                        ['Broadcast domain', 'Area that hears broadcasts', 'All ports = still ONE ✘']
                    ]
                },
                tip: '💡 VLANs (later topic) are how we split that single broadcast domain.'
            },
            {
                icon: '⭐',
                title: 'Quick Facts',
                points: [
                    'Works at Layer 2 (Data Link).',
                    'Uses MAC addresses (burned into network cards).',
                    'Full duplex: send + receive simultaneously.',
                    'Modern ports run 1 Gbps / 10 Gbps.'
                ]
            },
        ],
    },

    105: {
        id: 105,
        title: 'Hub',
        icon: '📣',
        tagline: 'The loudspeaker that switches replaced',
        duration: '5 min',
        sections: [
            {
                icon: '📣',
                title: 'A Hub Is a Loudspeaker',
                body: 'A hub is an old, dumb box with several ports. Whatever bits arrive on one port get repeated out of EVERY other port — even if only one device cares. Imagine shouting in a room: everyone hears everything.'
            },
            {
                icon: '💥',
                title: 'Why That Is a Problem',
                points: [
                    'All ports share ONE collision domain — two devices sending together = crash (collision).',
                    'Devices needed CSMA/CD: listen first, send, detect crash, wait random time, retry.',
                    'More devices = more crashes = painfully slow.',
                    'Half duplex only: cannot talk and listen at once.'
                ]
            },
            {
                icon: '⚔️',
                title: 'Hub vs Switch',
                table: {
                    head: ['Feature', 'Hub', 'Switch'],
                    rows: [
                        ['OSI layer', 'Layer 1 (Physical)', 'Layer 2 (Data Link)'],
                        ['Understands', 'Nothing — just repeats', 'MAC addresses'],
                        ['Delivery', 'To everyone', 'Only to the right port'],
                        ['Collision domains', 'One big one', 'One per port'],
                        ['Duplex', 'Half', 'Full'],
                        ['Today?', 'Obsolete 🪦', 'Everywhere ✔']
                    ]
                },
                tip: '💡 Exam tip: hubs are gone from real networks, but CCNA still asks you to explain WHY switches replaced them. This table is the answer.'
            },
        ],
    },

    106: {
        id: 106,
        title: 'Router',
        icon: '🚪',
        tagline: 'The gate between different networks',
        duration: '9 min',
        sections: [
            {
                icon: '🚪',
                title: 'The Gate Between Networks',
                body: 'A switch moves traffic INSIDE your LAN. A router moves traffic BETWEEN networks — it is the exit door of your LAN toward the Internet or other offices. Your home Wi-Fi box is actually a router (plus switch + more in one).'
            },
            {
                icon: '🗺️',
                title: 'How It Decides Where to Send',
                body: 'A router works like a car GPS: it checks its routing table and picks the best road for each packet. Routes come from three places:',
                points: [
                    'Connected routes — networks plugged directly into the router.',
                    'Static routes — a human typed them by hand.',
                    'Dynamic protocols (OSPF, EIGRP) — routers tell each other automatically.'
                ],
                code: 'Routing table example\n-------------------------------\n10.1.0.0/16  ->  GigabitEthernet0/0   (direct)\n0.0.0.0/0    ->  203.0.113.1          (default route = "everything else")'
            },
            {
                icon: '📣',
                title: 'Broadcasts Stop Here',
                body: 'A broadcast says "ATTENTION EVERYONE!" inside one network. Routers never forward broadcasts to the next network — they act as sound-proof walls. That keeps big networks calm, which is why large networks are split into subnets joined by routers.'
            },
            {
                icon: '⚔️',
                title: 'Switch vs Router',
                table: {
                    head: ['Feature', 'Switch', 'Router'],
                    rows: [
                        ['OSI layer', 'Layer 2', 'Layer 3'],
                        ['Address used', 'MAC', 'IP'],
                        ['Moves', 'Frames inside a LAN', 'Packets between networks'],
                        ['Broadcast domains', 'One big one', 'One per interface ✔'],
                        ['Extras', 'VLANs later on', 'NAT, DHCP, firewall often built-in']
                    ]
                },
                tip: '💡 Exam tip: "Which device separates broadcast domains?" → Router. "Which device creates many collision domains?" → Switch (one per port).'
            },
        ],
    },

    107: {
        id: 107,
        title: 'Network Cables',
        icon: '🧵',
        tagline: 'Copper, fiber, and which wire goes where',
        duration: '10 min',
        sections: [
            {
                icon: '🧵',
                title: 'Copper — Twisted Pair (UTP)',
                body: 'The most common cable in offices: 8 thin copper wires twisted into 4 pairs (twisting reduces interference), ending in an RJ-45 plug that clicks into your switch like a phone charger.',
                table: {
                    head: ['Category', 'Top speed', 'Max length'],
                    rows: [
                        ['Cat5e', '1 Gbps', '100 m'],
                        ['Cat6', '10 Gbps (short runs)', '100 m'],
                        ['Cat6a', '10 Gbps', '100 m']
                    ]
                }
            },
            {
                icon: '🔀',
                title: 'Straight-Through vs Crossover',
                body: 'Two ways to wire the RJ-45 ends. The old rule is simple:',
                table: {
                    head: ['Connecting...', 'Use this cable'],
                    rows: [
                        ['Different devices (PC→switch, switch→router)', 'Straight-through'],
                        ['Same devices (PC→PC, switch→switch)', 'Crossover']
                    ]
                },
                code: 'T568B order (straight-through, both ends):\n1 Orange-W  2 Orange   3 Green-W  4 Blue\n5 Blue-W    6 Green    7 Brown-W  8 Brown'
            },
            {
                icon: '✨',
                title: 'Fiber Optic — Light Speed',
                body: 'Fiber sends light through glass instead of electricity through copper. It ignores electrical noise completely and travels MUCH farther — that is why ISPs and data centers love it.',
                points: [
                    'Multimode (orange): short hops, ~550 m, cheaper.',
                    'Single-mode (yellow): tens of kilometers, used by providers.',
                    'Downside: costs more and is trickier to install than copper.'
                ]
            },
            {
                icon: '🔧',
                title: 'The Console Cable',
                body: 'A special cable from your laptop to a device console port. It carries no network traffic — it just gives you a command-line window so you can configure a brand-new switch/router (exactly what our CLI labs simulate).'
            },
            {
                icon: '📝',
                title: '30-Second Cheat Sheet',
                points: [
                    'UTP copper → up to 100 m → cheap default choice.',
                    'Fiber → long distance + zero interference → higher cost.',
                    'Straight-through → unlike devices. Crossover → like devices.',
                    'Console cable → direct management access.'
                ],
                tip: '💡 Modern ports have Auto-MDIX which fixes a wrong cable automatically — but CCNA still tests the classic straight vs crossover rule!'
            },
        ],
    },
};

// ---------- STAGE 3: TRANSPORT LAYER ----------
MATERIAL['stage-3'].lessons = {

    108: {
        id: 108,
        title: 'Transport Layer',
        icon: '🚚',
        tagline: 'Delivery service between two apps',
        duration: '9 min',
        sections: [
            {
                icon: '🚚',
                title: 'What It Does',
                body: 'IP gets data to the right COMPUTER. The transport layer (Layer 4) gets it to the right PROGRAM on that computer — Chrome, a game, WhatsApp. It is like a courier who not only finds your building but also your exact flat number.',
                code: 'Layer 3: PC -> PC   (IP address)\nLayer 4: App -> App (Port number)'
            },
            {
                icon: '🛠️',
                title: 'Its Main Jobs',
                points: [
                    'Tracking conversations — each app chat gets its own session.',
                    'Segmentation — cuts big data into small pieces (segments) and numbers them so they can be rebuilt in order.',
                    'Port numbers — a label saying WHICH application the data belongs to.',
                    'Reliability (optional) — TCP can resend anything that got lost.'
                ]
            },
            {
                icon: '⚖️',
                title: 'Two Protocols to Choose From',
                body: 'Layer 4 gives you a choice: TCP = reliable but slower (like registered post with signature), UDP = fast but no guarantees (like throwing letters over the wall). Next lessons cover both.'
            },
            {
                icon: '⭐',
                title: 'Quick Facts',
                table: {
                    head: ['Feature', 'TCP', 'UDP'],
                    rows: [
                        ['Connection', 'Connection-oriented', 'Connectionless'],
                        ['Reliability', 'Resends lost data ✔', 'No resending'],
                        ['Speed', 'Slower', 'Faster'],
                        ['Best for', 'Web, email, files', 'Voice, video, games']
                    ]
                },
                tip: '💡 Exam tip: segments are built at Layer 4. Port numbers also live at Layer 4.'
            },
        ],
    },

    109: {
        id: 109,
        title: 'Ports',
        icon: '🚪',
        tagline: 'Flat numbers that identify applications',
        duration: '8 min',
        sections: [
            {
                icon: '🚪',
                title: 'A Port Is an App Number',
                body: 'A port is just a number (0–65535) that identifies WHICH application should receive the data. Your PC can talk to 50 servers at once only because every session uses its own port pair.',
                code: 'Browser  -> server:443    (HTTPS)\nEmail    -> server:25     (SMTP)\nGame     -> server:27015\nAll on ONE internet connection!'
            },
            {
                icon: '📊',
                title: 'Well-Known Ports to Memorize',
                table: {
                    head: ['Port', 'Protocol', 'Used for'],
                    rows: [
                        ['20/21', 'FTP', 'File transfer'],
                        ['22', 'SSH', 'Secure remote login'],
                        ['23', 'Telnet', 'Old remote login (insecure)'],
                        ['25', 'SMTP', 'Sending email'],
                        ['53', 'DNS', 'Name to IP lookup'],
                        ['67/68', 'DHCP', 'Automatic IP assignment']
                    ]
                }
            },
            {
                icon: '🌐',
                title: 'Web & Mail Ports Too',
                table: {
                    head: ['Port', 'Protocol', 'Used for'],
                    rows: [
                        ['80', 'HTTP', 'Websites'],
                        ['110', 'POP3', 'Receiving email'],
                        ['143', 'IMAP', 'Receiving email (synced)'],
                        ['443', 'HTTPS', 'Secure websites']
                    ]
                }
            },
            {
                icon: '🔢',
                title: 'Three Port Ranges',
                table: {
                    head: ['Range', 'Name', 'Who uses it'],
                    rows: [
                        ['0 – 1023', 'Well-known', 'Standard services (HTTP, DNS...)'],
                        ['1024 – 49151', 'Registered', 'Vendor apps (games, databases)'],
                        ['49152 – 65535', 'Dynamic', 'Your OS picks one per session']
                    ]
                },
                tip: '💡 Exam tip: memorize SSH=22, DNS=53, HTTP=80, HTTPS=443 as absolute minimum — CCNA asks them constantly. IP + port together is called a SOCKET.'
            },
        ],
    },

    110: {
        id: 110,
        title: 'TCP',
        icon: '🔗',
        tagline: 'Reliable, ordered, connection-first delivery',
        duration: '11 min',
        sections: [
            {
                icon: '📞',
                title: 'TCP in One Line',
                body: 'TCP (Transmission Control Protocol) first builds a connection, then delivers everything exactly once and in order — like a phone call: you say hello, wait for hi back, then talk.'
            },
            {
                icon: '🤝',
                title: 'The 3-Way Handshake',
                body: 'Before any real data moves, both sides agree to talk:',
                code: 'Client  --SYN---->        Server\n        ("want to talk?")\nClient  <--SYN+ACK--      Server\n        ("sure, you talk too")\nClient  --ACK---->        Server\n        ("great, starting!")'
            },
            {
                icon: '✅',
                title: 'How TCP Stays Reliable',
                points: [
                    'Sequence numbers — every byte is counted, so order is known.',
                    'Acknowledgements (ACK) — receiver confirms what arrived.',
                    'Retransmission — no ACK came back? Send it again.',
                    'Flow control (windowing) — receiver says how much it can handle.',
                    'Duplicates are dropped — app never gets the same data twice.'
                ]
            },
            {
                icon: '👋',
                title: 'Closing Politely',
                body: 'TCP ends a session with a 4-step goodbye so nothing is cut off mid-sentence:',
                code: 'FIN --> ACK <-- FIN <-- ACK -->\n(both sides agree to hang up)'
            },
            {
                icon: '📦',
                title: 'Where TCP Shines',
                table: {
                    head: ['Use case', 'Why TCP fits'],
                    rows: [
                        ['Browsing / HTTPS', 'Page must arrive complete'],
                        ['Email', 'Message must not be corrupt'],
                        ['File transfer / SSH', 'Every byte matters'],
                        ['Downloads', 'Missing pieces get resent']
                    ]
                },
                tip: '💡 Exam tip: SYN -> SYN/ACK -> ACK. If a question mentions reliability, ordering or handshakes, the answer is TCP.'
            },
        ],
    },

    111: {
        id: 111,
        title: 'UDP',
        icon: '⚡',
        tagline: 'Fast, simple, send-and-forget',
        duration: '7 min',
        sections: [
            {
                icon: '⚡',
                title: 'UDP in One Line',
                body: 'UDP (User Datagram Protocol) just sends. No handshake, no resending, no order guarantee. That sounds bad, but for live voice and video it is PERFECT: nobody cares about one lost millisecond of audio, but everyone hates waiting for a resend.'
            },
            {
                icon: '🧊',
                title: 'Why UDP Is So Fast',
                points: [
                    'No 3-way handshake — data leaves immediately.',
                    'Tiny header: only 8 bytes (TCP needs 20+).',
                    'No acknowledgements, no retransmissions, no flow control.',
                    'Very low delay (latency).'
                ]
            },
            {
                icon: '📡',
                title: 'Where UDP Wins',
                table: {
                    head: ['Use case', 'Why UDP fits'],
                    rows: [
                        ['Live calls (RTP)', 'New audio beats old audio'],
                        ['Video streaming', 'Skip a frame rather than freeze'],
                        ['Online gaming', 'Position updates expire fast'],
                        ['DNS (53)', 'One tiny query, quick answer'],
                        ['DHCP (67/68)', 'Simple broadcast request']
                    ]
                }
            },
            {
                icon: '⚔️',
                title: 'TCP vs UDP Final Round',
                table: {
                    head: ['', 'TCP 🔗', 'UDP ⚡'],
                    rows: [
                        ['Setup', '3-way handshake', 'None'],
                        ['Guarantees', 'Ordered, complete', 'None'],
                        ['Header size', '20 bytes', '8 bytes'],
                        ['Speed', 'Slower', 'Fastest'],
                        ['Remember as', 'Phone call 📞', 'Postcard ✉️']
                    ]
                },
                tip: '💡 Exam tip: DNS uses UDP port 53 by default. Voice/video/gaming = UDP. Web/email/file transfer = TCP.'
            },
        ],
    },
};



// ---------- STAGE 4: NETWORK LAYER ----------
MATERIAL['stage-4'].lessons = {

    112: {
        id: 112,
        title: 'IP Header',
        icon: '✉️',
        tagline: 'The envelope wrapped around every packet',
        duration: '10 min',
        sections: [
            {
                icon: '✉️',
                title: 'What the IP Header Is',
                body: 'Every packet gets an IP header stuck on the front — like an envelope with a "from" and "to" address plus a few delivery notes. Routers read ONLY this header to move packets across the world. IPv4 header = 20 bytes (up to 60 with options).'
            },
            {
                icon: '🧾',
                title: 'The Fields That Matter',
                table: {
                    head: ['Field', 'What it says'],
                    rows: [
                        ['Version', 'IPv4 or IPv6'],
                        ['Header Length', 'How big the envelope itself is'],
                        ['Total Length', 'Header + data size'],
                        ['TTL', 'Hops allowed; each router subtracts 1 — stops endless loops'],
                        ['Protocol', 'Whats inside: 6 = TCP, 17 = UDP, 1 = ICMP'],
                        ['Source IP', 'Sender address'],
                        ['Destination IP', 'Receiver address']
                    ]
                }
            },
            {
                icon: '⏳',
                title: 'TTL — The Lifesaver',
                body: 'Imagine two routers pointing at each other by mistake: a packet would bounce forever. TTL prevents this. It starts at 64 (or 128); every router subtracts 1. At 0 the packet is thrown away.',
                code: 'ping reply shows ttl=57\n-> started at 64, passed through 7 routers'
            },
            {
                icon: '🏷️',
                title: 'Protocol Field = Which L4 Opens It',
                points: [
                    '6  -> TCP (web, email, files)',
                    '17 -> UDP (voice, DNS)',
                    '1  -> ICMP (ping)'
                ],
                tip: '💡 Exam tip: know 6=TCP, 17=UDP, 1=ICMP — and that TTL decreases by 1 at every router.'
            },
        ],
    },

    113: {
        id: 113,
        title: 'Unicast, Multicast & Broadcast',
        icon: '📣',
        tagline: 'One-to-one, one-to-group, one-to-all',
        duration: '9 min',
        sections: [
            {
                icon: '🎯',
                title: 'Unicast — One to One',
                body: 'Normal everyday traffic: one sender talks to exactly ONE receiver. Browsing a website is unicast.',
                code: 'PC-A -> 192.168.1.20   (only PC-B receives it)'
            },
            {
                icon: '📺',
                title: 'Multicast — One to a Group',
                body: 'One sender reaches MANY interested devices at once — like a live stream only subscribers watch. Uses a reserved address range:',
                points: [
                    'IPv4 multicast range: 224.0.0.0 – 239.255.255.255 (Class D).',
                    'Famous example: 224.0.0.5 = ALL OSPF routers.',
                    'Only devices that join the group actually process it.'
                ]
            },
            {
                icon: '📢',
                title: 'Broadcast — One to EVERYONE',
                body: 'A shout that all devices in the network must hear. Used by ARP ("who has this IP?") and DHCP requests.',
                code: 'Limited broadcast : 255.255.255.255  (this network)\nDirected broadcast: 192.168.1.255    (last addr of subnet)\nMAC broadcast     : FF:FF:FF:FF:FF:FF'
            },
            {
                icon: '⚔️',
                title: 'Side by Side',
                table: {
                    head: ['Type', 'Goes to', 'Example use'],
                    rows: [
                        ['Unicast', 'One host', 'Web browsing'],
                        ['Multicast', 'Subscribed group', 'IPTV, routing updates'],
                        ['Broadcast', 'All hosts in LAN', 'ARP, DHCP discover']
                    ]
                },
                tip: '💡 Exam tip: routers do NOT forward broadcasts. Multicast addresses always start between 224 and 239.'
            },
        ],
    },

    114: {
        id: 114,
        title: 'Types of IP Address',
        icon: '🗂️',
        tagline: 'Public vs private, static vs dynamic, special ones',
        duration: '9 min',
        sections: [
            {
                icon: '🌍',
                title: 'Public vs Private',
                table: {
                    head: ['', 'Private 🔒', 'Public 🌍'],
                    rows: [
                        ['Where used', 'Inside home/office LANs', 'On the Internet'],
                        ['Unique?', 'Only inside your LAN', 'Worldwide unique'],
                        ['Routed online?', 'No — routers drop it', 'Yes'],
                        ['Who gives it', 'Your own router (DHCP)', 'Your ISP'],
                        ['Cost', 'Free', 'Usually paid']
                    ]
                }
            },
            {
                icon: '⚙️',
                title: 'Static vs Dynamic',
                points: [
                    'Static — typed in by hand, never changes. Best for servers, printers, routers.',
                    'Dynamic — handed out automatically by DHCP. Best for laptops and phones.'
                ]
            },
            {
                icon: '🚫',
                title: 'Special Addresses You Must Know',
                table: {
                    head: ['Address', 'Meaning'],
                    rows: [
                        ['127.0.0.1', 'Loopback — test your OWN PC ("localhost")'],
                        ['169.254.x.x', 'APIPA — DHCP failed, PC picked its own IP'],
                        ['x.x.x.0', 'Network address — names the whole subnet'],
                        ['x.x.x.255', 'Broadcast address of that subnet'],
                        ['255.255.255.255', 'Broadcast to everyone here and now']
                    ]
                }
            },
            {
                icon: '🏠',
                title: 'The 3 Private Ranges (Memorize!)',
                code: 'A: 10.0.0.0    - 10.255.255.255\nB: 172.16.0.0  - 172.31.255.255\nC: 192.168.0.0 - 192.168.255.255'
            },
            {
                icon: '🔍',
                title: 'Quick Self-Check',
                body: 'See 192.168.1.50? Private + probably DHCP. See 8.8.8.8? Public (Google DNS). See 169.254.x.x on a PC? Its DHCP request failed — classic troubleshooting answer!',
                tip: '💡 Exam tip: APIPA (169.254.x.x) in a scenario almost always means "DHCP server unreachable".'
            },
        ],
    },
};

// ---------- STAGE 5: IPV4 ADDRESSING ----------
MATERIAL['stage-5'].lessons = {

    115: {
        id: 115,
        title: 'IPv4 Address Explained',
        icon: '🔢',
        tagline: '32 bits, 4 numbers, one identity',
        duration: '9 min',
        sections: [
            {
                icon: '🔢',
                title: 'The Basics',
                body: 'An IPv4 address is a 32-bit number written as four blocks (octets) from 0 to 255, separated by dots. Every device that wants to use IP needs one. Example: 192.168.1.50.',
                code: '192   .   168   .    1   .   50\n11000000 10101000 00000001 00110010\n(each octet = 8 bits = value 0..255)'
            },
            {
                icon: '✂️',
                title: 'Two Parts: Network + Host',
                body: 'Every IP splits into two parts. The NETWORK part says which street you live on; the HOST part says which house on that street. The subnet mask decides where the split happens.',
                code: '192.168.1.50 /24\n[ 192.168.1 | .50 ]\n  network     host\n  (street)    (house)'
            },
            {
                icon: '🧮',
                title: 'How Many Hosts Fit?',
                body: 'Count host bits and use 2^bits minus 2. Why minus 2? One address is reserved as the network name and one as broadcast.',
                code: '/24 -> 8 host bits -> 2^8 - 2 = 254 usable hosts\n/30 -> 2 host bits -> 2^2 - 2 = 2 usable hosts'
            },
            {
                icon: '⭐',
                title: 'Rules to Remember',
                points: [
                    'Each octet ranges from 0 to 255 only.',
                    'Hosts on the SAME network need DIFFERENT IPs.',
                    'Two devices can share an IP only on DIFFERENT networks.',
                    'Learn powers of 2: 128, 192, 224, 240, 248, 252, 254, 255.'
                ],
                tip: '💡 Exam tip: practice ONE binary-to-decimal conversion and the whole topic unlocks.'
            },
        ],
    },

    116: {
        id: 116,
        title: 'Subnet Mask',
        icon: '🎭',
        tagline: 'The line that splits network from host',
        duration: '9 min',
        sections: [
            {
                icon: '🎭',
                title: 'What It Really Does',
                body: 'The mask MARKS where the network part ends and the host part begins: 1-bits = network, 0-bits = host. Your PC ANDs its IP with the mask to learn which network it belongs to.',
                code: 'IP    192.168.1.50 -> 11000000.10101000.00000001.00110010\nMask  255.255.255.0 -> 11111111.11111111.11111111.00000000\nAND               -> 11000000.10101000.00000001.00000000\n                  = 192.168.1.0  <- "my network"'
            },
            {
                icon: '📏',
                title: 'Common Masks',
                table: {
                    head: ['CIDR', 'Dotted mask', 'Usable hosts'],
                    rows: [
                        ['/8', '255.0.0.0', '16,777,214'],
                        ['/16', '255.255.0.0', '65,534'],
                        ['/24', '255.255.255.0', '254'],
                        ['/30', '255.255.255.252', '2']
                    ]
                }
            },
            {
                icon: '🏠',
                title: 'Same Network or No Direct Talk',
                body: 'Two devices talk directly ONLY if their network parts match. If not, traffic goes through the default gateway (router). A wrong mask breaks communication even when IPs look fine — a favorite exam trap.'
            },
            {
                icon: '🧠',
                title: 'Shortcut Trick',
                body: 'Mask octet values always step like this: 128, 192, 224, 240, 248, 252, 254, 255 — each step adds ONE more network bit.',
                tip: '💡 Exam tip: /24 simply means 24 one-bits in the mask. Count CIDR bits!'
            },
        ],
    },
};


// ---------- STAGE 5 CONT: CLASSES ----------
MATERIAL['stage-5'].lessons[117] = {
    id: 117,
    title: 'Classes of IP Addresses',
    icon: '🏛️',
    tagline: 'A, B, C, D, E — the old sorting system',
    duration: '8 min',
    sections: [
        {
            icon: '🏛️',
            title: 'The Class Table',
            body: 'Before CIDR existed, the FIRST octet decided everything. You still need this for the exam:',
            table: {
                head: ['Class', 'First octet', 'Default mask', 'Use'],
                rows: [
                    ['A', '1 – 126', '255.0.0.0 (/8)', 'Huge networks'],
                    ['B', '128 – 191', '255.255.0.0 (/16)', 'Medium networks'],
                    ['C', '192 – 223', '255.255.255.0 (/24)', 'Small networks'],
                    ['D', '224 – 239', '—', 'Multicast'],
                    ['E', '240 – 255', '—', 'Experimental']
                ]
            }
        },
        {
            icon: '🔍',
            title: 'Spot the Class Instantly',
            points: [
                'Starts 1–126 → Class A (10.x.x.x is private-A).',
                '127 → not a class at all — loopback!',
                'Starts 128–191 → Class B (172.16–31.x.x private-B).',
                'Starts 192–223 → Class C (192.168.x.x private-C).'
            ]
        },
        {
            icon: '📉',
            title: 'Why Classes Died',
            body: 'A Class A gave away 16 million addresses to one company — massive waste. The world switched to CIDR (/prefix), where the mask can be ANY length.'
        },
        {
            icon: '⭐',
            title: 'Memory Hook',
            body: 'A = Awesome big, B = Balanced medium, C = Cute small, D = Distribution (multicast), E = Experiments.',
            tip: '💡 Exam tip: first-octet questions are free marks. See 172.20.x.x? Instantly think "Class B".'
        },
    ],
};

// ---------- STAGE 6: SUBNETTING ----------
MATERIAL['stage-6'].lessons = {

    118: {
        id: 118,
        title: 'Subnetting',
        icon: '🍰',
        tagline: 'Slicing one network into many smaller ones',
        duration: '14 min',
        sections: [
            {
                icon: '🍰',
                title: 'Why Subnet?',
                body: 'Subnetting = cutting one big network into smaller pieces (subnets) by borrowing host bits and turning them into network bits. Why? Smaller broadcast domains, better security between departments, no wasted addresses.'
            },
            {
                icon: '🪄',
                title: 'The Magic Formula',
                code: 'Subnets created  = 2^borrowed bits\nHosts per subnet = 2^remaining host bits - 2\n\n192.168.1.0/24 -> borrow 2 bits -> /26\n  subnets = 2^2 = 4\n  hosts   = 2^6 - 2 = 62 per subnet'
            },
            {
                icon: '🗺️',
                title: 'Worked Example Step by Step',
                body: 'Split 192.168.1.0/24 into 4 subnets using /26:',
                code: '/26 mask = 255.255.255.192\nBlock size = 256 - 192 = 64\n\nSubnet 1: .0   - .63   (.0 net, .63 broadcast)\nSubnet 2: .64  - .127  (hosts .65 - .126)\nSubnet 3: .128 - .191\nSubnet 4: .192 - .255'
            },
            {
                icon: '🧭',
                title: 'The Block Size Trick',
                points: [
                    'Block size = 256 − last interesting mask octet.',
                    'Subnets start at 0 and jump by block size: 0, 64, 128, 192...',
                    'Last address of a subnet = its broadcast.',
                    'First usable = network + 1; last usable = broadcast − 1.'
                ],
                tip: '💡 Practice daily — subnetting speed decides whether you finish the CCNA exam on time!'
            },
        ],
    },

    119: {
        id: 119,
        title: 'CIDR',
        icon: '➗',
        tagline: 'Classless addressing: any mask length you want',
        duration: '9 min',
        sections: [
            {
                icon: '➗',
                title: 'What CIDR Means',
                body: 'CIDR (Classless Inter-Domain Routing) throws away fixed classes. Instead of "Class B" you write exactly how many bits are network: /22, /27 — anything. Format: IP/prefix, e.g. 10.1.1.0/22.'
            },
            {
                icon: '📊',
                title: 'Prefix Cheat Table',
                table: {
                    head: ['Prefix', 'Mask', 'Hosts'],
                    rows: [
                        ['/24', '255.255.255.0', '254'],
                        ['/25', '255.255.255.128', '126'],
                        ['/26', '255.255.255.192', '62'],
                        ['/27', '255.255.255.224', '30'],
                        ['/28', '255.255.255.240', '14'],
                        ['/29', '255.255.255.248', '6'],
                        ['/30', '255.255.255.252', '2']
                    ]
                }
            },
            {
                icon: '🎁',
                title: 'Route Summarization Bonus',
                body: 'CIDR also works upward: many small networks can be advertised as ONE bigger route — smaller routing tables, faster routers.',
                code: '172.16.0.0/24\n172.16.1.0/24\n172.16.2.0/24\n172.16.3.0/24\n= summarize as 172.16.0.0/22'
            },
            {
                icon: '🧮',
                title: 'Reading Any Prefix Fast',
                body: 'For /X: host bits = 32 − X, usable hosts = 2^(32−X) − 2. Every CIDR question is just this one formula.',
                tip: '💡 Exam tip: /27 → mask 255.255.255.224 → block size 256−224 = 32.'
            },
        ],
    },

    120: {
        id: 120,
        title: 'VLSM',
        icon: '📐',
        tagline: 'Different subnet sizes in one network',
        duration: '11 min',
        sections: [
            {
                icon: '📐',
                title: 'The Problem VLSM Solves',
                body: 'Plain subnetting gives every piece the SAME size. A LAN needs 100 hosts, but a router-to-router link only needs 2 — giving it /26 wastes 60 addresses. VLSM (Variable Length Subnet Mask) lets each piece get its own right-sized mask.'
            },
            {
                icon: '📏',
                title: 'The Golden Rule: Biggest First',
                points: [
                    'Sort requirements from LARGEST to smallest.',
                    'Give the biggest network the first block.',
                    'Next subnet starts where the previous one ended.',
                    'Use /30 for every point-to-point router link.'
                ]
            },
            {
                icon: '🧩',
                title: 'Worked Example',
                body: 'From 192.168.1.0/24 give: Sales 100 hosts, HR 50 hosts, IT 20 hosts, one WAN link:',
                code: '/25 = 126 hosts -> Sales : .0   - .127\n/26 = 62  hosts -> HR    : .128 - .191\n/27 = 30  hosts -> IT    : .192 - .223\n/30 = 2   hosts -> WAN   : .224 - .227\n(wasted space? almost none!)'
            },
            {
                icon: '⚔️',
                title: 'Subnetting vs VLSM',
                table: {
                    head: ['', 'Normal', 'VLSM'],
                    rows: [
                        ['Mask per subnet', 'Same everywhere', 'Each its own'],
                        ['Address waste', 'High', 'Minimal'],
                        ['Complexity', 'Easy', 'Needs planning'],
                        ['Also called', 'FLSM', 'Classless subnetting']
                    ]
                },
                tip: '💡 Exam tip: always start from the largest requirement or you will create overlapping subnets.'
            },
        ],
    },

    121: {
        id: 121,
        title: 'Private IP Addresses',
        icon: '🔒',
        tagline: 'Free addresses that never touch the Internet directly',
        duration: '8 min',
        sections: [
            {
                icon: '🔒',
                title: 'What "Private" Means',
                body: 'Three ranges were reserved for anyone to use inside their own networks — free of charge, no permission needed. They are NOT routable on the Internet; routers on the Internet simply drop them.'
            },
            {
                icon: '📋',
                title: 'The Three Ranges',
                table: {
                    head: ['Class feel', 'Range', 'Typical use'],
                    rows: [
                        ['10.x.x.x', '10.0.0.0 – 10.255.255.255 (/8)', 'Big companies'],
                        ['172.16–31.x.x', '172.16.0.0 – 172.31.255.255 (/12)', 'Medium networks'],
                        ['192.168.x.x', '192.168.0.0 – 192.168.255.255 (/16)', 'Homes, small office']
                    ]
                }
            },
            {
                icon: '🔁',
                title: 'How Private IPs Reach the Internet: NAT',
                body: 'Your router keeps a private IP inside and swaps it for its PUBLIC IP when traffic leaves (NAT — Network Address Translation). Replies come back to the public IP, and the router sends them to the right private device.',
                code: 'PC 192.168.1.50 -> Router NAT -> 203.0.113.5 (public) -> Internet'
            },
            {
                icon: '🎁',
                title: 'Why This Saved the Internet',
                body: 'Billions of devices share millions of public IPs thanks to private + NAT. Every home Wi-Fi reuses 192.168.1.x — that is fine because those packets never appear on the Internet with those addresses.',
                tip: '💡 Exam tip: memorize the three ranges exactly. 172 range starts at 172.16 — not 172.0!'
            },
        ],
    },
};

// ---------- STAGE 7: DATA LINK LAYER ----------
MATERIAL['stage-7'].lessons = {

    122: {
        id: 122,
        title: 'Ethernet & the Ethernet Frame',
        icon: '🔗',
        tagline: 'The language of every LAN',
        duration: '10 min',
        sections: [
            {
                icon: '🔗',
                title: 'What Ethernet Is',
                body: 'Ethernet is THE Layer-2 technology used in almost every wired LAN today. It defines how devices format data (frames), how they are addressed (MAC), and how they take turns on the wire.'
            },
            {
                icon: '📦',
                title: 'Anatomy of an Ethernet Frame',
                table: {
                    head: ['Field', 'Job'],
                    rows: [
                        ['Preamble', 'Wake-up signal so receivers sync'],
                        ['Destination MAC', 'Who should receive it'],
                        ['Source MAC', 'Who sent it'],
                        ['Type', 'Whats inside: IPv4 / IPv6 / ARP'],
                        ['Data', 'The actual payload (packet)'],
                        ['FCS', 'Checksum — detects corrupted frames']
                    ]
                }
            },
            {
                icon: '🛡️',
                title: 'FCS — The Integrity Check',
                body: 'Sender calculates a number from the frame contents and puts it in FCS. Receiver recalculates; if it differs, the frame was damaged in transit and is silently dropped. Ethernet does NOT resend — that is TCPs job if needed.'
            },
            {
                icon: '📏',
                title: 'Size Rules',
                points: [
                    'Minimum frame: 64 bytes.',
                    'Maximum standard frame: 1518 bytes.',
                    'Payload limit = 1500 bytes — the famous MTU.',
                    'Too small ("runt") or too big ("giant") = discarded.'
                ],
                tip: '💡 Exam tip: MTU 1500 lives at Layer 2 with Ethernet.'
            },
        ],
    },

    123: {
        id: 123,
        title: 'MAC Address vs IP Address',
        icon: '🏷️',
        tagline: 'Physical identity vs logical location',
        duration: '8 min',
        sections: [
            {
                icon: '🏷️',
                title: 'Two Names, Two Jobs',
                body: 'Every device carries BOTH addresses. The MAC identifies the physical network card; the IP identifies where the device lives in network logic.',
                code: 'MAC: a4:5e:60:1f:22:9b   (48-bit, burned into NIC)\nIP : 192.168.1.50        (32-bit, from DHCP or manual)'
            },
            {
                icon: '⚔️',
                title: 'Head to Head',
                table: {
                    head: ['', 'MAC', 'IP'],
                    rows: [
                        ['Layer', 'Layer 2 (Data Link)', 'Layer 3 (Network)'],
                        ['Format', 'Hex, 48 bits', 'Dotted decimal, 32 bits'],
                        ['Assigned', 'Factory burned-in', 'DHCP or manual'],
                        ['Changes?', 'Stays with the card', 'Changes per network'],
                        ['Scope', 'Local link only', 'Across networks'],
                        ['Used by', 'Switches', 'Routers']
                    ]
                }
            },
            {
                icon: '📮',
                title: 'Post Office Analogy',
                body: 'IP is like a postal ADDRESS on an envelope (changes when you move house). MAC is like the persons NAME inside (stays forever). ARP finds which MAC owns which IP on your LAN.'
            },
            {
                icon: '🔄',
                title: 'Working Together',
                code: 'PC-A -> PC-B same LAN:\n[dst MAC B | src MAC A][dst IP B | src IP A]\nSwitch reads the MAC layer.\nRouter reads the IP layer and\nrewrites MACs at every hop.'
            },
            {
                icon: '💡',
                title: 'Exam One-Liner',
                body: 'MAC = who you physically are on this cable. IP = where you logically live in the world.',
                tip: '💡 Exam tip: MAC stays constant across networks; IP changes as the device moves.'
            },
        ],
    },
};

// ---------- STAGE 8: PHYSICAL LAYER ----------
MATERIAL['stage-8'].lessons = {

    124: {
        id: 124,
        title: 'Types of Ethernet Cabling',
        icon: '🔌',
        tagline: 'Which wire connects what, and how',
        duration: '10 min',
        sections: [
            {
                icon: '🔌',
                title: 'The Cable Families',
                table: {
                    head: ['Cable', 'Medium', 'Typical job'],
                    rows: [
                        ['UTP (Cat5e/6/6a)', 'Copper pairs, RJ-45', 'PCs to switches, up to 100 m'],
                        ['Fiber optic', 'Light through glass', 'Buildings, backbones, long runs'],
                        ['Console (rollover)', 'Copper, RJ-45/USB', 'Direct device management'],
                        ['Coaxial', 'Single copper core', 'Old LANs, ISP/cable TV']
                    ]
                }
            },
            {
                icon: '🔀',
                title: 'Straight-Through vs Crossover',
                table: {
                    head: ['You connect...', 'Use'],
                    rows: [
                        ['Different types (PC→switch, switch→router)', 'Straight-through'],
                        ['Same type (switch→switch, PC→PC, router→router)', 'Crossover']
                    ]
                },
                code: 'Straight : T568B | T568B\nCrossover: T568A | T568B'
            },
            {
                icon: '✨',
                title: 'UTP Categories Recap',
                table: {
                    head: ['Cat', 'Speed', 'Note'],
                    rows: [
                        ['Cat5e', '1 Gbps', 'Cheapest gigabit option'],
                        ['Cat6', '10 Gbps up to ~55 m', 'Most common new install'],
                        ['Cat6a', '10 Gbps at 100 m', 'Future-proof offices']
                    ]
                }
            },
            {
                icon: '💡',
                title: 'Modern Reality',
                body: 'Auto-MDIX lets modern ports detect the cable type and fix wiring internally — crossover cables are nearly extinct. But CCNA still tests the classic rule!',
                tip: '💡 Exam tip: fiber for EMI-heavy areas or distances beyond 100 m; UTP otherwise.'
            },
        ],
    },

    125: {
        id: 125,
        title: 'PoE & IEEE Standards',
        icon: '⚡',
        tagline: 'Power over Ethernet + the standards that rule them all',
        duration: '9 min',
        sections: [
            {
                icon: '⚡',
                title: 'What Is PoE?',
                body: 'PoE (Power over Ethernet) sends ELECTRICITY through the same UTP cable that carries data. One cable powers AND connects cameras, Wi-Fi access points and IP phones — no power socket needed near the ceiling.'
            },
            {
                icon: '📋',
                title: 'PoE Standards Compared',
                table: {
                    head: ['Standard', 'IEEE name', 'Power at device'],
                    rows: [
                        ['PoE', '802.3af', 'Up to 15.4 W'],
                        ['PoE+', '802.3at', 'Up to 30 W'],
                        ['PoE++ Type 3', '802.3bt', 'Up to 60 W'],
                        ['PoE++ Type 4', '802.3bt', 'Up to 100 W']
                    ]
                }
            },
            {
                icon: '🏠',
                title: 'Where PoE Shines',
                points: [
                    'IP cameras — mount anywhere a cable reaches.',
                    'Wi-Fi access points — usually need PoE+ or higher.',
                    'VoIP phones — classic PoE is plenty.',
                    'One UPS on the PoE switch protects everything it powers.'
                ]
            },
            {
                icon: '📜',
                title: 'IEEE — The Rulebook Writer',
                body: 'The IEEE publishes the standards everyone follows so gear from different vendors works together.',
                table: {
                    head: ['IEEE standard', 'Defines'],
                    rows: [
                        ['802.3', 'Ethernet (wired LAN)'],
                        ['802.11', 'Wi-Fi (wireless LAN)'],
                        ['802.1Q', 'VLAN tagging'],
                        ['802.1X', 'Port-based authentication']
                    ]
                },
                tip: '💡 Exam tip: af=15W, at=30W ("t" comes after "f"... later letter, more power!). Ethernet=802.3, Wi-Fi=802.11.'
            },
        ],
    },
};

/** Get a single lesson by ID across all stages */
function getLesson(id) {
    for (const stage of Object.values(LABS)) {
        if (stage.lessons[id]) return stage.lessons[id];
    }
    return null;
}

/** Get a CCNA material (theory) lesson by ID across material stages */
function getMaterialLesson(id) {
    for (const stage of Object.values(MATERIAL)) {
        if (stage.lessons[id]) return stage.lessons[id];
    }
    return null;
}

/** Get the stage container (with stage number + name) that owns a lesson, or null. */
function getLessonStage(lessonId) {
    for (const stage of Object.values(LABS)) {
        if (stage.lessons[lessonId]) return stage;
    }
    return null;
}

/** Get all lessons flattened into one object keyed by lesson id */
function getAllLessons() {
    const all = {};
    Object.values(LABS).forEach(stage => {
        Object.assign(all, stage.lessons);
    });
    return all;
}

/** Get the id of the lesson after the given one (across all stages), or null if it's the last lesson. */
function getNextLessonId(currentId) {
    // Match the curriculum's display order: stages in order, lessons in insertion order.
    const order = [];
    getStages().forEach(stage => {
        Object.keys(stage.lessons).forEach(id => order.push(Number(id)));
    });
    const idx = order.indexOf(Number(currentId));
    return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
}

/** Get all stages as an array sorted by stage number */
function getStages() {
    return Object.values(LABS).sort((a, b) => a.stage - b.stage);
}

/** Get CCNA material stages as an array sorted by stage number */
function getMaterialStages() {
    return Object.values(MATERIAL).sort((a, b) => a.stage - b.stage);
}

// ============================================================
// PROGRESS STORAGE
// ============================================================
const STORAGE_KEY = 'ccna_path_progress';

function loadProgress() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : { completed: [] };
    } catch (e) {
        return { completed: [] };
    }
}

function saveProgress(p) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch (e) { /* ignore */ }
}

// ============================================================
// PROFILE STORAGE
// ============================================================
const PROFILE_KEY = 'ccna_path_profile';

function loadProfile() {
    try {
        const raw = localStorage.getItem(PROFILE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function saveProfile(p) {
    try {
        if (p) {
            localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
        } else {
            localStorage.removeItem(PROFILE_KEY);
        }
    } catch (e) { /* ignore */ }
}

// ============================================================
// STREAK STORAGE
// ============================================================
const STREAK_KEY = 'ccna_path_streak';

function loadStreak() {
    try {
        const raw = localStorage.getItem(STREAK_KEY);
        return raw ? JSON.parse(raw) : { dates: [] };
    } catch (e) {
        return { dates: [] };
    }
}

function saveStreak(s) {
    try {
        localStorage.setItem(STREAK_KEY, JSON.stringify(s));
    } catch (e) { /* ignore */ }
}

/** Get today's date as YYYY-MM-DD string */
function todayStr() {
    const d = new Date();
    return d.toISOString().split('T')[0];
}

/** Get a date string offset by N days from today (negative = past) */
function dateStrOffset(offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
}

/** Record today's activity (if not already recorded) */
function recordActivity() {
    const streak = loadStreak();
    const today = todayStr();
    if (!streak.dates.includes(today)) {
        streak.dates.push(today);
        saveStreak(streak);
    }
    return streak;
}

/** Calculate the current consecutive-day streak */
function calcStreak() {
    const streak = loadStreak();
    const dates = streak.dates || [];
    if (!dates.length) return 0;

    // Sort dates ascending
    const sorted = [...new Set(dates)].sort();
    const today = todayStr();
    const yesterday = dateStrOffset(-1);

    // If today is not active and yesterday is not active, streak is 0
    if (!sorted.includes(today) && !sorted.includes(yesterday)) return 0;

    // Start counting from today (or yesterday if today not active yet)
    let count = 0;
    let cursor = sorted.includes(today) ? today : yesterday;

    while (sorted.includes(cursor)) {
        count++;
        const d = new Date(cursor);
        d.setDate(d.getDate() - 1);
        cursor = d.toISOString().split('T')[0];
    }
    return count;
}

/** Get the last 7 days of activity for the weekly view */
function getWeekActivity() {
    const streak = loadStreak();
    const dates = streak.dates || [];
    const week = [];
    for (let i = 6; i >= 0; i--) {
        const ds = dateStrOffset(-i);
        week.push({
            date: ds,
            active: dates.includes(ds),
            isToday: ds === todayStr()
        });
    }
    return week;
}
