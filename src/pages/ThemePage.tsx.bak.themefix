import { useState, useEffect, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';

/* ------------------------------------------------------------------ */
/*  Theme customization stored in localStorage (renderer-only).         */
/*  These don't need IPC persistence — they're visual preferences.     */
/* ------------------------------------------------------------------ */

interface ThemeCustom {
  mode: 'dark' | 'light' | 'system';
  fontSizeBase: number;       // 11–18
  fontSizeNav: number;        // 9–14
  fontSizeLabel: number;      // 9–14
  letterSpacing: number;      // 0.02–0.2
  sidebarWidth: number;       // 120–220
  contentPadding: number;     // 8–32
  animationSpeed: number;     // 0–400
  borderOpacity: number;      // 0.3–1.0
  textOpacity: number;        // 0.6–1.0
}

const DEFAULTS: ThemeCustom = {
  mode: 'dark',
  fontSizeBase: 13,
  fontSizeNav: 11,
  fontSizeLabel: 11,
  letterSpacing: 0.1,
  sidebarWidth: 160,
  contentPadding: 16,
  animationSpeed: 150,
  borderOpacity: 1.0,
  textOpacity: 1.0,
};

const STORAGE_KEY = 'mediavault-theme-custom';

function loadCustom(): ThemeCustom {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULTS };
}

function saveCustom(t: ThemeCustom) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
}

function applyToDOM(t: ThemeCustom) {
  const root = document.documentElement;
  root.style.setProperty('--font-size-base', `${t.fontSizeBase}px`);
  root.style.setProperty('--font-size-nav', `${t.fontSizeNav}px`);
  root.style.setProperty('--font-size-label', `${t.fontSizeLabel}px`);
  root.style.setProperty('--letter-spacing', `${t.letterSpacing}em`);
  root.style.setProperty('--sidebar-width', `${t.sidebarWidth}px`);
  root.style.setProperty('--sidebar-collapsed-width', '48px');
  root.style.setProperty('--content-padding', `${t.contentPadding}px`);
  root.style.setProperty('--animation-speed', `${t.animationSpeed}ms`);

  // Border opacity — blend the border color toward bg
  const borderBase = root.classList.contains('light') ? [200, 200, 200] : [42, 42, 42];
  const bgBase = root.classList.contains('light') ? [245, 245, 245] : [15, 15, 15];
  const blended = borderBase.map((c, i) => Math.round(bgBase[i]! + (c - bgBase[i]!) * t.borderOpacity));
  root.style.setProperty('--border', `${blended[0]} ${blended[1]} ${blended[2]}`);

  // Text opacity
  const textBase = root.classList.contains('light') ? [24, 24, 24] : [242, 242, 242];
  const bgForText = root.classList.contains('light') ? [245, 245, 245] : [15, 15, 15];
  const textBlended = textBase.map((c, i) => Math.round(bgForText[i]! + (c - bgForText[i]!) * t.textOpacity));
  root.style.setProperty('--text-primary', `${textBlended[0]} ${textBlended[1]} ${textBlended[2]}`);
}

