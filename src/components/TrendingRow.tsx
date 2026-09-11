/** Horizontal scroll of trending YouTube videos (region auto-detected). */
import { useEffect, useRef, useState } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import { useAnalyze } from '@/hooks/useAnalyze';
import { Skeleton } from '@/components/Skeleton';
import type { TrendingResponse, VideoSearchResult } from '@shared/types';
import { formatDuration } from '@/lib/format';
import { cn } from '@/lib/cn';

const TRENDING_SHOWN = 12;

export function TrendingRow() {
  const [data, setData] = useState<TrendingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const analyze = useAnalyze();

  const load = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await window.mediavault.getTrending(force);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trending');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelect = (item: VideoSearchResult) => {
    analyze(item.url);
  };

  return (
    <section className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-text-primary">
            Trending{data?.region ? ` in ${data.region}` : ''}
          </h2>
          {data?.cached && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              cached
            </span>
          )}
        </div>
        <button
          onClick={() => load(true)}
          disabled={loading || refreshing}
          className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted transition-colors hover:text-accent disabled:opacity-40"
          title="Refresh trending"
        >
          <RefreshCw className={cn('h-3 w-3', refreshing && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-52 shrink-0" />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-between border border-border bg-surface px-3 py-3">
          <span className="text-xs text-text-secondary">{error}</span>
          <button onClick={() => load(true)} className="btn-ghost px-3">
            Retry
          </button>
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="border border-border bg-surface px-3 py-3 text-xs text-text-secondary">
          No trending videos available right now.
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1"
          style={{ scrollbarWidth: 'thin' }}
        >
          {data.items.slice(0, TRENDING_SHOWN).map((item) => (
            <TrendingCard key={item.id} item={item} onSelect={onSelect} />
          ))}
        </div>
      )}
    </section>
  );
}

function TrendingCard({
  item,
  onSelect,
}: {
  item: VideoSearchResult;
  onSelect: (item: VideoSearchResult) => void;
}) {
  return (
    <button
      onClick={() => onSelect(item)}
      className={cn(
        'group flex w-52 shrink-0 flex-col gap-2 text-left',
        'transition-transform duration-150 hover:-translate-y-0.5',
      )}
      aria-label={`Trending: ${item.title}`}
    >
      <div className="relative aspect-video w-full overflow-hidden border border-border bg-surface-2">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
          <Play className="h-6 w-6 fill-white text-white opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        {item.duration ? (
          <span className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white">
            {formatDuration(item.duration)}
          </span>
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-xs font-medium text-text-primary">
          {item.title}
        </p>
        {item.channel && (
          <p className="mt-0.5 truncate font-mono text-[10px] text-text-secondary">
            {item.channel}
          </p>
        )}
      </div>
    </button>
  );
}