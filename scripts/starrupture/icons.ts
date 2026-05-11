import { getAverageColor } from 'fast-average-color-node';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export interface IconEntry {
  id: string;
  objectPath?: string | null; // optional objectPath for resolution
  src?: string | null; // resolved filesystem path
  srcBuffer?: Buffer | null; // optional in-memory PNG buffer to use directly
}

export interface PackedIcon {
  id: string;
  position: string; // '-{x}px -{y}px'
  color: string; // '#rrggbb'
}

export interface ZoomOptions {
  size?: number;
  capStartPct?: number;
  capEndPct?: number;
  centreSizePctX?: number;
  centreOffsetPctX?: number;
  railPctY?: number;
  rightCapIsFlippedLeft?: boolean;
  debugOutDir?: string;
}

function slugify(s: string): string {
  return s
    .replace(/([A-Z])/g, (m) => '-' + m.toLowerCase())
    .replace(/^-/, '')
    .replace(/_+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

export function indexUiIcons(srDataDir: string): Record<string, string> {
  // Scan the whole sr-data tree for image files (not only UI) to capture textures placed under other folders (e.g., Weapons/AmmoTypes)
  const map: Record<string, string> = {};
  if (!fs.existsSync(srDataDir)) return map;

  function walk(dir: string) {
    const entries = fs.readdirSync(dir);
    for (const e of entries) {
      const full = path.join(dir, e);
      try {
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          walk(full);
        } else if (stat.isFile()) {
          const ext = path.extname(full).toLowerCase();
          if (
            ext === '.png' ||
            ext === '.webp' ||
            ext === '.jpg' ||
            ext === '.jpeg'
          ) {
            const base = path.basename(full, ext).toLowerCase();
            if (!map[base]) map[base] = full;
          }
        }
      } catch (err) {
        // ignore permission/other errors
      }
    }
  }

  walk(srDataDir);
  return map;
}

export async function packIcons(
  srDataDir: string,
  outImagePath: string,
  icons: IconEntry[],
  options?: {
    iconSize?: number;
    padding?: number;
    columns?: number;
    dryRun?: boolean;
  },
): Promise<PackedIcon[]> {
  const iconSize = options?.iconSize ?? 64;
  const padding = options?.padding ?? 2;
  const columns = options?.columns ?? 8;
  const dryRun = options?.dryRun ?? false;

  // Index UI icons
  const index = indexUiIcons(srDataDir);

  const toPack: { id: string; buffer: Buffer }[] = [];
  const notFound: string[] = [];

  for (const ic of icons) {
    let buffer: Buffer | undefined;

    // If caller provided an in-memory buffer, use it directly
    if (ic.srcBuffer) {
      buffer = ic.srcBuffer;
    } else {
      let srcPath: string | undefined;
      // Prefer an explicit src (generated file path) when provided
      if (ic.src) {
        srcPath = ic.src;
      } else if (ic.objectPath) {
        // objectPath like /Game/Chimera/UI/ItemIcons/T_SulphurOre_Icon
        const parts = ic.objectPath.replace('/Game/Chimera/UI/', '').split('/');
        const basename = parts.pop() ?? '';
        const key = basename.toLowerCase();
        srcPath = index[key];
      }

      // fallback: try id
      if (!srcPath) {
        const key = ic.id.toLowerCase();
        srcPath = index[key];
      }

      if (!srcPath || !fs.existsSync(srcPath)) {
        notFound.push(ic.id + (ic.objectPath ? `(${ic.objectPath})` : ''));
        continue;
      }

      buffer = await sharp(srcPath)
        .resize({
          width: iconSize,
          height: iconSize,
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();
    }

    if (!buffer) {
      notFound.push(ic.id + (ic.objectPath ? `(${ic.objectPath})` : ''));
      continue;
    }

    toPack.push({ id: ic.id, buffer });
  }

  if (notFound.length > 0) {
    console.warn('Missing icons for:', notFound.slice(0, 20).join(', '));
  }

  // Ensure there is always a "missing-icon" placeholder as the first tile (transparent)
  if (!toPack.some((t) => t.id === 'missing-icon')) {
    try {
      if (sharp) {
        // Render a styled SVG placeholder (dark gray plate with bold red question mark), no extra deps
        const plateColor = '#2f2f2f'; // dark gray
        const qmColor = '#ff3b30'; // red question mark
        const fontSize = Math.floor(iconSize * 0.65);
        const rx = Math.floor(iconSize * 0.12);
        const pad = Math.max(2, Math.floor(iconSize * 0.06));
        // Centered rounded plate with transparent outer background and bold question mark with subtle outline
        const strokeWidth = Math.max(1, Math.floor(iconSize * 0.04));
        const svg =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 ${iconSize} ${iconSize}">` +
          `<rect x="${pad}" y="${pad}" width="${iconSize - pad * 2}" height="${iconSize - pad * 2}" rx="${rx}" fill="${plateColor}"/>` +
          // shift the question mark down by half its font height so it doesn't touch the top
          `<text x="50%" y="50%" dy="${Math.floor(fontSize * 0.3)}" font-family="sans-serif" font-size="${fontSize}" fill="${qmColor}" font-weight="800" text-anchor="middle" dominant-baseline="middle" stroke="rgba(0,0,0,0.5)" stroke-width="${strokeWidth}">?</text>` +
          `</svg>`;
        const placeholder = await sharp(Buffer.from(svg)).png().toBuffer();
        toPack.unshift({ id: 'missing-icon', buffer: placeholder });
      } else {
        toPack.unshift({ id: 'missing-icon', buffer: Buffer.alloc(0) });
      }
    } catch (e) {
      // ignore; we will still include a placeholder id in metadata
      toPack.unshift({ id: 'missing-icon', buffer: Buffer.alloc(0) });
    }
  }

  const count = toPack.length;
  const rows = Math.ceil(count / columns);
  const width = columns * iconSize + (columns + 1) * padding;
  const height = rows * iconSize + (rows + 1) * padding;

  // Start with transparent canvas
  const canvas = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).png();

  const composites: any[] = [];
  const results: PackedIcon[] = [];

  const sharpAvailable = !!sharp;
  const avgAvailable = !!getAverageColor;

  for (let i = 0; i < toPack.length; i++) {
    const row = Math.floor(i / columns);
    const col = i % columns;
    const x = padding + col * (iconSize + padding);
    const y = padding + row * (iconSize + padding);

    if (sharpAvailable) {
      composites.push({ input: toPack[i].buffer, left: x, top: y });
    }

    // Compute average color if available
    let hex = '#000000';
    if (avgAvailable) {
      try {
        const avg = await getAverageColor(toPack[i].buffer, {
          mode: 'precision',
        });
        hex = avg?.hex ?? '#000000';
      } catch (e) {
        // ignore
      }
    }

    results.push({ id: toPack[i].id, position: `-${x}px -${y}px`, color: hex });
  }

  if (!dryRun) {
    if (!sharpAvailable) {
      console.warn('sharp not available; skipping spritesheet generation.');
    } else {
      const outBuffer = await canvas
        .composite(composites)
        .webp({ quality: 90 })
        .toBuffer();
      // Ensure output dir
      const dir = path.dirname(outImagePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(outImagePath, outBuffer);
    }
  }

  return results;
}

export async function generatePurityVariants(
  basePath: string,
  baseId: string,
  options?: { size?: number },
) {
  const size = options?.size ?? 64;
  const pad = Math.max(2, Math.floor(size * 0.06));
  const fontSize = Math.floor(size * 0.26);
  const spacing = Math.max(1, Math.floor(fontSize * 0.08));
  const strokeWidth = Math.max(1, Math.floor(size * 0.03));
  const fill = '#ffd24a';
  const stroke = 'rgba(0,0,0,0.45)';

  function makeStarsSvg(starCount: number) {
    let texts = '';
    for (let i = 0; i < starCount; i++) {
      const x = size - pad - i * (fontSize + spacing);
      const y = size - pad - Math.max(0, Math.floor(fontSize * 0.05));
      texts += `<text x="${x}" y="${y}" font-family="sans-serif" font-size="${fontSize}" fill="${fill}" font-weight="700" text-anchor="end" dominant-baseline="text-after-edge" stroke="${stroke}" stroke-width="${strokeWidth}">★</text>`;
    }
    const svg =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
      `<g>${texts}</g>` +
      `</svg>`;
    return Buffer.from(svg);
  }

  const variantList = [
    { id: `${baseId}-impure`, stars: 1 },
    { id: baseId, stars: 2 },
    { id: `${baseId}-pure`, stars: 3 },
  ];

  const entries: IconEntry[] = [];
  for (const v of variantList) {
    const overlay = makeStarsSvg(v.stars);
    const buf = await sharp(basePath)
      .resize({
        width: size,
        height: size,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .composite([{ input: overlay, left: 0, top: 0 }])
      .png()
      .toBuffer();
    entries.push({ id: v.id, srcBuffer: buf });
  }
  return entries;
}

export async function generateCargoIcon(
  basePath: string,
  id: string,
  crop: {
    leftPct: number;
    rightPct: number;
    topPct: number;
    bottomPct: number;
  },
  options?: { size?: number; label?: string },
): Promise<IconEntry> {
  const size = options?.size ?? 64;
  const leftPct = crop.leftPct ?? 0;
  const rightPct = crop.rightPct ?? 0;
  const topPct = crop.topPct ?? 0;
  const bottomPct = crop.bottomPct ?? 0;

  const meta = await sharp(basePath).metadata();
  const w = meta.width ?? size;
  const h = meta.height ?? size;

  const left = Math.round(w * leftPct);
  const top = Math.round(h * topPct);
  const width = Math.max(1, Math.round(w * (1 - leftPct - rightPct)));
  const height = Math.max(1, Math.round(h * (1 - topPct - bottomPct)));

  let extractedBuf: Buffer;
  try {
    extractedBuf = await sharp(basePath)
      .extract({
        left: Math.max(0, left),
        top: Math.max(0, top),
        width,
        height,
      })
      .png()
      .toBuffer();
  } catch (e) {
    // fallback: resize whole image if extract failed
    extractedBuf = await sharp(basePath).png().toBuffer();
  }

  // Resize extracted region to fit height=size and keep aspect ratio so it will align left when composited
  const resized = await sharp(extractedBuf)
    .resize({
      height: size,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).png();
  const comps: any[] = [{ input: resized, left: 0, top: 0 }];

  if (options?.label) {
    const pad = Math.max(2, Math.floor(size * 0.06));
    const fontSize = Math.floor(size * 0.28);
    const strokeWidth = Math.max(1, Math.floor(size * 0.03));
    const fill = '#ffffff';
    const stroke = 'rgba(0,0,0,0.6)';
    const svg =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
      `<text x="${size - pad}" y="${Math.floor(size / 2)}" font-family="sans-serif" font-size="${fontSize}" fill="${fill}" font-weight="700" text-anchor="end" dominant-baseline="middle" stroke="${stroke}" stroke-width="${strokeWidth}">${options.label}</text>` +
      `</svg>`;
    comps.push({ input: Buffer.from(svg), left: 0, top: 0 });
  }

  const outBuf = await canvas.composite(comps).png().toBuffer();
  return { id, srcBuffer: outBuf };
}

/**
 * Generate a zoomed rail icon by taking left cap, center band, right cap from a larger
 * source image and recomposing them into a square icon for better legibility of
 * the center arrows. Writes debug images to `debugOutDir` when provided.
 */
export async function generateRailZoom(
  basePath: string,
  baseId: string,
  options?: ZoomOptions,
): Promise<IconEntry> {
  const size = options?.size ?? 64;
  const capStartPct = options?.capStartPct ?? 0.1;
  const capEndPct = options?.capEndPct ?? 0.18;
  const centreSizePctX = options?.centreSizePctX ?? 0.25;
  const centreOffsetPctX = options?.centreOffsetPctX ?? 0.0;
  const railPctY = options?.railPctY ?? 0.5;
  const rightCapIsFlippedLeft = options?.rightCapIsFlippedLeft ?? false;
  const debugOutDir = options?.debugOutDir;

  // Read metadata
  const meta = await sharp(basePath).metadata();
  const w = meta.width ?? size;
  const h = meta.height ?? size;
  if (w != h) {
    console.error(
      `Error: rail icon source ${basePath} is not square (${w}x${h})`,
    );
    return { id: baseId, srcBuffer: Buffer.alloc(0) };
  }

  // Isolate the center section from the original
  const centreW = Math.round(w * centreSizePctX);
  const centreX = Math.round((w - centreW) / 2 + w * centreOffsetPctX);
  const railH = Math.round(h * railPctY);
  const railY = Math.round((h - railH) / 2);
  const centerBuf = await sharp(basePath)
    .extract({ left: centreX, top: railY, width: centreW, height: railH })
    .png()
    .toBuffer();

  // Isolate left and right end caps from the original
  const capW = Math.round(w * (capEndPct - capStartPct));
  const capX = Math.round(w * capStartPct);
  const leftCapBuf = await sharp(basePath)
    .extract({ left: capX, top: railY, width: capW, height: railH })
    .png()
    .toBuffer();
  const rightCapBuf = rightCapIsFlippedLeft // if true, flip left cap horizontally for right cap
    ? await sharp(leftCapBuf).flop().png().toBuffer()
    : await sharp(basePath)
        .extract({
          left: w - capX - capW,
          top: railY,
          width: capW,
          height: railH,
        })
        .png()
        .toBuffer();

  // Calculate the output size of parts
  const inputPctW = (capEndPct - capStartPct) * 2 + centreSizePctX;
  const partZoom = 1 / inputPctW;
  const outerZoom = size / w;
  const totalZoom = partZoom * outerZoom;
  const outCapW = Math.round(capW * totalZoom);
  const outCenterW = Math.round(centreW * totalZoom);
  const outRailH = Math.round(railH * totalZoom);
  const outRailY = Math.round((size - outRailH) / 2);

  // Resize caps and center to target heights/widths
  const leftResized = await sharp(leftCapBuf)
    .resize({ width: outCapW, height: outRailH })
    .png()
    .toBuffer();
  const centerResized = await sharp(centerBuf)
    .resize({ width: outCenterW, height: outRailH })
    .png()
    .toBuffer();
  const rightResized = await sharp(rightCapBuf)
    .resize({ width: outCapW, height: outRailH })
    .png()
    .toBuffer();

  // Composite onto transparent canvas
  const canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).png();
  const comps = [
    { input: leftResized, left: 0, top: outRailY },
    { input: rightResized, left: size - outCapW, top: outRailY },
    { input: centerResized, left: outCapW, top: outRailY },
  ];

  const outBuf = await canvas.composite(comps).png().toBuffer();

  // Write debug files if requested
  if (debugOutDir) {
    try {
      fs.mkdirSync(debugOutDir, { recursive: true });
      // original resized for comparison
      await sharp(basePath)
        .resize({
          width: size,
          height: size,
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(path.join(debugOutDir, `${baseId}-orig.png`));
      // zoomed output
      await sharp(outBuf)
        .png()
        .toFile(path.join(debugOutDir, `${baseId}-zoom.png`));
    } catch (e) {
      // ignore debug write failures
    }
  }

  return { id: baseId, srcBuffer: outBuf };
}
