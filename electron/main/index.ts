/**
 * Electron main process entry point.
 *
 * - Creates a frameless, glass-friendly BrowserWindow.
 * - Boots the SQLite database before any IPC handler can touch it.
 * - Registers IPC handlers and the auto-updater.
 * - Handles graceful shutdown (kills in-flight yt-dlp processes).
 */
import { app, BrowserWindow, shell, session } from 'electron';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDatabase } from '../db/database';
import { registerIpc } from './ipc';
import { setupUpdater } from '../services/updater';
import { downloadManager } from '../services/download-manager';
import { readSettings } from '../services/settings';
import { createLogger } from '../utils/logger';

const log = createLogger('main');

const __dirname = dirname(fileURLToPath(import.meta.url));

// Dev server URL injected by vite-plugin-electron
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
const RENDERER_DIST = join(__dirname, '../../dist');
const PRELOAD = join(__dirname, '../preload/index.mjs');

let mainWindow: BrowserWindow | null = null;
const getWindow = () => mainWindow;

// Enforce single instance — focus existing window if a second launch occurs.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

/**
 * Set the Referer/Origin headers for requests to youtube-nocookie.com so that
 * YouTube accepts the embed request from inside Electron. The relay page lives
 * on our Vercel domain — we identify ourselves as coming from there.
 */
function installYouTubeReferer(): void {
  const REFERER = 'https://herman-software-website.vercel.app/';
  const ORIGIN = 'https://herman-software-website.vercel.app';

  session.defaultSession.webRequest.onBeforeSendHeaders(
    {
      urls: [
        'https://www.youtube.com/embed/*',
        'https://www.youtube-nocookie.com/embed/*',
      ],
    },
    (details: Electron.OnBeforeSendHeadersListenerDetails, callback: (beforeSendResponse: Electron.BeforeSendResponse) => void) => {
      details.requestHeaders['Referer'] = REFERER;
      details.requestHeaders['Origin'] = ORIGIN;
      callback({ requestHeaders: details.requestHeaders });
    },
  );
}
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    show: false,
    frame: false, // custom titlebar for the premium look
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0b0b12',
    webPreferences: {
      preload: PRELOAD,
      contextIsolation: true, // security: isolate preload from renderer
      nodeIntegration: false, // security: no node in renderer
      sandbox: false, // preload needs limited node for the bridge
      webSecurity: true,
    },
  });

  // Show only when first paint is ready to avoid a white flash.
  mainWindow.once('ready-to-show', () => mainWindow?.show());

  // Open external links in the user's browser, never inside the app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(join(RENDERER_DIST, 'index.html'));
  }

  setupUpdater(mainWindow);
}

app.whenReady().then(() => {
  installYouTubeReferer();
  initDatabase();
  // Ensure the default download directory exists on first run.
  readSettings();
  registerIpc(getWindow);
  createWindow();

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  log.info('app ready', app.getVersion());
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  downloadManager.shutdown();
});

// Last-resort crash guards so a stray rejection never hard-crashes the app.
process.on('uncaughtException', (err) => log.error('uncaughtException', err));
process.on('unhandledRejection', (reason) => log.error('unhandledRejection', reason));
