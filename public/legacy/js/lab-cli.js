/**
 * lab-cli.js - Restricted CLI for guided lessons
 * Extends the full CLI simulator but only allows commands
 * defined in the lesson's allowedCommands list.
 * The sandbox (CLI view) uses the full CLI class directly.
 */
class LabCLI extends CLI {
    constructor(device) {
        super(device);
        this.allowedCommands = [];
    }

    setAllowedCommands(commands) {
        this.allowedCommands = (commands || []).map(c => c.toLowerCase());
    }

    isAllowed(input) {
        const trimmed = input.trim().toLowerCase();
        // Always allow navigation/help commands
        if (['?', 'help', 'exit', 'end', 'logout', 'disable'].includes(trimmed)) return true;

        return this.allowedCommands.some(cmd => {
            const c = cmd.toLowerCase();
            // Exact match or input is a prefix of an allowed command
            if (c.startsWith(trimmed)) return true;
            // Allowed command is a prefix of input (e.g., 'hostname' → 'hostname SW2')
            if (trimmed.startsWith(c + ' ')) return true;
            // Token-prefix match (handles abbreviations like 'conf t' → 'configure terminal')
            const inTokens = trimmed.split(/\s+/);
            const cmdTokens = c.split(/\s+/);
            if (inTokens.length === cmdTokens.length) {
                return inTokens.every((t, i) => cmdTokens[i].startsWith(t));
            }
            return false;
        });
    }

    execute(input) {
        if (!this.isAllowed(input)) {
            return {
                type: 'error',
                message: `% Command not available in this lab.\n% Try one of: ${this.allowedCommands.join(', ')}`
            };
        }
        return super.execute(input);
    }

    getCompletions(input) {
        const parts = input.trim().split(/\s+/);
        const partial = parts[parts.length - 1].toLowerCase();
        if (!partial) return [];

        const prefix = parts.slice(0, -1).join(' ');
        const suggestions = new Set();

        this.allowedCommands.forEach(cmd => {
            const tokens = cmd.toLowerCase().split(/\s+/);
            if (parts.length === 1) {
                if (tokens[0].startsWith(partial)) suggestions.add(tokens[0]);
            } else {
                const prefixTokens = prefix.split(/\s+/);
                if (prefixTokens.length < tokens.length) {
                    const matchesPrefix = prefixTokens.every((t, i) => tokens[i].startsWith(t));
                    if (matchesPrefix && tokens[prefixTokens.length].startsWith(partial)) {
                        suggestions.add(tokens[prefixTokens.length]);
                    }
                }
            }
        });

        return [...suggestions];
    }
}