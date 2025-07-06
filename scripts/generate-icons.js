import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pngToIco from 'png-to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Create build directory if it doesn't exist
const buildDir = path.join(rootDir, 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

async function generateIcons() {
  const svgBuffer = await sharp(path.join(rootDir, 'public', 'icon.svg'))
    .resize(1024, 1024)
    .toBuffer();

  // Generate PNG files for different sizes
  const sizes = [16, 32, 64, 128, 256];
  const pngFiles = await Promise.all(
    sizes.map(async size => {
      const filePath = path.join(buildDir, `icon-${size}.png`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(filePath);
      return filePath;
    })
  );

  // Generate ICO from PNG files
  const icoBuffer = await pngToIco(pngFiles);
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuffer);

  // Generate main PNG (512x512)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(buildDir, 'icon.png'));

  // Generate ICNS for macOS
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(buildDir, 'icon.icns'));

  // Clean up temporary PNG files
  sizes.forEach(size => {
    fs.unlinkSync(path.join(buildDir, `icon-${size}.png`));
  });

  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);
