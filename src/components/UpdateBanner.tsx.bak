import { useEffect, useState } from 'react';
import { Download, X, Loader2 } from 'lucide-react';
import type { UpdateState } from '../../electron/services/updater';

/** Monochrome update banner — minimal, top-center. */
export function UpdateBanner() {
  const [state, setState] = useState<UpdateState | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const off = window.mediavault.onUpdateStatus((s) => {
      setState(s);
      setDismissed(false);
    });
    return off;
  }, []);

  const show =
    !dismissed &&
    state &&
    (state.status === 'available' ||
      state.status === 'downloading' ||
      state.status === 'ready');

  if (!show || !state) return null;

  return (
    <div className="fixed left-1/2 top-11 z-40 flex -translate-x-1/2 items-center gap-3 border border-border bg-surface px-4 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
      {state.status === 'downloading' ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-text-secondary" />
          <span className="text-xs text-text-secondary">
            Downloading update… {state.percent}%
          </span>
        </>
      ) : state.status === 'ready' ? (
        <>
          <Download className="h-3.5 w-3.5 text-text-secondary" />
          <span className="text-xs text-text-secondary">
            Update {state.version} ready
          </span>
          <button
            onClick={() => window.mediavault.installUpdate()}
            className="btn-primary px-2 py-1 text-[10px]"
          >
            Restart
          </button>
        </>
      ) : (
        <>
          <Download className="h-3.5 w-3.5 text-text-secondary" />
          <span className="text-xs text-text-secondary">
            {state.version} available
          </span>
        </>
      )}
      <button
        onClick={() => setDismissed(true)}
        className="btn-icon h-6 w-6 text-xs"
        aria-label="Dismiss update"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}