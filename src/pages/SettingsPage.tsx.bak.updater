import { useState } from 'react';
import {
  FolderOpen,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Terminal,
  Film,
} from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useUiStore } from '@/store/useUiStore';
import { Select } from '@/components/Select';
import { cn } from '@/lib/cn';
import {
  VIDEO_QUALITIES,
  VIDEO_CONTAINERS,
  AUDIO_FORMATS,
  AUDIO_BITRATES,
} from '@/lib/options';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt', label: 'Português' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
];

export function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);
  const deps = useSettingsStore((s) => s.deps);
  const refreshDeps = useSettingsStore((s) => s.refreshDeps);
  const toast = useUiStore((s) => s.toast);
  const [checking, setChecking] = useState(false);

  if (!settings) return null;

  const pickDir = async () => {
    const dir = await window.mediavault.pickDirectory();
    if (dir) {
      await update({ downloadDir: dir });
      toast('Download folder updated', 'success');
    }
  };

  const pickBinary = async (key: 'ffmpegPath' | 'ytDlpPath') => {
    const file = await window.mediavault.pickFile();
    if (file) {
      await update({ [key]: file });
      await refreshDeps();
      toast('Binary path updated', 'success');
    }
  };

  const recheck = async () => {
    setChecking(true);
    await refreshDeps();
    setChecking(false);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <h1 className="section-title">Settings</h1>

      {/* Search hint */}
      <input
        placeholder="Search settings…"
        className="input-bordered w-full max-w-sm text-xs"
        aria-label="Search settings"
      />

      <div className="divider" />

      {/* Engine status */}
      <Section title="Engine Status">
        <div className="space-y-2">
          <DepRow
            name="yt-dlp"
            available={deps?.ytDlp.available ?? false}
            version={deps?.ytDlp.version}
            path={deps?.ytDlp.path}
            onPick={() => pickBinary('ytDlpPath')}
          />
          <DepRow
            name="FFmpeg"
            available={deps?.ffmpeg.available ?? false}
            version={deps?.ffmpeg.version}
            path={deps?.ffmpeg.path}
            onPick={() => pickBinary('ffmpegPath')}
          />
        </div>
        <button onClick={recheck} className="btn-ghost mt-3 text-[10px]" disabled={checking}>
          <RefreshCw className={cn('h-3 w-3', checking && 'animate-spin')} /> Re-check
        </button>
      </Section>

      {/* Downloads */}
      <Section title="Downloads">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 truncate border border-border bg-surface px-3 py-2 text-xs text-text-secondary">
            {settings.downloadDir}
          </div>
          <button onClick={pickDir} className="btn-ghost shrink-0 text-[10px]">
            <FolderOpen className="h-3 w-3" /> Change
          </button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Toggle
            label="Auto-create folders"
            checked={settings.autoCreateFolders}
            onChange={(v) => update({ autoCreateFolders: v })}
          />
          <Toggle
            label="Clipboard detection"
            checked={settings.clipboardDetection}
            onChange={(v) => update({ clipboardDetection: v })}
          />
          <Toggle
            label="Embed thumbnail"
            checked={settings.embedThumbnail}
            onChange={(v) => update({ embedThumbnail: v })}
          />
          <Toggle
            label="Embed metadata"
            checked={settings.embedMetadata}
            onChange={(v) => update({ embedMetadata: v })}
          />
        </div>

        <div className="mt-4">
          <p className="label mb-1.5">
            Concurrent Downloads: {settings.concurrentLimit}
          </p>
          <input
            type="range"
            min={1}
            max={10}
            value={settings.concurrentLimit}
            onChange={(e) => update({ concurrentLimit: Number(e.target.value) })}
            className="w-full accent-text-primary"
          />
        </div>
      </Section>

      {/* Default formats */}
      <Section title="Default Formats">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Video quality"
            value={settings.defaultVideoQuality}
            options={VIDEO_QUALITIES}
            onChange={(v) => update({ defaultVideoQuality: v })}
          />
          <Select
            label="Video container"
            value={settings.defaultVideoContainer}
            options={VIDEO_CONTAINERS}
            onChange={(v) => update({ defaultVideoContainer: v })}
          />
          <Select
            label="Audio format"
            value={settings.defaultAudioFormat}
            options={AUDIO_FORMATS}
            onChange={(v) => update({ defaultAudioFormat: v })}
          />
          <Select
            label="Audio bitrate"
            value={settings.defaultAudioBitrate}
            options={AUDIO_BITRATES}
            onChange={(v) => update({ defaultAudioBitrate: v })}
          />
        </div>
      </Section>

      {/* Appearance — links to Theme page */}
      <Section title="Appearance">
        <p className="text-xs text-text-secondary leading-relaxed mb-3">
          Open the dedicated Theme page to customize fonts, spacing, colors,
          animations, and every visual aspect of the interface.
        </p>
        <button
          onClick={() => useUiStore.getState().navigate('theme')}
          className="btn-ghost text-[10px]"
        >
          Open Theme Editor →
        </button>
        <div className="mt-4">
          <Select
            label="Language"
            value={settings.language}
            options={LANGUAGES}
            onChange={(v) => update({ language: v })}
            className="max-w-xs"
          />
        </div>
      </Section>

      {/* Performance */}
      <Section title="Performance">
        <p className="text-xs text-text-secondary leading-relaxed">
          MediaVault uses hardware-accelerated rendering by default.
          All animations are capped at 200ms for consistent 60 FPS.
          Virtual scrolling activates automatically for large lists.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label mb-3">{title}</p>
      {children}
    </div>
  );
}

function DepRow({
  name,
  available,
  version,
  path,
  onPick,
}: {
  name: string;
  available: boolean;
  version: string | null | undefined;
  path: string | null | undefined;
  onPick: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border border-border bg-surface p-3">
      {name === 'FFmpeg' ? (
        <Film className="h-4 w-4 shrink-0 text-muted" />
      ) : (
        <Terminal className="h-4 w-4 shrink-0 text-muted" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-primary">{name}</span>
          {available ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-text-primary" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-text-secondary" />
          )}
        </div>
        <p className="truncate text-[10px] text-muted" title={path ?? ''}>
          {available ? version ?? 'detected' : 'Not found — set a custom path'}
        </p>
      </div>
      <button onClick={onPick} className="btn-ghost shrink-0 text-[10px]">
        Set Path
      </button>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between border border-border bg-surface px-3 py-2 text-xs text-text-secondary transition-colors duration-150 hover:bg-hover"
    >
      <span>{label}</span>
      <span
        className={cn(
          'inline-block h-4 w-8 border transition-colors duration-150',
          checked ? 'border-text-primary bg-text-primary' : 'border-border bg-transparent',
        )}
      >
        <span
          className={cn(
            'inline-block h-2.5 w-2.5 transition-all duration-150',
            checked ? 'ml-[17px] bg-bg' : 'ml-[3px] bg-muted',
          )}
        />
      </span>
    </button>
  );
}