/**
 * Trending service — fetches YouTube's trending feed via yt-dlp.
 *
 * YouTube has been deprecating its /feed/trending endpoint. We try a few
 * sources in order and return the first one that works. Region is detected
 * from the OS locale via Electron's app.getLocale().
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { app } from 'electron';
import type { TrendingResponse, VideoSearchResult } from '../../shared/types';
import { resolveBinary } from '../utils/binaries';
import { readSettings } from './settings';
import { createLogger } from '../utils/logger';
import { humanizeError } from '../utils/errors';

const execFileAsync = promisify(execFile);
const log = createLogger('trending');

/** How many trending items to fetch */
const TRENDING_COUNT = 20;
/** Cache TTL (10 minutes) */
const CACHE_TTL_MS = 10 * 60 * 1000;

/** Candidate sources, tried in order until one returns entries. */
const TRENDING_SOURCES: string[] = [
  // YouTube Music trending playlist (very stable)
  'https://music.youtube.com/playlist?list=PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI',
  // Explore page (sometimes works)
  'https://www.youtube.com/feed/explore',
  // Gaming trending
  'https://www.youtube.com/gaming',
];

interface RawTrendingEntry {
  id: string;
  webpage_url?: string;
  title: string;
  channel?: string;
  uploader?: string;
  duration?: number;
  duration_string?: string;
  view_count?: number;
  upload_date?: string;
  thumbnails?: { url: string; height?: number }[];
}

interface RawTrendingResponse {
  entries?: RawTrendingEntry[];
}

/* --------------------------- region detection ---------------------------- */

function detectRegion(): string {
  try {
    const locale = app.getLocale();
    const parts = locale.split(/[-_]/);
    if (parts.length >= 2) {
      const country = parts[1].toUpperCase();
      if (/^[A-Z]{2}$/.test(country)) {
        log.info('detected region', country, 'from locale', locale);
        return country;
      }
    }
  } catch (err) {
    log.warn('region detection failed', String(err));
  }
  log.info('falling back to region US');
  return 'US';
}

/* -------------------------------- cache ---------------------------------- */

interface CacheEntry {
  response: TrendingResponse;
  at: number;
}

let cache: CacheEntry | null = null;

/* --------------------------------- fetch --------------------------------- */

function normaliseDate(d?: string): string | null {
  if (!d || d.length !== 8) return null;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

function mapEntry(e: RawTrendingEntry): VideoSearchResult {
  const thumb =
    e.thumbnails?.at(-1)?.url ??
    (e.id ? `https://i.ytimg.com/vi/${e.id}/mqdefault.jpg` : null);

  return {
    id: e.id,
    url: e.webpage_url ?? `https://www.youtube.com/watch?v=${e.id}`,
    title: e.title ?? '(untitled)',
    channel: e.channel ?? e.uploader ?? null,
    duration: e.duration ?? null,
    durationString: e.duration_string ?? null,
    thumbnail: thumb,
    viewCount: e.view_count ?? null,
    uploadDate: normaliseDate(e.upload_date),
  };
}

async function fetchFrom(url: string, bin: string, region: string): Promise<VideoSearchResult[]> {
  const args = [
    '--dump-single-json',
    '--flat-playlist',
    '--no-warnings',
    '--playlist-end', String(TRENDING_COUNT),
    '--geo-bypass-country', region,
    url,
  ];

  const { stdout } = await execFileAsync(bin, args, {
    maxBuffer: 1024 * 1024 * 64,
    timeout: 45_000,
  });

  const raw = JSON.parse(stdout) as RawTrendingResponse;
  const entries = raw.entries ?? [];
  return entries.map(mapEntry);
}

export async function getTrending(forceRefresh = false): Promise<TrendingResponse> {
  // Return cached if fresh
  if (!forceRefresh && cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return { ...cache.response, cached: true };
  }

  const settings = readSettings();
  const bin = resolveBinary('yt-dlp', settings.ytDlpPath);
  const region = detectRegion();

  log.info('fetching trending', `region=${region}`);

  let lastErr: unknown = null;

  for (const source of TRENDING_SOURCES) {
    try {
      log.info('trying source', source);
      const items = await fetchFrom(source, bin, region);

      if (items.length === 0) {
        log.warn('source returned 0 items, trying next', source);
        continue;
      }

      const response: TrendingResponse = {
        region,
        fetchedAt: Date.now(),
        cached: false,
        items,
      };

      cache = { response, at: Date.now() };
      log.info('trending OK', `source=${source}`, `items=${items.length}`);
      return response;
    } catch (err) {
      const stderr = (err as { stderr?: string }).stderr ?? (err as Error).message;
      log.warn('source failed', source, stderr);
      lastErr = err;
    }
  }

  // All sources failed
  const stderr = (lastErr as { stderr?: string })?.stderr ?? (lastErr as Error)?.message ?? 'All trending sources failed';
  throw new Error(humanizeError(stderr));
}