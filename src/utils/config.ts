import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

interface SSHKey {
    name: string;
    publicKey: string;
    privateKey: string;
}

interface ServerConfig {
    id: string;
    name: string;
    host: string;
    port: number;
    username: string;
    password?: string;
    sshKeyId?: string;
    groupId?: string;
}

interface Group {
    id: string;
    name: string;
}

interface AppConfig {
    sshKeys: SSHKey[];
    servers: ServerConfig[];
    groups: Group[];
}

class ConfigManager {
    private static instance: ConfigManager;
    private configPath: string;
    private config: AppConfig;

    private constructor() {
        this.configPath = path.join(app.getPath('userData'), 'config.json');
        this.config = this.loadConfig();
    }

    public static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    private loadConfig(): AppConfig {
        try {
            if (fs.existsSync(this.configPath)) {
                const data = fs.readFileSync(this.configPath, 'utf-8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading config:', error);
        }

        // Return default config if file doesn't exist or is invalid
        return {
            sshKeys: [],
            servers: [],
            groups: []
        };
    }

    private saveConfig(): void {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
        } catch (error) {
            console.error('Error saving config:', error);
        }
    }

    // SSH Keys methods
    public getSSHKeys(): SSHKey[] {
        return this.config.sshKeys;
    }

    public addSSHKey(key: SSHKey): void {
        this.config.sshKeys.push(key);
        this.saveConfig();
    }

    public removeSSHKey(name: string): void {
        this.config.sshKeys = this.config.sshKeys.filter(k => k.name !== name);
        this.saveConfig();
    }

    // Servers methods
    public getServers(): ServerConfig[] {
        return this.config.servers;
    }

    public addServer(server: ServerConfig): void {
        this.config.servers.push(server);
        this.saveConfig();
    }

    public updateServer(id: string, server: ServerConfig): void {
        const index = this.config.servers.findIndex(s => s.id === id);
        if (index !== -1) {
            this.config.servers[index] = { ...server, id };
            this.saveConfig();
        }
    }

    public removeServer(id: string): void {
        const initialLength = this.config.servers.length;
        this.config.servers = this.config.servers.filter(s => s.id !== id);
        if (this.config.servers.length !== initialLength) {
            this.saveConfig();
        }
    }

    // Groups methods
    public getGroups(): Group[] {
        return this.config.groups;
    }

    public addGroup(group: Group): void {
        this.config.groups.push(group);
        this.saveConfig();
    }

    public updateGroup(id: string, group: Group): void {
        const index = this.config.groups.findIndex(g => g.id === id);
        if (index !== -1) {
            this.config.groups[index] = group;
            this.saveConfig();
        }
    }

    public removeGroup(id: string): void {
        this.config.groups = this.config.groups.filter(g => g.id !== id);
        // Remove group reference from servers
        this.config.servers = this.config.servers.map(server => {
            if (server.groupId === id) {
                const { groupId, ...rest } = server;
                return rest;
            }
            return server;
        });
        this.saveConfig();
    }
}

export default ConfigManager;
