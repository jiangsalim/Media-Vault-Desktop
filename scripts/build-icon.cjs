const sharp = require('sharp');
const pngToIcoModule = require('png-to-ico');
const pngToIco = pngToIcoModule.default || pngToIcoModule;
const fs = require('fs');
const path = require('path');
const os = require('os');

const SVG = 'build/logo.svg';
const ICO_OUT = 'build/icon.ico';
const SIZES = [16, 24, 32, 48, 64, 128, 256];

async function main() {
  console.log('Resizing SVG to multiple sizes...');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ico-'));
  const paths = [];
  for (const size of SIZES) {
    const out = path.join(tmpDir, `icon-${size}.png`);
    await sharp(SVG, { density: 600 })
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(out);
    paths.push(out);
    console.log(`  ✓ ${size}x${size}`);
  }

  console.log('\nCombining into ICO...');
  const buf = await pngToIco(paths);
  fs.writeFileSync(ICO_OUT, buf);
  console.log(`✓ ${ICO_OUT} (${buf.length} bytes)`);

  fs.rmSync(tmpDir, { recursive: true, force: true });
}

main().catch(err => { console.error('ERROR:', err.message); process.exit(1); });
