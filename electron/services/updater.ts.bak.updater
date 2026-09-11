/**
 * Auto-update wiring using electron-updater. Disabled in dev. Emits status
 * events to the renderer so the UI can show "update available / downloading /
 * ready to install".
 */
import { app, type BrowserWindow } from 'electron';
import pkg from 'electron-updater';
import { IPC } from '../../shared/types';
import { createLogger } from '../utils/logger';

const { autoUpdater } = pkg;
const log = createLogger('updater');

export type UpdateState =
  | { status: 'checking' }
  | { status: 'available'; version: string }
  | { status: 'not-available' }
  | { status: 'downloading'; percent: number }
  | { status: 'ready'; version: string }
  | { status: 'error'; message: string };

export function setupUpdater(win: BrowserWindow): void {
  if (!app.isPackaged) {
    log.info('updater disabled in dev');
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  const send = (state: UpdateState) => {
    if (!win.isDestroyed()) win.webContents.send(IPC.UPDATE_STATUS, state);
  };

  autoUpdater.on('checking-for-update', () => send({ status: 'checking' }));
  autoUpdater.on('update-available', (info) => send({ status: 'available', version: info.version }));
  autoUpdater.on('update-not-available', () => send({ status: 'not-available' }));
  autoUpdater.on('download-progress', (p) =>
    send({ status: 'downloading', percent: Math.round(p.percent) }),
  );
  autoUpdater.on('update-downloaded', (info) => send({ status: 'ready', version: info.version }));
  autoUpdater.on('error', (err) => send({ status: 'error', message: err.message }));

  // Check shortly after launch, then every 6 hours.
  setTimeout(() => autoUpdater.checkForUpdates().catch((e) => log.warn(e)), 5_000);
  setInterval(() => autoUpdater.checkForUpdates().catch((e) => log.warn(e)), 6 * 60 * 60 * 1000);
}

export function checkForUpdates(): void {
  if (app.isPackaged) autoUpdater.checkForUpdates().catch((e) => log.warn(e));
}

export function quitAndInstall(): void {
  if (app.isPackaged) autoUpdater.quitAndInstall();
}
