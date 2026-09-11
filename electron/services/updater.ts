/**
 * Auto-update wiring using electron-updater.
 *
 * - Silent check 5s after launch, then every 6 hours.
 * - autoDownload = false → user picks when to download.
 * - autoInstallOnAppQuit = true → install on quit if downloaded.
 * - Status is cached so late-subscribing UI can query the current state.
 */
import { app, type BrowserWindow } from 'electron';
import pkg from 'electron-updater';
import { IPC } from '../../shared/types';
import { createLogger } from '../utils/logger';

const { autoUpdater } = pkg;
const log = createLogger('updater');

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'ready'
  | 'error';

export type UpdateState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'available'; version: string; releaseNotes?: string }
  | { status: 'not-available' }
  | { status: 'downloading'; percent: number; bytesPerSecond?: number }
  | { status: 'ready'; version: string }
  | { status: 'error'; message: string };

let lastState: UpdateState = { status: 'idle' };
let lastCheckedAt: number | null = null;
let windowRef: BrowserWindow | null = null;

function setState(state: UpdateState) {
  lastState = state;
  if (state.status === 'not-available' || state.status === 'available' || state.status === 'error') {
    lastCheckedAt = Date.now();
  }
  if (windowRef && !windowRef.isDestroyed()) {
    windowRef.webContents.send(IPC.UPDATE_STATUS, state);
  }
}

export function getLastUpdateState(): { state: UpdateState; lastCheckedAt: number | null; currentVersion: string } {
  return {
    state: lastState,
    lastCheckedAt,
    currentVersion: app.getVersion(),
  };
}

export function setupUpdater(win: BrowserWindow): void {
  windowRef = win;

  if (!app.isPackaged) {
    log.info('updater disabled in dev');
    return;
  }

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => setState({ status: 'checking' }));
  autoUpdater.on('update-available', (info) =>
    setState({
      status: 'available',
      version: info.version,
      releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : undefined,
    }),
  );
  autoUpdater.on('update-not-available', () => setState({ status: 'not-available' }));
  autoUpdater.on('download-progress', (p) =>
    setState({
      status: 'downloading',
      percent: Math.round(p.percent),
      bytesPerSecond: p.bytesPerSecond,
    }),
  );
  autoUpdater.on('update-downloaded', (info) =>
    setState({ status: 'ready', version: info.version }),
  );
  autoUpdater.on('error', (err) => {
    log.warn('updater error', err.message);
    setState({ status: 'error', message: err.message });
  });

  // Check shortly after launch, then every 6 hours.
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((e) => log.warn(e));
  }, 5_000);
  setInterval(() => {
    autoUpdater.checkForUpdates().catch((e) => log.warn(e));
  }, 6 * 60 * 60 * 1000);
}

export function checkForUpdates(): void {
  if (!app.isPackaged) {
    // In dev, fake a "checking → not-available" so the UI still works
    setState({ status: 'checking' });
    setTimeout(() => setState({ status: 'not-available' }), 800);
    return;
  }
  autoUpdater.checkForUpdates().catch((e) => log.warn(e));
}

export function downloadUpdate(): void {
  if (!app.isPackaged) return;
  autoUpdater.downloadUpdate().catch((e) => log.warn(e));
}

export function quitAndInstall(): void {
  if (app.isPackaged) autoUpdater.quitAndInstall();
}