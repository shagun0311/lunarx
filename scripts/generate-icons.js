import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Simple CRC32 implementation for PNG chunks
function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const toCheck = buf.subarray(4, 8 + len);
  const crcVal = crc32(toCheck);
  buf.writeUInt32BE(crcVal, 8 + len);
  return buf;
}

function createPNG(width, height, pixelFn) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw uncompressed scanlines: each row starts with filter byte 0 (None)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = pixelFn(x, y, width, height);
      rawData[pixelOffset] = Math.max(0, Math.min(255, Math.round(r)));
      rawData[pixelOffset + 1] = Math.max(0, Math.min(255, Math.round(g)));
      rawData[pixelOffset + 2] = Math.max(0, Math.min(255, Math.round(b)));
      rawData[pixelOffset + 3] = Math.max(0, Math.min(255, Math.round(a)));
    }
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// Draw LunarX Moon Icon
function renderLunarXIcon(x, y, width, height, isMaskable = false) {
  // Normalize coordinates (-1 to 1)
  const cx = width / 2;
  const cy = height / 2;
  const dx = (x - cx) / (width / 2);
  const dy = (y - cy) / (height / 2);
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background dark navy gradient
  const bgGrad = Math.sqrt(dx * dx + dy * dy) * 0.5;
  let r = 5 + bgGrad * 6;
  let g = 8 + bgGrad * 10;
  let b = 17 + bgGrad * 24;
  let a = 255;

  // Safe radius for maskable icons is 0.75, standard is 0.82
  const moonRadius = isMaskable ? 0.65 : 0.72;

  // Outer atmospheric blue/cyan glow
  if (dist > moonRadius && dist < moonRadius + 0.22) {
    const glowIntensity = Math.pow(1 - (dist - moonRadius) / 0.22, 2.5);
    r += 0 * glowIntensity;
    g += 229 * glowIntensity * 0.35;
    b += 255 * glowIntensity * 0.6;
  }

  // Moon surface
  if (dist <= moonRadius) {
    // 3D sphere spherical normal calculation
    const z = Math.sqrt(Math.max(0, 1 - Math.pow(dist / moonRadius, 2)));
    
    // Light coming from top-left-front: Sun vector
    const sunX = -0.55;
    const sunY = -0.55;
    const sunZ = 0.62;
    const normDist = dist / moonRadius;
    const nx = dx / moonRadius;
    const ny = dy / moonRadius;
    const nz = z;

    // Diffuse Lambertian lighting
    const dot = Math.max(0, nx * sunX + ny * sunY + nz * sunZ);

    // Subtle craters procedural calculation
    const crater1 = Math.sqrt(Math.pow(nx - 0.2, 2) + Math.pow(ny + 0.15, 2));
    const crater2 = Math.sqrt(Math.pow(nx + 0.3, 2) + Math.pow(ny - 0.25, 2));
    const crater3 = Math.sqrt(Math.pow(nx - 0.1, 2) + Math.pow(ny - 0.35, 2));
    const crater4 = Math.sqrt(Math.pow(nx + 0.15, 2) + Math.pow(ny + 0.35, 2));

    let craterDepression = 1.0;
    if (crater1 < 0.28) {
      craterDepression -= (0.28 - crater1) * 0.8 * (1 + Math.sin(crater1 * 25) * 0.3);
    }
    if (crater2 < 0.22) {
      craterDepression -= (0.22 - crater2) * 0.9;
    }
    if (crater3 < 0.18) {
      craterDepression -= (0.18 - crater3) * 0.7;
    }
    if (crater4 < 0.14) {
      craterDepression -= (0.14 - crater4) * 0.6;
    }

    // Mare (dark lunar plains)
    const mariaNoise = Math.sin(nx * 4 + ny * 3) * Math.cos(nx * 3 - ny * 5);
    const mareFactor = mariaNoise > 0.2 ? 0.78 : 1.0;

    // Base pearl / silver lunar surface color
    const baseColor = 195 * craterDepression * mareFactor;
    
    // Ambient lunar earthshine
    const ambient = 0.18;
    const light = ambient + dot * 0.82;

    // Edge anti-aliasing
    const edgeDist = moonRadius - dist;
    const aaThreshold = 2.0 / (width / 2);
    const edgeAlpha = edgeDist < aaThreshold ? Math.max(0, edgeDist / aaThreshold) : 1.0;

    // Cyan rim specular accent
    const rimGlow = Math.pow(dist / moonRadius, 3.5) * 0.35;

    const moonR = baseColor * light * 0.88;
    const moonG = (baseColor * light * 0.94) + (rimGlow * 180);
    const moonB = (baseColor * light * 1.02) + (rimGlow * 255);

    r = r * (1 - edgeAlpha) + moonR * edgeAlpha;
    g = g * (1 - edgeAlpha) + moonG * edgeAlpha;
    b = b * (1 - edgeAlpha) + moonB * edgeAlpha;

    // Orbital reticle / mission ring
    const ringDist = Math.abs(dist - moonRadius * 0.88);
    if (ringDist < 0.015 && (Math.atan2(dy, dx) > 0.3 && Math.atan2(dy, dx) < 2.5)) {
      const ringAlpha = Math.max(0, 1 - ringDist / 0.015) * 0.8;
      r = r * (1 - ringAlpha) + 0 * ringAlpha;
      g = g * (1 - ringAlpha) + 229 * ringAlpha;
      b = b * (1 - ringAlpha) + 255 * ringAlpha;
    }
  }

  // Thin outer cyan targeting ring arc
  const outerArcRadius = isMaskable ? 0.88 : 0.94;
  const outerArcDist = Math.abs(dist - outerArcRadius);
  if (outerArcDist < 0.018) {
    const angle = Math.atan2(dy, dx);
    // Draw 3 dash segments: [0.2 to 1.3], [2.1 to 3.2], [-2.5 to -1.4]
    const inSegment = 
      (angle > 0.2 && angle < 1.3) ||
      (angle > 2.0 && angle < 3.0) ||
      (angle > -2.6 && angle < -1.5);

    if (inSegment) {
      const ringAlpha = Math.max(0, 1 - outerArcDist / 0.018) * 0.85;
      r = r * (1 - ringAlpha) + 0 * ringAlpha;
      g = g * (1 - ringAlpha) + 229 * ringAlpha;
      b = b * (1 - ringAlpha) + 255 * ringAlpha;
    }
  }

  return [r, g, b, a];
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA icons in /public...');

// 1. 192x192 PNG
const png192 = createPNG(192, 192, (x, y, w, h) => renderLunarXIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
console.log('Generated pwa-192x192.png');

// 2. 512x512 PNG
const png512 = createPNG(512, 512, (x, y, w, h) => renderLunarXIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
console.log('Generated pwa-512x512.png');

// 3. 512x512 Maskable PNG (with 15% safe margin)
const pngMaskable512 = createPNG(512, 512, (x, y, w, h) => renderLunarXIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable512);
console.log('Generated pwa-maskable-512x512.png');

// 4. 180x180 Apple Touch Icon PNG
const appleTouch180 = createPNG(180, 180, (x, y, w, h) => renderLunarXIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch180);
console.log('Generated apple-touch-icon.png');

console.log('All icons generated successfully!');
