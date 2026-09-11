import { Download, Film, Music, HardDrive, } from 'lucide-react';
import { UrlInput } from '@/components/UrlInput';
import { StatCard } from '@/components/StatCard';
import { DownloadCard } from '@/components/DownloadCard';
import { DependencyWarning } from '@/components/DependencyWarning';
import { EmptyState, ASCII } from '@/components/EmptyState';
import { useDownloadStore } from '@/store/useDownloadStore';
import { useUiStore } from '@/store/useUiStore';
import { formatBytes } from '@/lib/format';

export function HomePage() {
  const stats = useDownloadStore((s) => s.stats);
  const recent = useDownloadStore((s) => s.items.slice(0, 5));
  const navigate = useUiStore((s) => s.navigate);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* Hero */}
      <div className="pt-4">
        <h1 className="section-title">
          MediaVault
        </h1>
        <p className="mt-2 text-xs text-text-secondary max-w-md leading-relaxed">
          Download videos, audio, thumbnails, and subtitles from YouTube.
          Paste a URL below to begin.
        </p>
      </div>

      <DependencyWarning />

      <UrlInput />

      {/* Dashboard stats */}
      <div className="divider" />
      <div>
        <p className="label mb-3">Dashboard</p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Download} label="Total Downloads" value={String(stats?.totalDownloads ?? 0)} index={0} />
          <StatCard icon={Film} label="Videos" value={String(stats?.totalVideos ?? 0)} index={1} />
          <StatCard icon={Music} label="Audio" value={String(stats?.totalAudio ?? 0)} index={2} />
          <StatCard icon={HardDrive} label="Storage Used" value={formatBytes(stats?.totalBytes)} index={3} />
        </div>
      </div>

      {/* Recent downloads — compact table */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="label">Recent Downloads</p>
          <button
            onClick={() => navigate('downloads')}
            className="text-[10px] uppercase tracking-widest text-muted transition-colors hover:text-text-secondary"
          >
            View All →
          </button>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            ascii={ASCII.downloads}
            message="No downloads yet. Paste a URL above to begin."
          />
        ) : (
          <div className="border border-border">
            {/* Table header */}
            <div className="flex items-center gap-3 border-b border-border bg-surface px-2 py-1.5">
              <div className="w-16 shrink-0" />
              <div className="w-[30%]">
                <span className="label">Title</span>
              </div>
              <div className="w-[25%]">
                <span className="label">Progress</span>
              </div>
              <div className="w-16 shrink-0" />
              <div className="w-20 shrink-0 text-right">
                <span className="label">Status</span>
              </div>
              <div className="w-16 shrink-0" />
            </div>
            {recent.map((item) => (
              <DownloadCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}