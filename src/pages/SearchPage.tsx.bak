/** Search page — query YouTube via yt-dlp and pick results to download. */
import { useMemo, useState, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { useSearchStore } from '@/store/useSearchStore';
import { SearchResultRow } from '@/components/SearchResultRow';
import { SearchFilters } from '@/components/SearchFilters';
import { Skeleton } from '@/components/Skeleton';
import { useAnalyze } from '@/hooks/useAnalyze';
import type { VideoSearchResult } from '@shared/types';

export function SearchPage() {
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const search = useSearchStore((s) => s.search);
  const clear = useSearchStore((s) => s.clear);
  const results = useSearchStore((s) => s.results);
  const loading = useSearchStore((s) => s.loading);
  const error = useSearchStore((s) => s.error);
  const filters = useSearchStore((s) => s.filters);

  const analyze = useAnalyze();
  const [input, setInput] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setInput(query);
  }, [query]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim()) search(input);
  };

  const onSelect = (result: VideoSearchResult) => {
    // Hand off to the existing analyze pipeline — navigates to Video page.
    analyze(result.url);
  };

  const filtered = useMemo(() => {
    let list = [...results];

    // Duration filter
    if (filters.duration !== 'any') {
      list = list.filter((r) => {
        const d = r.duration ?? 0;
        if (filters.duration === 'short') return d > 0 && d < 240;
        if (filters.duration === 'medium') return d >= 240 && d <= 1200;
        if (filters.duration === 'long') return d > 1200;
        return true;
      });
    }

    // Date filter
    if (filters.date !== 'any') {
      const now = Date.now();
      const spans = {
        today: 86_400_000,
        week: 7 * 86_400_000,
        month: 30 * 86_400_000,
        year: 365 * 86_400_000,
      } as const;
      const span = spans[filters.date];
      list = list.filter((r) => {
        if (!r.uploadDate) return false;
        return now - new Date(r.uploadDate).getTime() <= span;
      });
    }

    // Sort
    if (filters.sort === 'newest') {
      list.sort((a, b) => (b.uploadDate ?? '').localeCompare(a.uploadDate ?? ''));
    } else if (filters.sort === 'views') {
      list.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    } else if (filters.sort === 'duration') {
      list.sort((a, b) => (b.duration ?? 0) - (a.duration ?? 0));
    }

    return list;
  }, [results, filters]);

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col">
      <h1 className="section-title">Search</h1>
      <p className="text-xs text-text-secondary mb-4">
        Find videos on YouTube and pick one to download.
      </p>

      {/* Search bar */}
      <form onSubmit={submit} className="mb-3">
        <div className="flex items-center gap-2 border border-border bg-surface px-3 py-2 focus-within:border-accent">
          <Search className="h-3.5 w-3.5 text-muted" />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search YouTube..."
            className="flex-1 bg-transparent font-mono text-sm text-text-primary outline-none placeholder:text-muted"
            spellCheck={false}
          />
          {input && (
            <button
              type="button"
              onClick={() => setInput('')}
              className="btn-icon"
              aria-label="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-primary"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Search'}
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="mb-3">
        <SearchFilters />
      </div>

      {/* Results */}
      <div className="min-h-0 flex-1 overflow-auto">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="border border-border bg-surface p-4 text-xs text-text-secondary">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-border bg-surface p-8 text-center text-xs text-text-secondary">
            {query
              ? 'No results match your filters.'
              : 'Type a query above and press Enter.'}
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((r) => (
              <SearchResultRow key={r.id} result={r} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}