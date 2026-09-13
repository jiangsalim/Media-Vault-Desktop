/**
 * Shared type contracts used by BOTH the Electron main process and the React
 * renderer. Keeping a single source of truth here prevents IPC payload drift.
 */

/* -------------------------------------------------------------------------- */
/*                              Media information                              */
/* -------------------------------------------------------------------------- */

export interface VideoFormat {
  formatId: string;
  ext: string;
  /** e.g. "1080p", "720p60" */
  resolution: string;
  height: number | null;
  width: number | null;
  fps: number | null;
  /** approx filesize in bytes (may be null when unknown) */
  filesize: number | null;
  vcodec: string | null;
  acodec: string | null;
  tbr: number | null; // total bitrate kbps
  /** true if the format carries no audio (needs muxing) */
  videoOnly: boolean;
  audioOnly: boolean;
  note: string | null;
}

export interface ThumbnailInfo {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  /** Friendly label: Default / Medium / High / Max Resolution / Original */
  label: string;
}

export interface SubtitleTrack {
  lang: string;
  langName: string;
  ext: string;
  url: string;
  /** auto-generated captions vs human authored */
  auto: boolean;
}

export interface AudioTrackInfo {
  id: string;
  lang: string | null;
  note: string | null;
}

export interface VideoInfo {
  id: string;
  url: string;
  title: string;
  description: string | null;
  channel: string | null;
  channelId: string | null;
  channelUrl: string | null;
  uploader: string | null;
  subscriberCount: number | null;
  uploadDate: string | null; // ISO yyyy-mm-dd
  duration: number | null; // seconds
  durationString: string | null;
  viewCount: number | null;
  likeCount: number | null;
  commentCount: number | null;
  category: string | null;
  tags: string[];
  language: string | null;
  isLive: boolean;
  ageLimit: number;
  thumbnails: ThumbnailInfo[];
  formats: VideoFormat[];
  subtitles: SubtitleTrack[];
  audioTracks: AudioTrackInfo[];
}

export interface PlaylistEntry {
  id: string;
  url: string;
  title: string;
  duration: number | null;
  durationString: string | null;
  thumbnail: string | null;
  uploader: string | null;
}

export interface PlaylistInfo {
  id: string;
  title: string;
  uploader: string | null;
  /** representative cover image (first entry's thumbnail when available) */
  thumbnail: string | null;
  entryCount: number;
  entries: PlaylistEntry[];
}

/* -------------------------------------------------------------------------- */
/*                              Search results                                */
/* -------------------------------------------------------------------------- */

export interface VideoSearchResult {
  id: string;
  url: string;
  title: string;
  channel: string | null;
  /** seconds */
  duration: number | null;
  durationString: string | null;
  /** best available thumbnail URL */
  thumbnail: string | null;
  viewCount: number | null;
  uploadDate: string | null; // ISO yyyy-mm-dd
}

/* -------------------------------------------------------------------------- */
/*                          Trending (YouTube feed)                           */
/* -------------------------------------------------------------------------- */

export interface TrendingResponse {
  /** ISO 3166-1 alpha-2 country code detected / used, e.g. "UG", "US" */
  region: string;
  /** Unix ms when the data was fetched */
  fetchedAt: number;
  /** Whether this result came from the in-memory cache */
  cached: boolean;
  items: VideoSearchResult[];
}


/* -------------------------------------------------------------------------- */
/*                              Download requests                              */
/* -------------------------------------------------------------------------- */

export type DownloadKind = 'video' | 'audio' | 'thumbnail' | 'subtitle';

export type VideoQuality =
  | '144'
  | '240'
  | '360'
  | '480'
  | '720'
  | '1080'
  | '1440'
  | '2160'
  | 'best';

export type VideoContainer = 'mp4' | 'mkv';

export type AudioFormat = 'mp3' | 'm4a' | 'aac' | 'wav' | 'flac' | 'ogg';

export type AudioBitrate = '128' | '192' | '256' | '320' | 'best';

export type SubtitleFormat = 'srt' | 'vtt' | 'txt';

export interface VideoDownloadOptions {
  kind: 'video';
  quality: VideoQuality;
  container: VideoContainer;
}

export interface AudioDownloadOptions {
  kind: 'audio';
  format: AudioFormat;
  bitrate: AudioBitrate;
}

export interface ThumbnailDownloadOptions {
  kind: 'thumbnail';
  thumbnailUrl: string;
  thumbnailLabel: string;
}

export interface SubtitleDownloadOptions {
  kind: 'subtitle';
  lang: string;
  format: SubtitleFormat;
  auto: boolean;
}

