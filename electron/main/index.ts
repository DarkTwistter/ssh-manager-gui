import { app, BrowserWindow, shell, ipcMain, Menu } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { update } from './update'
import { spawn } from 'child_process'
import fs from 'fs'
import ConfigManager from '../../src/utils/config'
import { Client } from 'ssh2'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'SSH Manager',
    width: 900,
    height: 600,
    minWidth: 800,
    minHeight: 500,
    icon: path.join(process.env.VITE_PUBLIC, 'icon.svg'),
    autoHideMenuBar: process.env.NODE_ENV !== 'development', // Показываем меню только в режиме разработки
    webPreferences: {
      preload,
    },
  })

  // Создаем меню только в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    const template = [
      {
        label: 'Developer',
        submenu: [
          {
            label: 'Toggle Developer Tools',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Alt+Shift+I',
            click: () => {
              win?.webContents.toggleDevTools();
            },
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    win.setMenu(menu);
  } else {
    win.removeMenu();
  }

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Auto update
  update(win)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

// Обработчик для открытия SSH-подключения
ipcMain.on('open-ssh', (event, server) => {
  let sshArgs = [];
  let keyTempPath = '';
  if (server.keyName && server.keyValue) {
    // Создаём временный файл для ключа
    const tmpDir = os.tmpdir();
    keyTempPath = path.join(tmpDir, `sshkey_${Date.now()}`);
    fs.writeFileSync(keyTempPath, server.keyValue, { mode: 0o600 });
    sshArgs.push('-i', keyTempPath);
  }
  sshArgs.push('-p', server.port || 22);
  sshArgs.push(`${server.username}@${server.host}`);

  let command = 'ssh';
  let args = sshArgs;
  if (server.password && process.platform !== 'win32') {
    command = 'sshpass';
    args = ['-p', server.password, 'ssh', ...sshArgs];
  }

  if (process.platform === 'win32') {
    spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/k', command, ...args], { detached: true });
  } else if (process.platform === 'darwin') {
    spawn('osascript', ['-e', `tell application "Terminal" to do script \"${command} ${args.map(a => `'${a}'`).join(' ')}\"`], { detached: true });
  } else {
    spawn('x-terminal-emulator', ['-e', command, ...args], { detached: true });
  }

  // Удаляем временный ключ после задержки (например, 10 секунд)
  if (keyTempPath) {
    setTimeout(() => {
      try { fs.unlinkSync(keyTempPath); } catch {}
    }, 10000);
  }
})

// Config IPC handlers
ipcMain.handle('get-ssh-keys', () => {
  return ConfigManager.getInstance().getSSHKeys();
});

ipcMain.handle('add-ssh-key', (_, key) => {
  ConfigManager.getInstance().addSSHKey(key);
});

ipcMain.handle('remove-ssh-key', (_, name) => {
  ConfigManager.getInstance().removeSSHKey(name);
});

ipcMain.handle('get-servers', () => {
  return ConfigManager.getInstance().getServers();
});

ipcMain.handle('add-server', (_, server) => {
  ConfigManager.getInstance().addServer(server);
});

ipcMain.handle('update-server', (_, { id, server }) => {
  ConfigManager.getInstance().updateServer(id, server);
});

ipcMain.handle('remove-server', (_, id) => {
  ConfigManager.getInstance().removeServer(id);
});

ipcMain.handle('get-groups', () => {
  return ConfigManager.getInstance().getGroups();
});

ipcMain.handle('add-group', (_, group) => {
  ConfigManager.getInstance().addGroup(group);
});

ipcMain.handle('update-group', (_, { id, group }) => {
  ConfigManager.getInstance().updateGroup(id, group);
});

ipcMain.handle('remove-group', (_, id) => {
  ConfigManager.getInstance().removeGroup(id);
});

// Добавляем обработчик IPC для тестирования SSH-подключения
ipcMain.handle('test-ssh-connection', async (_, connectionDetails) => {
  return new Promise((resolve) => {
    const conn = new Client();

    conn.on('ready', () => {
      conn.end();
      resolve({ success: true });
    });

    conn.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    const config: any = {
      host: connectionDetails.host,
      port: connectionDetails.port,
      username: connectionDetails.username,
    };

    if (connectionDetails.password) {
      config.password = connectionDetails.password;
    }

    if (connectionDetails.keyValue) {
      config.privateKey = connectionDetails.keyValue;
    }

    conn.connect(config);
  });
});
