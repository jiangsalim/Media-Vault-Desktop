/** Zustand store for the Search page: query, results, filters, in-session cache. */
import { create } from 'zustand';
import type { VideoSearchResult } from '@shared/types';

export type DurationFilter = 'any' | 'short' | 'medium' | 'long';
export type DateFilter = 'any' | 'today' | 'week' | 'month' | 'year';
export type SortBy = 'relevance' | 'newest' | 'views' | 'duration';

export interface SearchFilters {
  duration: DurationFilter;
  date: DateFilter;
  sort: SortBy;
}

const DEFAULT_FILTERS: SearchFilters = {
  duration: 'any',
  date: 'any',
  sort: 'relevance',
};

/** Batch size for initial load and each "load more" */
const BATCH_SIZE = 10;
/** Hard cap — yt-dlp's ytsearch typically tops out around here */
const MAX_RESULTS = 100;

interface SearchState {
  query: string;
  results: VideoSearchResult[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  filters: SearchFilters;
  /** in-memory cache: query -> results (cleared on app restart) */
  cache: Map<string, VideoSearchResult[]>;

  setQuery: (q: string) => void;
  setFilters: (patch: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  search: (query: string) => Promise<void>;
  loadMore: () => Promise<void>;
  clear: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  loading: false,
  loadingMore: false,
  hasMore: false,
  error: null,
  filters: DEFAULT_FILTERS,
  cache: new Map(),

  setQuery: (query) => set({ query }),

  setFilters: (patch) =>
    set((s) => ({ filters: { ...s.filters, ...patch } })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  search: async (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    set({ query: trimmed, error: null, loadingMore: false });

    // Cache hit — instant
    const cached = get().cache.get(trimmed.toLowerCase());
    if (cached) {
      set({
        results: cached,
        loading: false,
        hasMore: cached.length >= BATCH_SIZE,
      });
      return;
    }

    set({ loading: true, results: [], hasMore: false });
    try {
      const results = await window.mediavault.searchYoutube(trimmed, BATCH_SIZE);
      get().cache.set(trimmed.toLowerCase(), results);
      set({
        results,
        loading: false,
        hasMore: results.length >= BATCH_SIZE,
      });
    } catch (err) {
      set({
        loading: false,
        hasMore: false,
        error: err instanceof Error ? err.message : 'Search failed',
      });
    }
  },

  loadMore: async () => {
    const { query, results, loading, loadingMore, hasMore, cache } = get();
    if (!query || loading || loadingMore || !hasMore) return;

    const current = results.length;
    if (current >= MAX_RESULTS) {
      set({ hasMore: false });
      return;
    }

    set({ loadingMore: true });

    // Request next batch size (yt-dlp returns first N results)
    const nextCount = Math.min(current + BATCH_SIZE, MAX_RESULTS);

    try {
      const all = await window.mediavault.searchYoutube(query, nextCount);
      // Slice off already-loaded items
      const fresh = all.slice(current);
      const merged = [...results, ...fresh];

      cache.set(query.toLowerCase(), merged);

      set({
        results: merged,
        loadingMore: false,
        hasMore: fresh.length > 0 && merged.length < MAX_RESULTS,
      });
    } catch (err) {
      set({
        loadingMore: false,
        error: err instanceof Error ? err.message : 'Failed to load more',
      });
    }
  },

  clear: () =>
    set({
      query: '',
      results: [],
      error: null,
      loading: false,
      loadingMore: false,
      hasMore: false,
    }),
}));