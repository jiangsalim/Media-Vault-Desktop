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

  navigate: (route: Route) => void;
  toggleSidebar: () => void;
  setAnalyzing: (v: boolean) => void;
  setVideo: (v: VideoInfo | null) => void;
  setPlaylist: (p: PlaylistInfo | null) => void;
  toast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  route: 'home',
  sidebarCollapsed: false,
  analyzing: false,
  currentVideo: null,
  currentPlaylist: null,
  toasts: [],
  commandPaletteOpen: false,

  navigate: (route) => set({ route }),
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
}));