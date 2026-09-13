/** About page — Herman Software Solutions branding, socials, version, shortcuts. */
import { useEffect, useState } from 'react';
export function AboutPage() {
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    window.mediavault.getVersion()
      .then((v) => { if (!cancelled) setVersion(v); })
      .catch(() => { /* ignore */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <h1 className="section-title">About</h1>

      <div className="divider" />

      <p className="text-center text-xs text-text-secondary">
        A premium desktop YouTube download manager by{' '}
        <a
          href="https://herman-software-website.vercel.app/"
          target="_blank"
          rel="noreferrer"
          className="text-accent hover:underline"
        >
          Herman Software Solutions
        </a>
        .
      </p>

      <div className="divider" />

      {/* Socials */}
      <div>
        <p className="label mb-3">Connect</p>
        <div className="border border-border">
          {[
            ['GitHub', 'https://github.com/jiangsalim/Media-Vault-Desktop', 'github.com/jiangsalim/Media-Vault-Desktop'],
            ['Email', 'mailto:infohermansoftware@gmail.com', 'infohermansoftware@gmail.com'],
            ['YouTube', 'https://www.youtube.com/@HermanSoftwareSolutions', 'youtube.com/@HermanSoftwareSolutions'],
          ].map(([name, url, display]) => (
            <button
              key={name}
              onClick={() => window.open(url, '_blank')}
              className="flex w-full items-center justify-between border-b border-border px-3 py-2.5 text-xs text-text-secondary transition-colors hover:bg-hover last:border-b-0"
            >
              <span className="font-medium text-text-primary">{name}</span>
              <span className="tabular-nums">{display}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Version info */}
      <div>
        <p className="label mb-3">Version</p>
        <div className="border border-border">
          {[
            ['MediaVault', version || '—'],
            ['Electron', '32.x'],
            ['React', '18.3'],
            ['Vite', '5.4'],
            ['yt-dlp', 'latest'],
            ['FFmpeg', 'latest'],
          ].map(([name, ver]) => (
            <div
              key={name}
              className="flex items-center justify-between border-b border-border px-3 py-2 last:border-b-0"
            >
              <span className="text-xs text-text-secondary">{name}</span>
              <span className="text-xs font-medium text-text-primary tabular-nums">{ver}</span>
            </div>
          ))}
        </div>
      </div>

      {/* License */}
      <div>
        <p className="label mb-3">License</p>
        <div className="card">
          <p className="text-xs text-text-secondary leading-relaxed">
            MIT License. Copyright (c) 2026 Herman Software Solutions.
            This software is provided as-is, without warranty of any kind.
          </p>
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div>
        <p className="label mb-3">Keyboard Shortcuts</p>
        <div className="border border-border">
          {[
            ['Ctrl+K', 'Command Palette'],
            ['Ctrl+L', 'Focus URL Bar'],
            ['Ctrl+V', 'Paste URL'],
            ['Ctrl+D', 'Downloads'],
            ['Ctrl+H', 'History'],
            ['Ctrl+,', 'Settings'],
            ['F5', 'Refresh'],
            ['Space', 'Pause / Resume'],
            ['Delete', 'Remove Item'],
            ['Escape', 'Close Dialog / Palette'],
          ].map(([key, desc]) => (
            <div
              key={key}
              className="flex items-center justify-between border-b border-border px-3 py-2 last:border-b-0"
            >
              <span className="text-xs text-text-secondary">{desc}</span>
              <span className="border border-border bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-text-primary tabular-nums">
                {key}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}