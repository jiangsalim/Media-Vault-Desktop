import { useState } from 'react';
import { UrlInput } from '@/components/UrlInput';
import { QualityPanel } from '@/components/video/QualityPanel';
import { AudioPanel } from '@/components/video/AudioPanel';
import { SubtitlePanel } from '@/components/video/SubtitlePanel';
import { ThumbnailPanel } from '@/components/video/ThumbnailPanel';
import { EmptyState, ASCII } from '@/components/EmptyState';
import { VideoSkeleton } from '@/components/Skeleton';
import { useUiStore } from '@/store/useUiStore';
import { cn } from '@/lib/cn';
import { formatDuration } from '@/lib/format';

type Tab = 'video' | 'audio' | 'subtitles' | 'thumbnails';

const TABS: { id: Tab; label: string }[] = [
  { id: 'video', label: 'Video' },
  { id: 'audio', label: 'Audio' },
  { id: 'subtitles', label: 'Subtitles' },
  { id: 'thumbnails', label: 'Thumbnails' },
];

export function VideoPage() {
  const video = useUiStore((s) => s.currentVideo);
  const analyzing = useUiStore((s) => s.analyzing);
  const [tab, setTab] = useState<Tab>('video');

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <h1 className="section-title">Video</h1>
      <p className="text-xs text-text-secondary">
        Analyze, configure quality, and download.
      </p>

      <div className="divider" />
      <UrlInput autoFocus={false} />

      {analyzing && !video ? (
        <VideoSkeleton />
      ) : !video ? (
        <EmptyState
          ascii={ASCII.video}
          message="Paste a video URL above to analyze it."
        />
      ) : (
        <>
          {/* Video info header */}
          <div className="card flex items-center gap-4">
            <div className="relative h-14 w-24 shrink-0 overflow-hidden bg-surface-2">
              {video.thumbnails.at(-1)?.url && (
                <img src={video.thumbnails.at(-1)!.url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary">{video.title}</p>
              <p className="mt-0.5 text-xs text-text-secondary">
                {video.channel}
                {video.duration != null && ` · ${formatDuration(video.duration)}`}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-px border-b border-border">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'border-b-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors duration-150',
                  tab === t.id
                    ? 'border-text-primary text-text-primary'
                    : 'border-transparent text-muted hover:text-text-secondary',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="animate-fade-in">
            {tab === 'video' && <QualityPanel video={video} />}
            {tab === 'audio' && <AudioPanel video={video} />}
            {tab === 'subtitles' && <SubtitlePanel video={video} />}
            {tab === 'thumbnails' && <ThumbnailPanel video={video} />}
          </div>
        </>
      )}
    </div>
  );
}