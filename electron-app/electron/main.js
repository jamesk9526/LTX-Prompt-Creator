const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { startServer } = require('./server');
const isDev = process.env.NODE_ENV === 'development';

const isMac = process.platform === 'darwin';

let mainWindow;
let serverPort = 3000;

// Start static server in production
async function startStaticServer() {
  if (isDev) {
    return;
  }

  const outDir = path.join(__dirname, '../out');
  try {
    serverPort = await startServer(3000, outDir);
    console.log(`Server started on port ${serverPort}, serving from ${outDir}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    throw err;
  }
}

function createWindow() {
  const appIcon = process.platform === 'win32'
    ? path.join(__dirname, '../assets/icon.ico')
    : path.join(__dirname, '../assets/icon.png');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: appIcon,
    frame: false,
    titleBarStyle: 'hidden',
    show: false,
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `http://127.0.0.1:${serverPort}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', async () => {
  await startStaticServer();
  createWindow();
  createMenu();
});

app.on('window-all-closed', () => {
  if (isMac) {
    app.quit();
  } else if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

function createMenu() {
  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    }] : []),
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Handle IPC events
ipcMain.on('app-version', (event) => {
  event.reply('app-version', { version: app.getVersion() });
});

// Window control IPC handlers
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on('get-window-state', (event) => {
  if (mainWindow) {
    event.reply('window-state', {
      isMaximized: mainWindow.isMaximized(),
    });
  }
});

// Cleanup when app quits
app.on('before-quit', () => {
  // server.js doesn't keep a persistent process, but ensure clean shutdown
  if (mainWindow) {
    mainWindow.destroy();
  }
});
