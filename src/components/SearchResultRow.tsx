/** A single search result row (YouTube-style). */
import { Play } from 'lucide-react';
import type { VideoSearchResult } from '@shared/types';
import { formatDuration } from '@/lib/format';
import { cn } from '@/lib/cn';

function formatViews(n: number | null): string {
  if (n == null) return '';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B views`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K views`;
  return `${n} views`;
}

function relativeDate(iso: string | null): string {
  if (!iso) return '';
  try {
    const then = new Date(iso).getTime();
    const diffMs = Date.now() - then;
    const days = Math.floor(diffMs / 86_400_000);
    if (days < 1) return 'today';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  } catch {
    return '';
  }
}

interface Props {
  result: VideoSearchResult;
  onSelect: (result: VideoSearchResult) => void;
}

export function SearchResultRow({ result, onSelect }: Props) {
  const meta = [
    result.channel,
    formatViews(result.viewCount),
    relativeDate(result.uploadDate),
  ].filter(Boolean);

  return (
    <button
      onClick={() => onSelect(result)}
      className={cn(
        'group flex w-full items-center gap-3 border border-transparent px-2 py-2 text-left',
        'transition-colors duration-150 hover:border-border hover:bg-hover',
      )}
      aria-label={`Download: ${result.title}`}
    >
      {/* Thumbnail */}
      <div className="relative h-16 w-28 shrink-0 overflow-hidden bg-surface-2">
        {result.thumbnail ? (
          <img
            src={result.thumbnail}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
        {result.durationString && (
          <span className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white">
            {result.duration ? formatDuration(result.duration) : result.durationString}
          </span>
        )}
      </div>

      {/* Title + meta */}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium text-text-primary">
          {result.title}
        </p>
        <p className="mt-1 truncate font-mono text-[11px] text-text-secondary">
          {meta.join(' · ')}
        </p>
      </div>

      {/* Action icon */}
      <Play className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-accent" />
    </button>
  );
}