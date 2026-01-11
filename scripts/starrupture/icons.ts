import fs from 'fs';
import path from 'path';
import { getAverageColor } from 'fast-average-color-node';
import sharp from 'sharp';

export type IconEntry = {
  id: string;
  objectPath: string | null;
  src?: string | null; // resolved filesystem path
};

export type PackedIcon = {
  id: string;
  position: string; // '-{x}px -{y}px'
  color: string; // '#rrggbb'
};

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
          if (ext === '.png' || ext === '.webp' || ext === '.jpg' || ext === '.jpeg') {
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
  options?: { iconSize?: number; padding?: number; columns?: number; dryRun?: boolean },
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
    let srcPath: string | undefined;
    if (ic.objectPath) {
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

    const buffer = await sharp(srcPath)
      .resize({ width: iconSize, height: iconSize, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

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
        const svg = `<?xml version="1.0" encoding="UTF-8"?>\n` +
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
  const canvas = sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png();

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
        const avg = await getAverageColor(toPack[i].buffer, { mode: 'precision' });
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
      const outBuffer = await canvas.composite(composites).webp({ quality: 90 }).toBuffer();
      // Ensure output dir
      const dir = path.dirname(outImagePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(outImagePath, outBuffer);
    }
  }

  return results;
}
