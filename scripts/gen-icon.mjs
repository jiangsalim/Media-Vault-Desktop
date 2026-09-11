const sharp = require('sharp');
const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SIZES = [16, 24, 32, 48, 64, 128, 256];

async function main() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ico-'));
  const input = 'build/icon.png';

  console.log('Resizing icon.png to multiple sizes...');
  const paths = [];
  for (const size of SIZES) {
    const out = path.join(tmpDir, `icon-${size}.png`);
    await sharp(input).resize(size, size).toFile(out);
    paths.push(out);
    console.log(`  ✓ ${size}x${size}`);
  }

  // png-to-ico expects the files sorted by size (smallest first is fine)
  const buf = await pngToIco(paths);
  fs.writeFileSync('build/icon.ico', buf);
  console.log(`\n✓ icon.ico written: ${buf.length} bytes`);

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

main().catch(err => { console.error(err); process.exit(1); });