export type DownloadOptions =
  | VideoDownloadOptions
  | AudioDownloadOptions
  | ThumbnailDownloadOptions
  | SubtitleDownloadOptions;

export interface DownloadRequest {
  url: string;
  title: string;
  thumbnail: string | null;
  channel: string | null;
  duration: number | null;
  options: DownloadOptions;
  /** optional rename of output file (without extension) */
  customName?: string;
  /** override the default output directory for this single job */
  outputDir?: string;
}

/* -------------------------------------------------------------------------- */
/*                               Download state                               */
/* -------------------------------------------------------------------------- */

export type DownloadStatus =
  | 'queued'
  | 'downloading'
  | 'processing'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'canceled';

export interface DownloadProgress {
  percent: number; // 0 - 100
  speed: string | null; // "3.4 MiB/s"
  eta: string | null; // "00:42"
  downloadedBytes: number | null;
  totalBytes: number | null;
}

export interface DownloadItem {
  id: string;
  url: string;
  title: string;
  thumbnail: string | null;
  channel: string |null;
  kind: DownloadKind;
  formatLabel: string;
  status: DownloadStatus;
  progress: DownloadProgress;
  filePath: string | null;
  fileSize: number | null;
  error: string | null;
  createdAt: number;
  completedAt: number | null;

  duration?: number;
}

/* -------------------------------------------------------------------------- */
/*                                  Settings                                   */
/* -------------------------------------------------------------------------- */

export type ThemeMode = 'dark' | 'light' | 'system';

export interface AppSettings {
  downloadDir: string;
  theme: ThemeMode;
  ffmpegPath: string | null;
  ytDlpPath: string | null;
  concurrentLimit: number;
  language: string;
  autoCreateFolders: boolean;
  clipboardDetection: boolean;
  embedThumbnail: boolean;
  embedMetadata: boolean;
  defaultVideoQuality: VideoQuality;
  defaultVideoContainer: VideoContainer;
  defaultAudioFormat: AudioFormat;
  defaultAudioBitrate: AudioBitrate;
}

/* -------------------------------------------------------------------------- */
/*                            IPC result wrappers                             */
/* -------------------------------------------------------------------------- */

export interface IpcResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface DependencyStatus {
  ytDlp: { available: boolean; version: string | null; path: string | null };
  ffmpeg: { available: boolean; version: string | null; path: string | null };
}

export interface AppStatistics {
  totalDownloads: number;
  totalVideos: number;
  totalAudio: number;
  totalThumbnails: number;
  totalBytes: number;
}

/* -------------------------------------------------------------------------- */
/*                              IPC channel names                             */
/* -------------------------------------------------------------------------- */

export const IPC = {
  // media analysis
  ANALYZE_URL: 'media:analyze',
  ANALYZE_PLAYLIST: 'media:analyzePlaylist',
  SEARCH_YT: 'media:searchYt',
  TRENDING_GET: 'media:trendingGet',
  SUGGEST_GET: 'media:suggestGet',
  // downloads
  DOWNLOAD_START: 'download:start',
  DOWNLOAD_CHECK_DUPLICATE: 'download:checkDuplicate',
  DOWNLOAD_PAUSE: 'download:pause',
  DOWNLOAD_RESUME: 'download:resume',
  DOWNLOAD_CANCEL: 'download:cancel',
  DOWNLOAD_RETRY: 'download:retry',
  DOWNLOAD_REMOVE: 'download:remove',
  DOWNLOAD_PROGRESS: 'download:progress', // main -> renderer push
  DOWNLOAD_LIST: 'download:list',
  DOWNLOAD_CLEAR_COMPLETED: 'download:clearCompleted',
  // settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  // file management
  FILE_OPEN_LOCATION: 'file:openLocation',
  FILE_OPEN: 'file:open',
  FILE_OPEN_EXTERNAL: 'file:openExternal',
  PICK_DIRECTORY: 'dialog:pickDirectory',
  PICK_FILE: 'dialog:pickFile',
  // system
  DEPS_CHECK: 'system:depsCheck',
  STATS_GET: 'stats:get',
  CLIPBOARD_URL: 'clipboard:url', // main -> renderer push
  // updater
  UPDATE_STATUS: 'update:status', // main -> renderer push
  UPDATE_CHECK: 'update:check',
  UPDATE_INSTALL: 'update:install',
  UPDATE_DOWNLOAD: 'update:download',
  UPDATE_STATE_GET: 'update:stateGet',
  // window controls
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  MINIPLAYER_OPEN: 'miniplayer:open',
  MINIPLAYER_CLOSE: 'miniplayer:close',
  MINIPLAYER_IS_OPEN: 'miniplayer:isOpen',
} as const;
