import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public', 'images');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Debloom Homepage OG Card (1200 x 630)
const homeCardSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E2016"/>
      <stop offset="50%" stop-color="#163323"/>
      <stop offset="100%" stop-color="#1B3B2B"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8FA89B"/>
      <stop offset="100%" stop-color="#C49B4B"/>
    </linearGradient>
  </defs>

  <!-- Deep Botanical Forest Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>

  <!-- Subtle organic decorative frames -->
  <rect x="36" y="36" width="1128" height="558" rx="24" fill="none" stroke="#27523D" stroke-width="2" stroke-opacity="0.8"/>
  <rect x="48" y="48" width="1104" height="534" rx="16" fill="none" stroke="#8FA89B" stroke-width="1" stroke-opacity="0.2"/>

  <!-- Sprout Badge in Top Left -->
  <g transform="translate(100, 110)">
    <circle cx="36" cy="36" r="36" fill="#27523D" stroke="#8FA89B" stroke-width="2"/>
    <!-- Clean Sprout Graphic -->
    <path d="M36 48 V26 M36 26 C28 20 22 28 36 26 C44 20 50 28 36 26" stroke="#FCFBF7" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="28" cy="22" r="3" fill="#C49B4B"/>
    <circle cx="44" cy="22" r="3" fill="#8FA89B"/>
    
    <text x="90" y="44" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="800" fill="#FCFBF7" letter-spacing="4">DEBLOOM</text>
    <text x="325" y="44" font-family="system-ui, -apple-system, sans-serif" font-size="30" fill="#8FA89B">🌱</text>
  </g>

  <!-- Main Headline Tagline -->
  <text x="100" y="270" font-family="Georgia, serif" font-size="56" font-weight="700" fill="#FCFBF7" letter-spacing="-0.5">
    Start where you are.
  </text>
  <text x="100" y="340" font-family="Georgia, serif" font-size="56" font-weight="700" fill="#8FA89B" letter-spacing="-0.5">
    Bloom from there.
  </text>

  <!-- Core Pillars -->
  <g transform="translate(100, 420)">
    <rect x="0" y="0" width="760" height="52" rx="12" fill="#12281B" stroke="#27523D" stroke-width="1.5"/>
    <text x="30" y="33" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#DCE7E1">
      Skills  •  Opportunities  •  Resources  •  Ideas
    </text>
  </g>

  <!-- Subtitle & Brand Roots -->
  <text x="100" y="525" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="500" fill="#8FA89B">
    Student platform  •  Nigerian roots. Global usefulness.  •  debloom.org
  </text>
</svg>
`;

// 2. Debloom Opportunity Fallback Card (1200 x 630)
const oppCardSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E2016"/>
      <stop offset="50%" stop-color="#163323"/>
      <stop offset="100%" stop-color="#1B3B2B"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bgGrad2)"/>
  <rect x="36" y="36" width="1128" height="558" rx="24" fill="none" stroke="#27523D" stroke-width="2" stroke-opacity="0.8"/>

  <g transform="translate(100, 110)">
    <circle cx="36" cy="36" r="36" fill="#27523D" stroke="#C49B4B" stroke-width="2"/>
    <text x="24" y="45" font-family="system-ui, -apple-system, sans-serif" font-size="30" fill="#FCFBF7">🎓</text>
    <text x="90" y="44" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="800" fill="#FCFBF7" letter-spacing="4">DEBLOOM</text>
    <text x="325" y="44" font-family="system-ui, -apple-system, sans-serif" font-size="30" fill="#8FA89B">🌱</text>
  </g>

  <text x="100" y="270" font-family="Georgia, serif" font-size="52" font-weight="700" fill="#FCFBF7">
    Verified Student Opportunities
  </text>
  <text x="100" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="500" fill="#8FA89B">
    Scholarships  •  Fellowships  •  Programs  •  Competitions
  </text>

  <g transform="translate(100, 410)">
    <rect x="0" y="0" width="820" height="52" rx="12" fill="#12281B" stroke="#27523D" stroke-width="1.5"/>
    <text x="30" y="33" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#C49B4B">
      ✓ Manually verified with official source links  •  Zero scams  •  Free to find
    </text>
  </g>

  <text x="100" y="525" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="500" fill="#8FA89B">
    Debloom Student Platform  •  Start where you are. Bloom from there.  •  debloom.org
  </text>
</svg>
`;

// 3. Debloom Favicon SVG (64 x 64 & 192 x 192)
const faviconSvg = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="30" fill="#163323" stroke="#8FA89B" stroke-width="2"/>
  <path d="M32 46 V22 M32 22 C24 16 17 24 32 22 C39 16 47 24 32 22" stroke="#FCFBF7" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="23" cy="18" r="3" fill="#C49B4B"/>
  <circle cx="41" cy="18" r="3" fill="#8FA89B"/>
</svg>
`;

async function run() {
  // Generate Home Social Card PNG
  await sharp(Buffer.from(homeCardSvg))
    .png({ quality: 95 })
    .toFile(path.join(outDir, 'debloom-social-card.png'));
  console.log('✅ Generated debloom-social-card.png');

  // Generate Opportunity Fallback Card PNG
  await sharp(Buffer.from(oppCardSvg))
    .png({ quality: 95 })
    .toFile(path.join(outDir, 'debloom-opportunity-card.png'));
  console.log('✅ Generated debloom-opportunity-card.png');

  // Save Favicon SVG
  fs.writeFileSync(path.resolve('public', 'favicon.svg'), faviconSvg.trim(), 'utf-8');
  console.log('✅ Generated public/favicon.svg');

  // Generate Favicon PNG (32x32 and 192x192)
  await sharp(Buffer.from(faviconSvg))
    .resize(32, 32)
    .png()
    .toFile(path.resolve('public', 'favicon.png'));

  await sharp(Buffer.from(faviconSvg))
    .resize(192, 192)
    .png()
    .toFile(path.resolve('public', 'apple-touch-icon.png'));
  console.log('✅ Generated favicon.png and apple-touch-icon.png');
}

run().catch(console.error);
