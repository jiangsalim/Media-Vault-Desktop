/**
 * YouTube search suggestions — hits Google's public suggest endpoint
 * (same data YouTube's own search box uses).
 *
 * Endpoint: https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=QUERY
 * Returns plain JSON: ["query", ["sugg1", "sugg2", ...]]
 */
import { app } from 'electron';
import { createLogger } from '../utils/logger';

const log = createLogger('suggest');

/** In-memory cache: query -> string[] */
const cache = new Map<string, string[]>();
const CACHE_MAX = 200;

function detectHl(): string {
  try {
    return app.getLocale().split(/[-_]/)[0] || 'en';
  } catch {
    return 'en';
  }
}

function detectGl(): string {
  try {
    const parts = app.getLocale().split(/[-_]/);
    if (parts.length >= 2 && /^[A-Za-z]{2}$/.test(parts[1])) {
      return parts[1].toUpperCase();
    }
  } catch {
    // ignore
  }
  return 'US';
}

export async function getSuggestions(query: string, limit = 8): Promise<string[]> {
  const q = query.trim();
  if (!q) return [];

  const key = q.toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached.slice(0, limit);

  const hl = detectHl();
  const gl = detectGl();

  const url = new URL('https://suggestqueries.google.com/complete/search');
  url.searchParams.set('client', 'firefox');
  url.searchParams.set('ds', 'yt');
  url.searchParams.set('hl', hl);
  url.searchParams.set('gl', gl);
  url.searchParams.set('q', q);

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const parsed = JSON.parse(text) as [string, string[]];

    const list = Array.isArray(parsed[1]) ? parsed[1].filter((s) => typeof s === 'string') : [];

    // LRU-ish: drop oldest if over cap
    if (cache.size >= CACHE_MAX) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }
    cache.set(key, list);

    log.info('suggest', `q="${q}" -> ${list.length} results`);
    return list.slice(0, limit);
  } catch (err) {
    log.warn('suggest failed', String(err));
    return [];
  }
}