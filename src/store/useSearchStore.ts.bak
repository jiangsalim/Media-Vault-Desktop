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

interface SearchState {
  query: string;
  results: VideoSearchResult[];
  loading: boolean;
  error: string | null;
  filters: SearchFilters;
  /** in-memory cache: query -> results (cleared on app restart) */
  cache: Map<string, VideoSearchResult[]>;

  setQuery: (q: string) => void;
  setFilters: (patch: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  search: (query: string) => Promise<void>;
  clear: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  loading: false,
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

    set({ query: trimmed, error: null });

    // Cache hit — instant
    const cached = get().cache.get(trimmed.toLowerCase());
    if (cached) {
      set({ results: cached, loading: false });
      return;
    }

    set({ loading: true, results: [] });
    try {
      const results = await window.mediavault.searchYoutube(trimmed, 10);
      get().cache.set(trimmed.toLowerCase(), results);
      set({ results, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Search failed',
      });
    }
  },

  clear: () => set({ query: '', results: [], error: null, loading: false }),
}));