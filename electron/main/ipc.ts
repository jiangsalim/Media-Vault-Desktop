/**
 * Central IPC registration. Every handler is wrapped so exceptions become a
 * typed IpcResult<T> instead of crashing the renderer bridge.
 */
import { ipcMain, dialog, shell, clipboard, BrowserWindow, app } from 'electron';
import {
  IPC,
  type IpcResult,
  type DownloadRequest,
  type AppSettings,
} from '../../shared/types';
import { analyzeUrl, analyzePlaylist, searchYoutube } from '../services/ytdlp';
import { getTrending } from '../services/trending';
import { getSuggestions } from '../services/suggest';
import { downloadManager } from '../services/download-manager';
import { checkDependencies } from '../services/dependencies';
import { readSettings, writeSettings } from '../services/settings';
import {
  getDownloadHistory,
  getStatistics,
  clearCompleted,
} from '../db/database';
import { classifyYouTubeUrl, extractYouTubeUrl } from '../utils/validation';
import { checkForUpdates, downloadUpdate, quitAndInstall, getLastUpdateState } from '../services/updater';
import { createLogger } from '../utils/logger';

const log = createLogger('ipc');

/** Wrap an async handler so it always resolves to IpcResult<T>. */
function safe<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult> | TResult,
) {
  return async (...args: TArgs): Promise<IpcResult<TResult>> => {
    try {
      const data = await fn(...args);
      return { ok: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.error('handler failed', message);
      return { ok: false, error: message };
    }
  };
}

export function registerIpc(getWindow: () => BrowserWindow | null): void {
  /* ----------------------------- analysis ----------------------------- */
  ipcMain.handle(
    IPC.ANALYZE_URL,
    safe(async (_e, url: string) => {
      const cls = classifyYouTubeUrl(url);
      if (!cls.valid || !cls.normalized) throw new Error(cls.reason ?? 'Invalid URL');
      return analyzeUrl(cls.normalized);
    }),
  );

  ipcMain.handle(
    IPC.ANALYZE_PLAYLIST,
    safe(async (_e, url: string) => {
      const cls = classifyYouTubeUrl(url);
      if (!cls.valid || !cls.normalized) throw new Error(cls.reason ?? 'Invalid URL');
      return analyzePlaylist(cls.normalized);
    }),
  );

  ipcMain.handle(
    IPC.SEARCH_YT,
    safe(async (_e, query: string, count?: number) => {
      return searchYoutube(query, count ?? 10);
    }),
  );
  ipcMain.handle(
    IPC.TRENDING_GET,
    safe(async (_e, forceRefresh?: boolean) => {
      return getTrending(forceRefresh ?? false);
    }),
  );
  ipcMain.handle(
    IPC.SUGGEST_GET,
    safe(async (_e, query: string, limit?: number) => {
      return getSuggestions(query, limit ?? 8);
    }),
  );
  /* ----------------------------- downloads ---------------------------- */
  ipcMain.handle(
    IPC.DOWNLOAD_START,
    safe(async (_e, req: DownloadRequest) => {
      const item = downloadManager.enqueue(req);
      downloadManager.registerOptions(item.id, req.options);
      return item;
    }),
  );

  ipcMain.handle(
    IPC.DOWNLOAD_CHECK_DUPLICATE,
    safe(async (_e, req: DownloadRequest) => downloadManager.checkDuplicate(req)),
  );

  ipcMain.handle(IPC.DOWNLOAD_PAUSE, safe(async (_e, id: string) => downloadManager.pause(id)));
  ipcMain.handle(IPC.DOWNLOAD_RESUME, safe(async (_e, id: string) => downloadManager.resume(id)));
  ipcMain.handle(IPC.DOWNLOAD_CANCEL, safe(async (_e, id: string) => downloadManager.cancel(id)));
  ipcMain.handle(IPC.DOWNLOAD_RETRY, safe(async (_e, id: string) => downloadManager.retry(id)));
  ipcMain.handle(IPC.DOWNLOAD_REMOVE, safe(async (_e, id: string) => downloadManager.remove(id)));

  ipcMain.handle(
    IPC.DOWNLOAD_LIST,
    safe(async () => {
      // Merge live jobs with persisted history (live wins on id collision).
      const live = downloadManager.list();
      const liveIds = new Set(live.map((l) => l.id));
      const history = getDownloadHistory().filter((h) => !liveIds.has(h.id));
      return [...live, ...history];
    }),
  );

  ipcMain.handle(
    IPC.DOWNLOAD_CLEAR_COMPLETED,
    safe(async () => {
      clearCompleted();
      return true;
    }),
  );

  /* ------------------------------ settings ---------------------------- */
  ipcMain.handle(IPC.SETTINGS_GET, safe(async () => readSettings()));
  ipcMain.handle(
    IPC.SETTINGS_SET,
    safe(async (_e, patch: Partial<AppSettings>) => writeSettings(patch)),
  );

  /* -------------------------- file management ------------------------- */
  ipcMain.handle(
    IPC.FILE_OPEN_LOCATION,
    safe(async (_e, filePath: string) => {
      shell.showItemInFolder(filePath);
      return true;
    }),
  );
  ipcMain.handle(
    IPC.FILE_OPEN,
    safe(async (_e, filePath: string) => {
      const err = await shell.openPath(filePath);
      if (err) throw new Error(err);
      return true;
    }),
  );
  ipcMain.handle(
    IPC.PICK_DIRECTORY,
    safe(async () => {
      const win = getWindow();
      const res = await dialog.showOpenDialog(win!, { properties: ['openDirectory', 'createDirectory'] });
      return res.canceled ? null : res.filePaths[0] ?? null;
    }),
  );
  ipcMain.handle(
    IPC.PICK_FILE,
    safe(async () => {
      const win = getWindow();
      const res = await dialog.showOpenDialog(win!, { properties: ['openFile'] });
      return res.canceled ? null : res.filePaths[0] ?? null;
    }),
  );

  /* ------------------------------- system ----------------------------- */
  ipcMain.handle(IPC.DEPS_CHECK, safe(async () => checkDependencies()));
  ipcMain.handle(
    IPC.FILE_OPEN_EXTERNAL,
    safe(async (_e, url: string) => {
      await shell.openExternal(url);
      return true;
    }),
  );
  ipcMain.handle(IPC.STATS_GET, safe(async () => getStatistics()));

  /* ------------------------------- updater ---------------------------- */
  ipcMain.handle('app:getVersion', safe(async () => app.getVersion()));
  ipcMain.handle(IPC.UPDATE_CHECK, safe(async () => { checkForUpdates(); return true; }));
  ipcMain.handle(IPC.UPDATE_INSTALL, safe(async () => { quitAndInstall(); return true; }));
  ipcMain.handle(IPC.UPDATE_DOWNLOAD, safe(async () => {
    downloadUpdate();
    return true;
  }));

  ipcMain.handle(IPC.UPDATE_STATE_GET, safe(async () => getLastUpdateState()));

  /* --------------------------- window controls ------------------------ */
  ipcMain.on(IPC.WINDOW_MINIMIZE, () => getWindow()?.minimize());
  ipcMain.on(IPC.WINDOW_MAXIMIZE, () => {
    const win = getWindow();
    if (!win) return;
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  ipcMain.on(IPC.WINDOW_CLOSE, () => getWindow()?.close());

  /* --------------------- forward download progress -------------------- */
  downloadManager.on('progress', (item) => {
    const win = getWindow();
    if (win && !win.isDestroyed()) win.webContents.send(IPC.DOWNLOAD_PROGRESS, item);
  });

  /* -------------------- clipboard URL detection loop ------------------ */
  let lastClip = '';
  setInterval(() => {
    if (!readSettings().clipboardDetection) return;
    const text = clipboard.readText();
    if (text && text !== lastClip) {
      lastClip = text;
      const url = extractYouTubeUrl(text);
      if (url) {
        const win = getWindow();
        if (win && !win.isDestroyed()) win.webContents.send(IPC.CLIPBOARD_URL, url);
      }
    }
  }, 1500);
}
