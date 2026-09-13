/** Lightweight UI store: routing, sidebar, the active analyzed media + toasts. */
import { create } from 'zustand';
import type { VideoInfo, PlaylistInfo } from '@shared/types';

export type Route =
  | 'home'
  | 'search'
  | 'video'
  | 'downloads'
  | 'playlists'
  | 'audio'
  | 'thumbnails'
  | 'analytics'
  | 'history'
  | 'theme'
  | 'settings'
  | 'about';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UiState {
  route: Route;
  sidebarCollapsed: boolean;
  analyzing: boolean;
  currentVideo: VideoInfo | null;
  currentPlaylist: PlaylistInfo | null;
  toasts: Toast[];
  commandPaletteOpen: boolean;
  /** Route to return to when the "back" button is used */
  returnTo: Route | null;
  /** Label shown on the back button, e.g. "Search: `"spice diana`"" */
  returnLabel: string | null;

  navigate: (route: Route) => void;
  toggleSidebar: () => void;
  setAnalyzing: (v: boolean) => void;
  setVideo: (v: VideoInfo | null) => void;
  setPlaylist: (p: PlaylistInfo | null) => void;
  toast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  /** Record where a page was reached from, for the back button */
  setReturnTo: (route: Route | null, label?: string | null) => void;
  /** Navigate to the return route (if any) and clear it */
  goBack: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  route: 'home',
  sidebarCollapsed: false,
  analyzing: false,
  currentVideo: null,
  currentPlaylist: null,
  toasts: [],
  commandPaletteOpen: false,
  returnTo: null,
  returnLabel: null,

  navigate: (route) => {
    const prev = get().route;
    const video = get().currentVideo;

    set({ route, returnTo: null, returnLabel: null });

    if (!video) return;

    // Leaving Video page → auto-open the mini player
    if (prev === 'video' && route !== 'video') {
      window.mediavault.openMiniPlayer(video.id).catch(() => {
        /* ignore — mini player is optional */
      });
    }

    // Returning to Video page → auto-close the mini player
    if (route === 'video') {
      window.mediavault.closeMiniPlayer().catch(() => {
        /* ignore */
      });
    }
  },
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setAnalyzing: (analyzing) => set({ analyzing }),
  setVideo: (currentVideo) => set({ currentVideo }),
  setPlaylist: (currentPlaylist) => set({ currentPlaylist }),

  toast: (message, type = 'info') =>
    set((s) => ({
      toasts: [...s.toasts, { id: crypto.randomUUID(), message, type }],
    })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),

  setReturnTo: (returnTo, returnLabel = null) => set({ returnTo, returnLabel }),

  goBack: () =>
    set((s) => ({
      route: s.returnTo ?? s.route,
      returnTo: null,
      returnLabel: null,
    })),
}));