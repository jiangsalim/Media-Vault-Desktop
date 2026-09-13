/**
 * Custom frameless titlebar. Monochrome, minimal.
 * □ — ✕ window controls, thin 1px borders, IBM Plex Mono.
 */
import { useEffect, useState } from 'react';

export function TitleBar() {
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    window.mediavault.getVersion()
      .then((v) => { if (!cancelled) setVersion(v); })
      .catch(() => { /* ignore */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="drag flex h-9 shrink-0 items-center justify-between border-b border-border bg-surface px-3">
      <div className="flex items-center gap-2 pl-1">
        <span className="text-xs font-bold uppercase tracking-widest text-text-primary">
          HERMAN SOFTWARE
        </span>
        {version && (
          <span className="text-[10px] text-muted">v{version}</span>
        )}
      </div>

      <div className="no-drag flex items-center">
        <button
          onClick={() => window.mediavault.minimize()}
          className="flex h-9 w-12 items-center justify-center border-l border-border text-text-secondary transition-colors duration-150 hover:bg-hover hover:text-text-primary"
          aria-label="Minimize"
        >
          <span className="text-sm">—</span>
        </button>
        <button
          onClick={() => window.mediavault.maximize()}
          className="flex h-9 w-12 items-center justify-center border-l border-border text-text-secondary transition-colors duration-150 hover:bg-hover hover:text-text-primary"
          aria-label="Maximize"
        >
          <span className="text-sm">□</span>
        </button>
        <button
          onClick={() => window.mediavault.close()}
          className="flex h-9 w-12 items-center justify-center border-l border-border text-text-secondary transition-colors duration-150 hover:bg-hover hover:text-text-primary"
          aria-label="Close"
        >
          <span className="text-sm font-bold">✕</span>
        </button>
      </div>
    </div>
  );
}