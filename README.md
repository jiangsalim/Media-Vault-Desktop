<p align="center">
  <img src="banner.png" alt="MediaVault Banner" width="100%"/>
</p>

<h1 align="center">MediaVault</h1>

<p align="center">
  <strong>A premium desktop YouTube download manager by Herman Software Solutions</strong>
</p>

<p align="center">
  <a href="https://github.com/jiangsalim/Media-Vault-Desktop/releases/latest">
    <img src="https://img.shields.io/github/v/release/jiangsalim/Media-Vault-Desktop?style=flat-square&color=00C2BA" alt="Latest Release">
  </a>
  <a href="https://github.com/jiangsalim/Media-Vault-Desktop/releases">
    <img src="https://img.shields.io/github/downloads/jiangsalim/Media-Vault-Desktop/total?style=flat-square&color=00C2BA" alt="Downloads">
  </a>
  <img src="https://img.shields.io/badge/platform-Windows%2010%20%7C%2011-blue?style=flat-square" alt="Platform">
  <img src="https://img.shields.io/github/license/jiangsalim/Media-Vault-Desktop?style=flat-square" alt="License">
</p>

<p align="center">
  <a href="https://github.com/jiangsalim/Media-Vault-Desktop/releases/latest">
    <img src="https://img.shields.io/badge/%E2%AC%87_Download_for_Windows-00C2BA?style=for-the-badge" alt="Download for Windows">
  </a>
</p>

---

## What is MediaVault?

MediaVault is a **free, open, native desktop app** for downloading YouTube content — videos, audio, thumbnails, subtitles, and playlists. Built with Electron + React, powered by [yt-dlp](https://github.com/yt-dlp/yt-dlp) and [FFmpeg](https://ffmpeg.org), and wrapped in a fast, minimal interface.

No ads. No account. No telemetry. Just download what you want.

<p align="center">
  <img src="ss.webp" alt="MediaVault screenshot" width="90%"/>
</p>

---

## Features

| Area | What you get |
|------|--------------|
| **Video** | MP4 / MKV · 144p to 4K · quality picker · FFmpeg auto-muxing |
| **Audio** | MP3, M4A, AAC, WAV, FLAC, OGG · 128-320 kbps |
| **Thumbnails** | Every available resolution · lightbox preview · one-click save |
| **Subtitles** | SRT / VTT / TXT · human + auto-generated · multi-language |
| **Search** | Live YouTube suggestions · infinite scroll · duration/date/sort filters |
| **Trending** | Region-aware curated feed · grid layout |
| **Preview** | Embedded YouTube player — watch before you download |
| **Analyzer** | Full metadata: views, likes, comments, tags, formats, codecs |
| **Playlists** | Bulk download · pick videos · one quality selection |
| **Download Manager** | Queue · concurrency · pause/resume/cancel/retry · live progress |
| **Themes** | Dark · Light · System |
| **Native** | Fast, offline-first, no browser required |

---

## Installation

### Windows (recommended)

1. **[Download the latest installer »](https://github.com/jiangsalim/Media-Vault-Desktop/releases/latest)**
2. Run `MediaVault-Setup-x.x.x.exe`
3. **Windows SmartScreen will warn** (normal — the app isn't code-signed yet). Click **More info → Run anyway**.
4. Launch **MediaVault** from your Start menu.

### System Requirements

- Windows 10 or 11 (64-bit)
- ~500 MB free disk space
- Internet connection for downloading content

> macOS and Linux support is planned. Watch the repo for updates.

---

## For Developers

### Prerequisites

- **Node.js 22 LTS** - [download](https://nodejs.org)
- **npm 10+** (ships with Node)
- **Git**
- **Windows only:** Visual Studio Build Tools (C++) for the native SQLite module

### Build from source

```bash
git clone https://github.com/jiangsalim/Media-Vault-Desktop.git
cd Media-Vault-Desktop
npm install
npm run rebuild
npm run fetch-binaries
npm run dev
```

### Build an installer

```bash
npm run build:win
```

See **[BUILD.md](./BUILD.md)** and **[INSTALL.md](./INSTALL.md)** for full details.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Runtime | Electron 32 |
| UI | React 18 + Vite 5 |
| Language | TypeScript |
| Styling | Tailwind CSS · Space Grotesk · IBM Plex Mono |
| State | Zustand |
| Storage | better-sqlite3 |
| Engines | yt-dlp · FFmpeg |

---

## Links

- **Website** - [herman-software-website.vercel.app](https://herman-software-website.vercel.app/)
- **YouTube** - [@HermanSoftwareSolutions](https://www.youtube.com/@HermanSoftwareSolutions)
- **Report a bug** - [Issues](https://github.com/jiangsalim/Media-Vault-Desktop/issues)
- **Contact** - [infohermansoftware@gmail.com](mailto:infohermansoftware@gmail.com)

---

## License

MIT (c) 2026 Herman Software Solutions

MediaVault bundles yt-dlp and FFmpeg, which are separate projects under their own licenses (Unlicense and LGPL/GPL respectively).

---

<p align="center">
  <sub>Built with care by <a href="https://herman-software-website.vercel.app/">Herman Software Solutions</a></sub>
</p>