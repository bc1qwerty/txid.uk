import sharp from 'sharp';
import opentype from 'opentype.js';
import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const staticDir = join(__dirname, '..', 'static');

// Load Space Mono Bold
const font = opentype.loadSync(join(__dirname, 'fonts', 'SpaceMono-Bold.ttf'));

// Measure "TXID" to fit inside the square
const text = 'TXID';
const viewBox = 64;
const padding = 5;
const available = viewBox - padding * 2;

// Get the path at a large size first to measure
const testSize = 100;
const testPath = font.getPath(text, 0, 0, testSize);
const bb = testPath.getBoundingBox();
const textW = bb.x2 - bb.x1;
const textH = bb.y2 - bb.y1;

// Scale to fit the available area
const scale = Math.min(available / textW, available / textH);
const fontSize = testSize * scale;

// Re-generate at the correct font size
const path = font.getPath(text, 0, 0, fontSize);
const b = path.getBoundingBox();
const w = b.x2 - b.x1;
const h = b.y2 - b.y1;

// Center in viewBox
const offsetX = (viewBox - w) / 2 - b.x1;
const offsetY = (viewBox - h) / 2 - b.y1;

const pathData = font.getPath(text, offsetX, offsetY, fontSize).toPathData(2);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBox} ${viewBox}">
  <rect width="${viewBox}" height="${viewBox}" rx="14" fill="#09090b"/>
  <path d="${pathData}" fill="#f7931a"/>
</svg>`;

// Write SVG
const svgPath = join(staticDir, 'favicon.svg');
writeFileSync(svgPath, svg);
console.log('  favicon.svg');

// Generate PNGs
const sizes = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'mstile-144x144.png': 144,
};

const svgBuf = readFileSync(svgPath);
for (const [name, size] of Object.entries(sizes)) {
  await sharp(svgBuf).resize(size, size).png().toFile(join(staticDir, name));
  console.log(`  ${name} (${size}x${size})`);
}
console.log('Done!');
