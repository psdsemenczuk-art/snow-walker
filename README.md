const { app, BrowserWindow, ipcMain, dialog, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Config file location
const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');

const DEFAULT_CONFIG = {
  walkSpeed: 4.5,
  runSpeed: 9.0,
  mouseSensitivity: 2.2,
  fov: 72,
  fogDensity: 0.020,
  snowIntensity: 3500,
  skyColor: '#c8ddf0',
  assets: {
    terrain: null,
    trees: [],
    bushes: [],
    stumps: [],
    misc: []
  }
};

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
      return Object.assign({}, DEFAULT_CONFIG, JSON.parse(raw));
    }
  } catch (e) { console.warn('Config load failed:', e); }
  return { ...DEFAULT_CONFIG };
}

function saveConfig(cfg) {
  try {
    fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
    return true;
  } catch (e) { console.error('Config save failed:', e); return false; }
}

let mainWindow;
let currentConfig = loadConfig();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Snow Walker Engine',
    backgroundColor: '#0d1520',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false // allow loading local GLB files
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  // Register a custom protocol to serve local asset files safely
  protocol.registerFileProtocol('asset', (request, callback) => {
    const filePath = decodeURIComponent(request.url.replace('asset://', ''));
    callback({ path: filePath });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── IPC Handlers ──────────────────────────────────────────────────────────────

ipcMain.handle('get-config', () => currentConfig);

ipcMain.handle('save-config', (_, cfg) => {
  currentConfig = cfg;
  return saveConfig(cfg);
});

ipcMain.handle('reset-config', () => {
  currentConfig = { ...DEFAULT_CONFIG };
  saveConfig(currentConfig);
  return currentConfig;
});

ipcMain.handle('pick-asset-file', async (_, slot) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: `Select ${slot} asset (GLB file)`,
    filters: [{ name: '3D Models', extensions: ['glb', 'gltf'] }],
    properties: ['openFile', 'multiSelections']
  });
  if (result.canceled) return null;
  return result.filePaths;
});

ipcMain.handle('get-asset-url', (_, filePath) => {
  // Convert absolute path to asset:// URL
  return 'asset://' + encodeURIComponent(filePath);
});

ipcMain.handle('file-exists', (_, filePath) => {
  return filePath && fs.existsSync(filePath);
});

ipcMain.handle('get-filename', (_, filePath) => {
  return filePath ? path.basename(filePath) : null;
});
