import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

async function processImage(filename, fn) {
  const src = path.join('public', 'images', filename);
  if (!fs.existsSync(src)) return;
  const fileBuffer = fs.readFileSync(src);
  const originalSize = fileBuffer.length;
  const buffer = await fn(sharp(fileBuffer));
  fs.writeFileSync(src, buffer);
  const newSize = fs.statSync(src).size;
  console.log(`${filename}: ${originalSize} -> ${newSize} bytes (${Math.round((1 - newSize / originalSize) * 100)}% reduction)`);
}

async function main() {
  await processImage('fried-chicken.jpg', (s) =>
    s.resize(1200, null, { withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toBuffer()
  );
  await processImage('doro_wat.png', (s) =>
    s.png({ compressionLevel: 9, effort: 8 }).toBuffer()
  );
  await processImage('doro-wot.png', (s) =>
    s.png({ compressionLevel: 9, effort: 8 }).toBuffer()
  );
  await processImage('shiro.png', (s) =>
    s.png({ compressionLevel: 9, effort: 8 }).toBuffer()
  );
  await processImage('home.jpg', (s) =>
    s.resize(1200, null, { withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toBuffer()
  );
  await processImage('Home_hero.jpg', (s) =>
    s.resize(1200, null, { withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toBuffer()
  );
}

main().catch(console.error);
