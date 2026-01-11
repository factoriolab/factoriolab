import fs from 'fs';
import path from 'path';
let sharp: any = null;
let getAverageColor: any = null;
try {
  // Lazy require dynamic to avoid failing on import-time if sharp not available
  sharp = require('sharp');
  getAverageColor = require('fast-average-color-node').getAverageColor;
} catch (err) {
  // Will handle missing binaries at runtime within packIcons
}

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
  const uiDir = path.join(srDataDir, 'UI');
  const map: Record<string, string> = {};
  if (!fs.existsSync(uiDir)) return map;

  function walk(dir: string) {
    const entries = fs.readdirSync(dir);
    for (const e of entries) {
      const full = path.join(dir, e);
      if (fs.statSync(full).isDirectory()) walk(full);
      else {
        const ext = path.extname(full).toLowerCase();
        if (ext === '.png' || ext === '.webp' || ext === '.jpg') {
          const base = path.basename(full, ext).toLowerCase();
          map[base] = full;
        }
      }
    }
  }

  walk(uiDir);
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
        const avg = await getAverageColor(toPack[i].buffer);
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
