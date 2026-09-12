/**
 * Resolves paths to the yt-dlp and ffmpeg binaries.
 *
 * Resolution order:
 *   1. Explicit path stored in settings (user override).
 *   2. Bundled binary shipped in resources/bin (production / packaged app).
 *   3. System PATH (lets power users rely on their own install).
 *
 * The resolver never throws — callers should check `available` via the
 * dependency checker before launching a download.
 */
import { app } from 'electron';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const isWin = process.platform === 'win32';

/** Directory that contains bundled binaries (packaged vs dev). */
function resourcesBinDir(): string {
  // When packaged, electron-builder copies resources/bin -> <resources>/bin
  if (app.isPackaged) {
    return join(process.resourcesPath, 'bin');
  }
  // In dev we look in the repo's resources/bin/<platform> folder
  const platformDir =
    process.platform === 'win32'
      ? 'win'
      : process.platform === 'darwin'
        ? 'mac'
        : 'linux';
  return join(app.getAppPath(), 'resources', 'bin', platformDir);
}

function withExe(name: string): string {
  return isWin ? `${name}.exe` : name;
}

export type BinaryName = 'yt-dlp' | 'ffmpeg' | 'ffprobe' | 'deno';

/**
 * If the user set a custom ffmpeg path, derive the sibling ffprobe path from the
 * same directory (ffprobe lives next to ffmpeg in every standard distribution).
 */
function deriveProbeOverride(name: BinaryName, override?: string | null): string | null {
  if (name !== 'ffprobe' || !override) return override ?? null;
  // override here is actually the user's ffmpeg path; swap the filename.
  const dir = override.replace(/[\\/][^\\/]*$/, '');
  const candidate = join(dir, withExe('ffprobe'));
  return existsSync(candidate) ? candidate : null;
}

/**
 * Find a binary by name, honouring an optional user override.
 * Returns the resolved absolute path, or just the bare name (so the OS can
 * resolve it from PATH) when nothing else is found.
 *
 * For 'ffprobe', pass the user's ffmpeg override (if any) — we derive ffprobe
 * from the same directory.
 */
export function resolveBinary(name: BinaryName, override?: string | null): string {
  const resolvedOverride = name === 'ffprobe' ? deriveProbeOverride(name, override) : override;
  if (resolvedOverride && existsSync(resolvedOverride)) return resolvedOverride;

  const bundled = join(resourcesBinDir(), withExe(name));
  if (existsSync(bundled)) return bundled;

  // Fall back to PATH resolution by returning the bare command name.
  return withExe(name);
}

/**
 * Resolve a binary to an ABSOLUTE file path only when one actually exists
 * (user override or bundled). Returns null when we'd otherwise fall back to a
 * bare PATH name.
 *
 * This matters for yt-dlp's `--ffmpeg-location`: that flag is treated as a
 * literal path/directory, NOT a PATH lookup. Passing a bare name like "ffmpeg"
 * makes yt-dlp look for a file literally named "ffmpeg" in the CWD and FAIL to
 * merge (e.g. MKV), misreporting "FFmpeg was not found". When we don't have a
 * concrete path we must OMIT the flag and let yt-dlp discover ffmpeg on PATH.
 */
export function resolveBinaryPathOrNull(
  name: BinaryName,
  override?: string | null,
): string | null {
  const resolvedOverride = name === 'ffprobe' ? deriveProbeOverride(name, override) : override;
  if (resolvedOverride && existsSync(resolvedOverride)) return resolvedOverride;

  const bundled = join(resourcesBinDir(), withExe(name));
  if (existsSync(bundled)) return bundled;

  return null;
}

/**
 * Attempt to read a binary version string; returns null when not runnable.
 *
 * Robustness notes (real-world reliability):
 *   • A generous timeout — process spawn is slow on Windows and when the
 *     machine is busy downloading. A too-short timeout was causing the UI to
 *     intermittently report a present binary as "missing".
 *   • One automatic retry on failure to absorb transient spawn hiccups.
 */
export async function probeVersion(
  binPath: string,
  args: string[],
  attempts = 2,
): Promise<string | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      const { stdout, stderr } = await execFileAsync(binPath, args, {
        timeout: 20_000,
        windowsHide: true,
      });
      // ffmpeg prints its banner to stderr on some builds; accept either.
      const out = (stdout || stderr || '').trim();
      if (out) return out.split('\n')[0] ?? null;
    } catch {
      // brief backoff before the retry
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 250));
    }
  }
  return null;
}
