import { Suspense, lazy, useEffect, useCallback } from 'react';
import { TitleBar } from '@/components/TitleBar';
import { Sidebar } from '@/components/Sidebar';
import { Toasts } from '@/components/Toasts';
import { UpdateBanner } from '@/components/UpdateBanner';
import { Skeleton } from '@/components/Skeleton';
import { CommandPalette } from '@/components/CommandPalette';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useUiStore, type Route } from '@/store/useUiStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useDownloadStore } from '@/store/useDownloadStore';

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const SearchPage = lazy(() => import('@/pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const VideoPage = lazy(() => import('@/pages/VideoPage').then((m) => ({ default: m.VideoPage })));
const DownloadsPage = lazy(() => import('@/pages/DownloadsPage').then((m) => ({ default: m.DownloadsPage })));
const PlaylistsPage = lazy(() => import('@/pages/PlaylistsPage').then((m) => ({ default: m.PlaylistsPage })));
const AudioPage = lazy(() => import('@/pages/AudioPage').then((m) => ({ default: m.AudioPage })));
const ThumbnailsPage = lazy(() => import('@/pages/ThumbnailsPage').then((m) => ({ default: m.ThumbnailsPage })));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const HistoryPage = lazy(() => import('@/pages/HistoryPage').then((m) => ({ default: m.HistoryPage })));
const ThemePage = lazy(() => import('@/pages/ThemePage').then((m) => ({ default: m.ThemePage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })));

const PAGES: Record<Route, React.ComponentType> = {
  home: HomePage,
  search: SearchPage,
  video: VideoPage,
  downloads: DownloadsPage,
  playlists: PlaylistsPage,
  audio: AudioPage,
  thumbnails: ThumbnailsPage,
  analytics: AnalyticsPage,
  history: HistoryPage,
  theme: ThemePage,
  settings: SettingsPage,
  about: AboutPage,
};

export function App() {
  const route = useUiStore((s) => s.route);
  const loadSettings = useSettingsStore((s) => s.load);
  const initDownloads = useDownloadStore((s) => s.init);
  const commandPaletteOpen = useUiStore((s) => s.commandPaletteOpen);
  const setCommandPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const Page = PAGES[route];

  useEffect(() => {
    loadSettings();
    initDownloads();
  }, [loadSettings, initDownloads]);

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // Ctrl+K — Command Palette
      if (mod && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
        return;
      }

      // Ctrl+D — Downloads
      if (mod && e.key === 'd') {
        e.preventDefault();
        useUiStore.getState().navigate('downloads');
        return;
      }

      // Ctrl+H — History
      if (mod && e.key === 'h') {
        e.preventDefault();
        useUiStore.getState().navigate('history');
        return;
      }

      // Ctrl+, — Settings
      if (mod && e.key === ',') {
        e.preventDefault();
        useUiStore.getState().navigate('settings');
        return;
      }

      // Escape — close command palette
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    },
    [commandPaletteOpen, setCommandPaletteOpen],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-auto border-l border-border bg-bg" style={{ padding: 'var(--content-padding, 16px)' }}>
          <ErrorBoundary key={route}>
            <Suspense fallback={<PageFallback />}>
              <Page />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      <Toasts />
      <UpdateBanner />
      <CommandPalette />
    </div>
  );
}

function PageFallback() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="divider my-4" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}