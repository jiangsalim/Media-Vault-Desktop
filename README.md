<p align="center">
<img src="banner.png" alt="MediaVault Banner" width="100%"/>
</p>

<h1 align="center">MediaVault Desktop</h1>

<p align="center"><em>Download. Analyze. Manage. — Free YouTube Downloader</em></p>

<p align="center">
The ultimate YouTube downloader for Windows, Mac & Linux. Download videos in HD, extract MP3 audio, grab thumbnails, subtitles, and entire playlists — all in one beautiful desktop app. Built with love by HERMAN Software Solutions.
</p>

---

## ✨ Features

| Area | Highlights |
|------|-----------|
| **Video** | 144p → 2160p (4K) + *Best Available*, MP4 / MKV output, automatic FFmpeg muxing |
| **Audio** | MP3, M4A, AAC, WAV, FLAC, OGG · 128 / 192 / 256 / 320 kbps · *Best* |
| **Thumbnails** | Every available resolution with dimensions + lightbox preview & one-click download |
| **Subtitles** | SRT / VTT / TXT, human + auto-generated, multi-language |
| **Analytics** | Views, likes, comments, subs, tags, category, language, live/age status, formats, tracks |
| **Playlists** | Full or hand-picked downloads, bulk video/audio with one quality selection |
| **Download Manager** | Queue, concurrency limit, pause/resume/cancel/retry, speed + ETA, search/filter/sort |
| **Smart** | Clipboard URL detection, drag & drop, paste button, URL validation, duplicate detection |
| **UX** | Dark/Light/System themes, glassmorphism, Framer Motion transitions, skeletons, toasts, context menus |
| **Platform** | Windows (NSIS), macOS (DMG/ZIP), Linux (AppImage/deb), auto-updater |

---

## 🚀 Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# 2. (Optional) rebuild native modules for Electron's ABI
npm run rebuild

# 3. Make sure yt-dlp and ffmpeg are available
#    - either on your system PATH, or
#    - fetched into resources/bin via:  npm run fetch-binaries
#    - or set custom paths later in Settings → Engine status

# 4. Start the app in dev mode (Vite + Electron with HMR)
npm run dev


📦 Production Build
bash
# Fetch bundled binaries for the target platform (recommended)
npm run fetch-binaries          # current OS
# npm run fetch-binaries:all    # yt-dlp for all OSes

# Build installers
npm run build         # current platform
npm run build:win     # Windows x64 NSIS installer
npm run build:mac     # macOS DMG + ZIP
npm run build:linux   # Linux AppImage + deb
Output is written to release/<version>/. See BUILD.md for full details.

🌐 Links
Website: https://herman-software-website.vercel.app

GitHub: https://github.com/jiangsalim/Media-Vault-Desktop

🙏 Acknowledgements
MediaVault would not be possible without:

Electron

React

TypeScript

TailwindCSS

Framer Motion

yt-dlp

FFmpeg

better-sqlite3

📧 Support
Email: infohermansoftware@gmail.com

📄 License
MIT — see source headers. yt-dlp and FFmpeg are separate projects under their own licenses.

text
