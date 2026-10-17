import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

async function createOgImage() {
  const width = 1200;
  const height = 630;

  // 1. Resize and crop the food background to 1200x630
  const bgPath = path.join('public', 'images', 'home.jpg');
  const bgBuffer = await sharp(bgPath)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .toBuffer();

  // 2. SVG overlay with dark vignette and crisp typography
  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Horizontal gradient from dark on left to semi-transparent on right -->
        <linearGradient id="overlayGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0c0a09" stop-opacity="0.94"/>
          <stop offset="45%" stop-color="#0c0a09" stop-opacity="0.85"/>
          <stop offset="75%" stop-color="#0c0a09" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="#0c0a09" stop-opacity="0.50"/>
        </linearGradient>
        
        <!-- Amber accent glow in top-left -->
        <radialGradient id="amberGlow" cx="15%" cy="20%" r="40%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <!-- Background overlay -->
      <rect width="${width}" height="${height}" fill="url(#overlayGrad)"/>
      <rect width="${width}" height="${height}" fill="url(#amberGlow)"/>

      <!-- Border accent -->
      <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="24" fill="none" stroke="#f59e0b" stroke-opacity="0.2" stroke-width="2"/>

      <!-- Top Header: Logo + Brand + Tag -->
      <g transform="translate(70, 75)">
        <!-- Circle Logo -->
        <circle cx="28" cy="28" r="28" fill="#f59e0b"/>
        <text x="28" y="37" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#0c0a09" text-anchor="middle">AE</text>
        
        <!-- Brand Name -->
        <text x="74" y="38" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800" fill="#fafaf9">
          Addis <tspan fill="#f59e0b">Eats</tspan>
        </text>

        <!-- Category Pill Badge -->
        <rect x="800" y="8" width="260" height="40" rx="20" fill="#1c1917" stroke="#44403c" stroke-width="1.5"/>
        <text x="930" y="33" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#fbbf24" letter-spacing="1" text-anchor="middle">AUTHENTIC ETHIOPIAN</text>
      </g>

      <!-- Main Title -->
      <g transform="translate(70, 240)">
        <text x="0" y="0" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="900" fill="#fafaf9" letter-spacing="-0.5">
          Authentic Ethiopian Food
        </text>
        <text x="0" y="65" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="900" fill="#f59e0b" letter-spacing="-0.5">
          Delivered Across Addis Ababa
        </text>
      </g>

      <!-- Subtitle / Highlights -->
      <g transform="translate(70, 390)">
        <text x="0" y="0" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="500" fill="#d6d3d1">
          Special Kitfo • Siga &amp; Doro Wot • Sizzling Beef Tibs • Vegan Beyaynetu • Buna Coffee
        </text>
        <text x="0" y="35" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#a8a29e">
          Fresh traditional recipes prepared daily with herb-clarified niter kibbeh &amp; organic spices.
        </text>
      </g>

      <!-- Bottom Info Bar -->
      <g transform="translate(70, 535)">
        <line x1="0" y1="0" x2="1060" y2="0" stroke="#292524" stroke-width="1.5"/>
        <text x="0" y="36" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#f59e0b">
          Order Online • Fast Citywide Delivery
        </text>
        <text x="1060" y="36" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#78716c" text-anchor="end">
          addis-eats-day-48-next-project.vercel.app
        </text>
      </g>
    </svg>
  `);

  // 3. Composite and write JPEG image
  const finalBuffer = await sharp(bgBuffer)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  const ogPath1 = path.join('public', 'images', 'addis-eats-og.jpg');
  const ogPath2 = path.join('public', 'og-image.jpg');

  fs.writeFileSync(ogPath1, finalBuffer);
  fs.writeFileSync(ogPath2, finalBuffer);

  console.log(`Generated ${ogPath1} (${finalBuffer.length} bytes, 1200x630)`);
  console.log(`Generated ${ogPath2} (${finalBuffer.length} bytes, 1200x630)`);
}

async function createMenuOgImage() {
  const width = 1200;
  const height = 630;

  const bgPath = path.join('public', 'images', 'Beyaynetu.jpg');
  const bgBuffer = await sharp(bgPath)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .toBuffer();

  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="menuGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0c0a09" stop-opacity="0.95"/>
          <stop offset="48%" stop-color="#0c0a09" stop-opacity="0.86"/>
          <stop offset="78%" stop-color="#0c0a09" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="#0c0a09" stop-opacity="0.45"/>
        </linearGradient>
      </defs>

      <rect width="${width}" height="${height}" fill="url(#menuGrad)"/>
      <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="24" fill="none" stroke="#f59e0b" stroke-opacity="0.2" stroke-width="2"/>

      <g transform="translate(70, 75)">
        <circle cx="28" cy="28" r="28" fill="#f59e0b"/>
        <text x="28" y="37" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#0c0a09" text-anchor="middle">AE</text>
        <text x="74" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="800" fill="#fafaf9">
          Addis <tspan fill="#f59e0b">Eats</tspan>
        </text>
        <rect x="800" y="8" width="260" height="40" rx="20" fill="#1c1917" stroke="#44403c" stroke-width="1.5"/>
        <text x="930" y="33" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#fbbf24" letter-spacing="1" text-anchor="middle">EXPLORE OUR MENU</text>
      </g>

      <g transform="translate(70, 240)">
        <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="900" fill="#fafaf9" letter-spacing="-0.5">
          Authentic Ethiopian Menu
        </text>
        <text x="0" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="54" font-weight="900" fill="#f59e0b" letter-spacing="-0.5">
          Traditional Dishes &amp; Platters
        </text>
      </g>

      <g transform="translate(70, 390)">
        <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="500" fill="#d6d3d1">
          Special Kitfo • Siga &amp; Doro Wot • Sizzling Tibs • Vegan Beyaynetu • Buna Coffee
        </text>
        <text x="0" y="35" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="400" fill="#a8a29e">
          Browse our complete menu with debounced search, category filters, and fast delivery.
        </text>
      </g>

      <g transform="translate(70, 535)">
        <line x1="0" y1="0" x2="1060" y2="0" stroke="#292524" stroke-width="1.5"/>
        <text x="0" y="36" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#f59e0b">
          Fresh Daily • 12+ Traditional Specialties
        </text>
        <text x="1060" y="36" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#78716c" text-anchor="end">
          addis-eats-day-48-next-project.vercel.app/menu
        </text>
      </g>
    </svg>
  `);

  const finalBuffer = await sharp(bgBuffer)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  const menuOgPath = path.join('public', 'images', 'menu-og.jpg');
  fs.writeFileSync(menuOgPath, finalBuffer);
  console.log(`Generated ${menuOgPath} (${finalBuffer.length} bytes, 1200x630)`);
}

async function main() {
  await createOgImage();
  await createMenuOgImage();
}

main().catch(console.error);
