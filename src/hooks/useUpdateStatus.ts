/**
 * Shared hook that tracks update state across the app.
 * On mount, fetches the current snapshot (in case events fired before
 * the component subscribed), then subscribes for live updates.
 */
import { useEffect, useState, useCallback } from 'react';
import type { UpdateState } from '../../electron/services/updater';

export interface UpdateSnapshot {
  state: UpdateState;
  lastCheckedAt: number | null;
  currentVersion: string;
}

export function useUpdateStatus() {
  const [snapshot, setSnapshot] = useState<UpdateSnapshot>({
    state: { status: 'idle' },
    lastCheckedAt: null,
    currentVersion: '',
  });
  const [checking, setChecking] = useState(false);

  // Fetch initial snapshot + subscribe to events
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const snap = await window.mediavault.getUpdateState();
        if (mounted) setSnapshot(snap);
      } catch {
        // ignore
      }
    })();

    const off = window.mediavault.onUpdateStatus((state) => {
      if (!mounted) return;
      setSnapshot((s) => ({ ...s, state }));
    });

    return () => {
      mounted = false;
      off();
    };
  }, []);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      await window.mediavault.checkForUpdates();
    } finally {
      setTimeout(() => setChecking(false), 1000);
    }
  }, []);

  const download = useCallback(async () => {
    try {
      await window.mediavault.downloadUpdate();
    } catch {
      // ignore
    }
  }, []);

  const install = useCallback(async () => {
    try {
      await window.mediavault.installUpdate();
    } catch {
      // ignore
    }
  }, []);

  return { ...snapshot, checking, check, download, install };
}