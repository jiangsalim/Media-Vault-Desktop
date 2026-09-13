/**
 * Electron main process entry point.
 *
 * - Creates a frameless, glass-friendly BrowserWindow.
 * - Boots the SQLite database before any IPC handler can touch it.
 * - Registers IPC handlers and the auto-updater.
 * - Handles graceful shutdown (kills in-flight yt-dlp processes).
 */
import { app, BrowserWindow, shell, session, ipcMain } from 'electron';
import { join, dirname, extname } from 'node:path';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
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
let miniPlayerWindow: BrowserWindow | null = null;
let miniPlayerVideoId: string | null = null;
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
/**
 * Serve the built renderer over http://localhost:<random-port>.
 * This gives the packaged app a REAL web origin (instead of app://), which
 * matters for embedding third-party content (YouTube requires a web origin
 * to accept the frame-ancestors check).
 */
async function startRendererServer(): Promise<number> {
  const rendererDist = join(__dirname, '../../dist');

  const mimeMap: Record<string, string> = {
    html: 'text/html; charset=utf-8',
    js: 'text/javascript; charset=utf-8',
    mjs: 'text/javascript; charset=utf-8',
    css: 'text/css; charset=utf-8',
    json: 'application/json',
    svg: 'image/svg+xml',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    ico: 'image/x-icon',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    wasm: 'application/wasm',
  };

  const server = createServer(async (req, res) => {
    try {
      const urlPath = (req.url ?? '/').split('?')[0] ?? '/';
      let relative = urlPath.replace(/^\/+/, '');
      if (!relative || relative === '') relative = 'index.html';

      let filePath = join(rendererDist, relative);

      // Prevent path traversal
      if (!filePath.startsWith(rendererDist)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      let data: Buffer;
      try {
        data = await readFile(filePath);
      } catch {
        // SPA fallback — serve index.html for unknown paths
        filePath = join(rendererDist, 'index.html');
        data = await readFile(filePath);
      }

      const ext = extname(filePath).slice(1).toLowerCase();
      const mime = mimeMap[ext] ?? 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': 'no-store',
      });
      res.end(data);
    } catch (err) {
      log.error('http server error', err);
      res.writeHead(500);
      res.end('Internal error');
    }
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (typeof address === 'object' && address) {
        log.info('renderer server listening on port', address.port);
        resolve(address.port);
      } else {
        reject(new Error('Failed to get server port'));
      }
    });
  });
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
    // Allow our relay's mini-player popout to open as a native Electron window.
    if (
      url.startsWith('https://herman-software-website.vercel.app/embed.html') &&
      url.includes('popout=1')
    ) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 480,
          height: 320,
          minWidth: 320,
          minHeight: 200,
          frame: true,
          alwaysOnTop: true,
          resizable: true,
          title: 'MediaVault Mini Player',
          backgroundColor: '#000000',
          webPreferences: {
            sandbox: true,
            contextIsolation: true,
            nodeIntegration: false,
          },
        },
      };
    }

    // Everything else → open in the user's default browser
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Mini player IPC handlers (registered here to avoid circular imports)
  ipcMain.handle('miniplayer:open', (_e, videoId: string) => {
    openMiniPlayer(videoId);
    return true;
  });
  ipcMain.handle('miniplayer:close', () => {
    closeMiniPlayer();
    return true;
  });
  ipcMain.handle('miniplayer:isOpen', () => {
    return isMiniPlayerOpen();
  });

  // Track the mini player window when it opens via window.open()
  mainWindow.webContents.on('did-create-window', (childWindow) => {
    miniPlayerWindow = childWindow;
    childWindow.on('closed', () => {
      miniPlayerWindow = null;
      miniPlayerVideoId = null;
    });
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // Production: serve from http://localhost:<port> so the app has a real
    // web origin. Required for embedding YouTube (frame-ancestors CSP).
    startRendererServer()
      .then((port) => mainWindow?.loadURL(`http://localhost:${port}/index.html`))
      .catch((err) => {
        log.error('failed to start renderer server', err);
        mainWindow?.loadFile(join(RENDERER_DIST, 'index.html'));
      });
  }

  setupUpdater(mainWindow);
}

/** Open the mini-player window for a video ID. Reuses if already open. */
export function openMiniPlayer(videoId: string): void {
  if (!videoId) return;

  // Already open for the same video → just focus it
  if (miniPlayerWindow && !miniPlayerWindow.isDestroyed() && miniPlayerVideoId === videoId) {
    miniPlayerWindow.focus();
    return;
  }

  // Close any existing window for a different video
  if (miniPlayerWindow && !miniPlayerWindow.isDestroyed()) {
    miniPlayerWindow.close();
  }

  miniPlayerVideoId = videoId;

  const url = `https://herman-software-website.vercel.app/embed.html?v=${encodeURIComponent(videoId)}&popout=1`;

  miniPlayerWindow = new BrowserWindow({
    width: 480,
    height: 320,
    minWidth: 320,
    minHeight: 200,
    frame: true,
    alwaysOnTop: true,
    resizable: true,
    title: 'MediaVault Mini Player',
    backgroundColor: '#000000',
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  miniPlayerWindow.setMenuBarVisibility(false);
  miniPlayerWindow.loadURL(url);

  miniPlayerWindow.on('closed', () => {
    miniPlayerWindow = null;
    miniPlayerVideoId = null;
  });
}

/** Close the mini-player window if it's open. */
export function closeMiniPlayer(): void {
  if (miniPlayerWindow && !miniPlayerWindow.isDestroyed()) {
    miniPlayerWindow.close();
  }
  miniPlayerWindow = null;
  miniPlayerVideoId = null;
}

/** Is the mini player currently open? */
export function isMiniPlayerOpen(): boolean {
  return !!miniPlayerWindow && !miniPlayerWindow.isDestroyed();
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
