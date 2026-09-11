/**
 * Preload script — the ONLY bridge between the sandboxed renderer and the main
 * process. We expose a typed, minimal API surface via contextBridge. The
 * renderer can never reach `ipcRenderer` or node directly.
 */
import { contextBridge, ipcRenderer } from 'electron';
import {
  IPC,
  type IpcResult,
  type VideoInfo,
  type PlaylistInfo,
  type DownloadRequest,
  type DownloadItem,
  type AppSettings,
  type DependencyStatus,
  type AppStatistics,
} from '../../shared/types';
import type { UpdateState } from '../services/updater';

/** Strip the IpcResult wrapper, throwing on failure for ergonomic await. */
async function invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  const res = (await ipcRenderer.invoke(channel, ...args)) as IpcResult<T>;
  if (!res.ok) throw new Error(res.error ?? 'Unknown error');
  return res.data as T;
}

const api = {
  /* analysis */
  analyzeUrl: (url: string) => invoke<VideoInfo>(IPC.ANALYZE_URL, url),
  analyzePlaylist: (url: string) => invoke<PlaylistInfo>(IPC.ANALYZE_PLAYLIST, url),

  /* downloads */
  startDownload: (req: DownloadRequest) => invoke<DownloadItem>(IPC.DOWNLOAD_START, req),
  checkDuplicate: (req: DownloadRequest) =>
    invoke<DownloadItem | null>(IPC.DOWNLOAD_CHECK_DUPLICATE, req),
  pauseDownload: (id: string) => invoke<void>(IPC.DOWNLOAD_PAUSE, id),
  resumeDownload: (id: string) => invoke<void>(IPC.DOWNLOAD_RESUME, id),
  cancelDownload: (id: string) => invoke<void>(IPC.DOWNLOAD_CANCEL, id),
  retryDownload: (id: string) => invoke<void>(IPC.DOWNLOAD_RETRY, id),
  removeDownload: (id: string) => invoke<void>(IPC.DOWNLOAD_REMOVE, id),
  listDownloads: () => invoke<DownloadItem[]>(IPC.DOWNLOAD_LIST),
  clearCompleted: () => invoke<boolean>(IPC.DOWNLOAD_CLEAR_COMPLETED),

  /* settings */
  getSettings: () => invoke<AppSettings>(IPC.SETTINGS_GET),
  setSettings: (patch: Partial<AppSettings>) => invoke<AppSettings>(IPC.SETTINGS_SET, patch),

  /* file management */
  openLocation: (path: string) => invoke<boolean>(IPC.FILE_OPEN_LOCATION, path),
  openFile: (path: string) => invoke<boolean>(IPC.FILE_OPEN, path),
  pickDirectory: () => invoke<string | null>(IPC.PICK_DIRECTORY),
  pickFile: () => invoke<string | null>(IPC.PICK_FILE),

  /* system */
  checkDependencies: () => invoke<DependencyStatus>(IPC.DEPS_CHECK),
  getStatistics: () => invoke<AppStatistics>(IPC.STATS_GET),

  /* updater */
  checkForUpdates: () => invoke<boolean>(IPC.UPDATE_CHECK),
  installUpdate: () => invoke<boolean>(IPC.UPDATE_INSTALL),

  /* window controls */
  minimize: () => ipcRenderer.send(IPC.WINDOW_MINIMIZE),
  maximize: () => ipcRenderer.send(IPC.WINDOW_MAXIMIZE),
  close: () => ipcRenderer.send(IPC.WINDOW_CLOSE),

  /* event subscriptions — return an unsubscribe fn */
  onDownloadProgress: (cb: (item: DownloadItem) => void): (() => void) => {
    const handler = (_e: unknown, item: DownloadItem) => cb(item);
    ipcRenderer.on(IPC.DOWNLOAD_PROGRESS, handler);
    return () => {
      ipcRenderer.off(IPC.DOWNLOAD_PROGRESS, handler);
    };
  },
  onClipboardUrl: (cb: (url: string) => void): (() => void) => {
    const handler = (_e: unknown, url: string) => cb(url);
    ipcRenderer.on(IPC.CLIPBOARD_URL, handler);
    return () => {
      ipcRenderer.off(IPC.CLIPBOARD_URL, handler);
    };
  },
  onUpdateStatus: (cb: (state: UpdateState) => void): (() => void) => {
    const handler = (_e: unknown, state: UpdateState) => cb(state);
    ipcRenderer.on(IPC.UPDATE_STATUS, handler);
    return () => {
      ipcRenderer.off(IPC.UPDATE_STATUS, handler);
    };
  },
};

export type MediaVaultApi = typeof api;

contextBridge.exposeInMainWorld('mediavault', api);
