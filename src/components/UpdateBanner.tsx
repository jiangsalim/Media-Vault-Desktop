/** Update banner — quick action, top-center. */
import { useState } from 'react';
import { Download, X, Loader2, RotateCw } from 'lucide-react';
import { useUpdateStatus } from '@/hooks/useUpdateStatus';

export function UpdateBanner() {
  const { state, download, install } = useUpdateStatus();
  const [dismissed, setDismissed] = useState(false);

  const visible =
    !dismissed &&
    (state.status === 'available' ||
      state.status === 'downloading' ||
      state.status === 'ready');

  if (!visible) return null;

  return (
    <div className="fixed left-1/2 top-11 z-40 flex -translate-x-1/2 items-center gap-3 border border-border bg-surface px-4 py-2 shadow-card">
      {state.status === 'downloading' ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
          <span className="text-xs text-text-secondary">
            Downloading update… {state.percent}%
          </span>
          <div className="h-1 w-32 overflow-hidden bg-surface-2">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${state.percent}%` }}
            />
          </div>
        </>
      ) : state.status === 'ready' ? (
        <>
          <Download className="h-3.5 w-3.5 text-accent" />
          <span className="text-xs text-text-secondary">
            Update {state.version} ready
          </span>
          <button
            onClick={install}
            className="btn-primary px-2 py-1 text-[10px]"
          >
            <RotateCw className="h-3 w-3" />
            Restart
          </button>
        </>
      ) : state.status === 'available' ? (
        <>
          <Download className="h-3.5 w-3.5 text-accent" />
          <span className="text-xs text-text-secondary">
            v{state.version} available
          </span>
          <button
            onClick={download}
            className="btn-primary px-2 py-1 text-[10px]"
          >
            Download
          </button>
        </>
      ) : null}
      <button
        onClick={() => setDismissed(true)}
        className="btn-icon h-6 w-6"
        aria-label="Dismiss update"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}