const fs = require('fs');
const path = require('path');

async function main() {
  const sharp = require('sharp');
  const pngToIcoModule = require('png-to-ico');
  const pngToIco = pngToIcoModule.default || pngToIcoModule;

  const root = path.join(__dirname, '..');
  const assetsDir = path.join(root, 'assets');
  const svgPath = path.join(assetsDir, 'icon.svg');

  if (!fs.existsSync(svgPath)) {
    throw new Error(`Missing SVG icon at ${svgPath}`);
  }

  const svg = fs.readFileSync(svgPath);

  // PNGs (also useful for BrowserWindow icon on Linux/macOS)
  const pngSizes = [16, 32, 48, 64, 128, 256, 512];
  await Promise.all(
    pngSizes.map(async (size) => {
      const outPath = path.join(assetsDir, `icon-${size}.png`);
      await sharp(svg)
        .resize(size, size)
        .png({ compressionLevel: 9 })
        .toFile(outPath);
    })
  );

  // Primary PNG used by BrowserWindow icon (fallback)
  fs.copyFileSync(path.join(assetsDir, 'icon-256.png'), path.join(assetsDir, 'icon.png'));

  // Windows .ico (multi-resolution)
  const icoPngs = [256, 128, 64, 48, 32, 16].map((s) => path.join(assetsDir, `icon-${s}.png`));
  const icoBuf = await pngToIco(icoPngs);
  fs.writeFileSync(path.join(assetsDir, 'icon.ico'), icoBuf);

  console.log('Generated icons in assets/: icon.svg, icon.png, icon.ico, icon-*.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