export function ThemePage() {
  const [theme, setThemeState] = useState<ThemeCustom>(loadCustom);

  const update = useCallback((key: keyof ThemeCustom, value: number | string) => {
    setThemeState((prev) => {
      const next = { ...prev, [key]: value };
      saveCustom(next);
      applyToDOM(next);
      return next;
    });
  }, []);

  // Apply mode change
  const setMode = (mode: ThemeCustom['mode']) => {
    const resolved = mode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
      : mode;
    const root = document.documentElement;
    root.classList.toggle('light', resolved === 'light');
    root.classList.remove('dark');
    update('mode', mode);
    // Re-apply border/text opacity for new mode
    setTimeout(() => applyToDOM({ ...theme, mode }), 0);
  };

  // Apply on mount
  useEffect(() => {
    applyToDOM(theme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    saveCustom(DEFAULTS);
    setThemeState({ ...DEFAULTS });
    applyToDOM(DEFAULTS);
    // Reset mode too
    const root = document.documentElement;
    root.classList.remove('light');
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Theme</h1>
        <button onClick={reset} className="btn-ghost text-[10px]">
          <RotateCcw className="h-3 w-3" /> Reset Defaults
        </button>
      </div>

      <p className="text-xs text-text-secondary">
        Customize every aspect of the interface. Changes apply instantly.
      </p>

      <div className="divider" />

      {/* Color Mode */}
      <Section title="Color Mode">
        <div className="flex gap-2">
          {(['dark', 'light', 'system'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'px-5 py-2 border text-[10px] font-semibold uppercase tracking-widest transition-colors',
                theme.mode === m
                  ? 'border-text-primary bg-selection text-text-primary'
                  : 'border-border text-muted hover:text-text-secondary',
              )}
              style={{ transitionDuration: `${theme.animationSpeed}ms` }}
            >
              {m}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-muted">
          Dark uses deep blacks. Light inverts to white surfaces. System follows your OS preference.
        </p>
      </Section>

      {/* Typography */}
      <Section title="Typography">
        <SliderRow
          label="Base Font Size"
          value={theme.fontSizeBase}
          min={10}
          max={18}
          step={1}
          unit="px"
          onChange={(v) => update('fontSizeBase', v)}
          animSpeed={theme.animationSpeed}
        />
        <SliderRow
          label="Nav Font Size"
          value={theme.fontSizeNav}
          min={8}
          max={14}
          step={1}
          unit="px"
          onChange={(v) => update('fontSizeNav', v)}
          animSpeed={theme.animationSpeed}
        />
        <SliderRow
          label="Label Font Size"
          value={theme.fontSizeLabel}
          min={8}
          max={14}
          step={1}
          unit="px"
          onChange={(v) => update('fontSizeLabel', v)}
          animSpeed={theme.animationSpeed}
        />
        <SliderRow
          label="Letter Spacing"
          value={theme.letterSpacing}
          min={0.02}
          max={0.25}
          step={0.01}
          unit="em"
          onChange={(v) => update('letterSpacing', v)}
          animSpeed={theme.animationSpeed}
        />
      </Section>

      {/* Layout */}
      <Section title="Layout">
        <SliderRow
          label="Sidebar Width"
          value={theme.sidebarWidth}
          min={100}
          max={240}
          step={4}
          unit="px"
          onChange={(v) => update('sidebarWidth', v)}
          animSpeed={theme.animationSpeed}
        />
        <SliderRow
          label="Content Padding"
          value={theme.contentPadding}
          min={4}
          max={40}
          step={2}
          unit="px"
          onChange={(v) => update('contentPadding', v)}
          animSpeed={theme.animationSpeed}
        />
      </Section>

      {/* Visual Effects */}
      <Section title="Visual Effects">
        <SliderRow
          label="Animation Speed"
          value={theme.animationSpeed}
          min={0}
          max={500}
          step={10}
          unit="ms"
          onChange={(v) => update('animationSpeed', v)}
          animSpeed={theme.animationSpeed}
        />
        <p className="text-[10px] text-muted -mt-1">
          Set to 0 for instant transitions, 150ms default, up to 500ms for dramatic effects.
        </p>
        <SliderRow
          label="Border Opacity"
          value={theme.borderOpacity}
          min={0.1}
          max={1}
          step={0.05}
          unit="×"
          onChange={(v) => update('borderOpacity', v)}
          animSpeed={theme.animationSpeed}
        />
        <p className="text-[10px] text-muted -mt-1">
          Lower values make borders subtler. At 0.1 borders nearly disappear.
        </p>
        <SliderRow
          label="Text Contrast"
          value={theme.textOpacity}
          min={0.4}
          max={1}
          step={0.05}
          unit="×"
          onChange={(v) => update('textOpacity', v)}
          animSpeed={theme.animationSpeed}
        />
        <p className="text-[10px] text-muted -mt-1">
          Controls primary text brightness. Lower values reduce contrast.
        </p>
      </Section>

      {/* Preview */}
      <Section title="Preview">
        <div className="border border-border bg-surface p-4 space-y-3">
          <p className="section-title" style={{ fontSize: '16px' }}>Section Title</p>
          <p className="text-text-secondary" style={{ fontSize: 'var(--font-size-base)' }}>
            This is body text at your chosen base font size. The quick brown fox jumps over the lazy dog.
          </p>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-label)' }}>
            THIS IS A LABEL IN UPPERCASE
          </p>
          <div className="flex gap-2 pt-1">
            <button className="btn-primary">Primary Button</button>
            <button className="btn-ghost">Ghost Button</button>
          </div>
          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Border opacity preview</span>
              <span className="text-xs text-text-primary tabular-nums font-bold">100%</span>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label mb-3">{title}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  animSpeed,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  animSpeed: number;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs text-text-secondary w-40 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1"
        style={{ transitionDuration: `${animSpeed}ms` }}
      />
      <span className="text-xs font-bold text-text-primary tabular-nums w-16 text-right shrink-0">
        {Number.isInteger(step) ? value : value.toFixed(2)}{unit}
      </span>
    </div>
  );
}