declare global {
  interface Window {
    electronAPI: {
      openSSH: (server: Server) => void;

      // SSH Keys
      getSSHKeys: () => Promise<SSHKey[]>;
      addSSHKey: (key: SSHKey) => Promise<void>;
      removeSSHKey: (name: string) => Promise<void>;

      // Servers
      getServers: () => Promise<Server[]>;
      addServer: (server: Server) => Promise<void>;
      updateServer: (id: string, server: Server) => Promise<void>;
      removeServer: (id: string) => Promise<void>;

      // Groups
      getGroups: () => Promise<Group[]>;
      addGroup: (group: Group) => Promise<void>;
      updateGroup: (id: string, group: Group) => Promise<void>;
      removeGroup: (id: string) => Promise<void>;

      // Test SSH Connection
      testSSHConnection: (connectionDetails: {
        host: string;
        port: number;
        username: string;
        password?: string;
        keyValue?: string;
      }) => Promise<{ success: boolean; error?: string }>;
      checkUpdate: () => Promise<any>;
      startDownload: () => Promise<void>;
      quitAndInstall: () => Promise<void>;

      // Update events
      onUpdateAvailable: (callback: (info: { update: boolean; version: string; newVersion: string }) => void) => void;
      onDownloadProgress: (callback: (info: { percent: number }) => void) => void;
      onUpdateDownloaded: (callback: () => void) => void;
      onUpdateError: (callback: (error: { message: string }) => void) => void;
      removeAllListeners: () => void;

    };
  }
}

export interface SSHKey {
  name: string;
  publicKey: string;
  privateKey: string;
}

export interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  keyName?: string;
  keyValue?: string;
  groupId?: string;
}

export interface Group {
  id: string;
  name: string;
}

export {};
