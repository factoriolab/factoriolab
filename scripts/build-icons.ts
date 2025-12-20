/**
 * Build a spritesheet from individual icons and update data.json.
 *
 * Usage: npx ts-node -r tsconfig-paths/register scripts/build-icons.ts <mod-id>
 * Example: npx ts-node -r tsconfig-paths/register scripts/build-icons.ts sfy
 *
 * Expects icons to be in src/data/<mod-id>/icons/ as PNG files.
 * If a config.json exists with "extends", icons from extended mods are also included.
 * Will generate icons.webp and update the icons array in data.json.
 */
import * as fs from 'fs';
import * as path from 'path';

import sharp from 'sharp';
import Spritesmith from 'spritesmith';

const ICON_SIZE = 64;

interface IconData {
  id: string;
  position: string;
  color: string;
}

interface ModData {
  icons: IconData[];
  [key: string]: unknown;
}

interface ModConfig {
  extends?: string[];
  [key: string]: unknown;
}

interface SpritesmithCoordinates {
  [key: string]: { x: number; y: number; width: number; height: number };
}

interface SpritesmithResult {
  image: Buffer;
  coordinates: SpritesmithCoordinates;
  properties: { width: number; height: number };
}

function getDataDir(modId: string): string {
  return path.join(__dirname, '..', 'src', 'data', modId);
}

function loadConfig(modId: string): ModConfig | null {
  const configPath = path.join(getDataDir(modId), 'config.json');
  if (!fs.existsSync(configPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

/**
 * Collect all icon files from a mod and its extended mods.
 * Returns a map of icon id -> full file path.
 * Icons from the current mod take priority over extended mods.
 */
function collectIconFiles(modId: string): Map<string, string> {
  const iconMap = new Map<string, string>();
  const config = loadConfig(modId);

  // First, collect icons from extended mods (in order, so later mods override earlier)
  if (config?.extends) {
    for (const baseModId of config.extends) {
      const baseIconsDir = path.join(getDataDir(baseModId), 'icons');
      if (fs.existsSync(baseIconsDir)) {
        const iconFiles = fs.readdirSync(baseIconsDir).filter((f) => f.endsWith('.png'));
        for (const iconFile of iconFiles) {
          const iconId = iconFile.replace('.png', '');
          iconMap.set(iconId, path.join(baseIconsDir, iconFile));
        }
        console.log(`  From ${baseModId}: ${iconFiles.length} icons`);
      } else {
        console.warn(`  Warning: No icons/ folder for ${baseModId}. Run 'npm run extract-icons ${baseModId}' first.`);
      }
    }
  }

  // Then, collect icons from the current mod (these override extended mod icons)
  const modIconsDir = path.join(getDataDir(modId), 'icons');
  if (fs.existsSync(modIconsDir)) {
    const iconFiles = fs.readdirSync(modIconsDir).filter((f) => f.endsWith('.png'));
    let overrideCount = 0;
    for (const iconFile of iconFiles) {
      const iconId = iconFile.replace('.png', '');
      if (iconMap.has(iconId)) {
        overrideCount++;
      }
      iconMap.set(iconId, path.join(modIconsDir, iconFile));
    }
    console.log(`  From ${modId}: ${iconFiles.length} icons (${overrideCount} overrides)`);
  }

  return iconMap;
}

/**
 * Calculate the average color of an image for the icon color property.
 */
async function calculateAverageColor(imagePath: string): Promise<string> {
  const { data, info } = await sharp(imagePath)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  let r = 0,
    g = 0,
    b = 0,
    count = 0;

  // Sample pixels, skipping transparent ones
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha > 128) {
      // Only count non-transparent pixels
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
  }

  if (count === 0) {
    return '#000000';
  }

  r = Math.round(r / count);
  g = Math.round(g / count);
  b = Math.round(b / count);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

async function buildSpritesheet(modId: string): Promise<void> {
  const dataDir = getDataDir(modId);
  const dataPath = path.join(dataDir, 'data.json');
  const outputPath = path.join(dataDir, 'icons.webp');

  // Validate data.json exists
  if (!fs.existsSync(dataPath)) {
    console.error(`Error: data.json not found at ${dataPath}`);
    process.exit(1);
  }

  // Collect icons from this mod and extended mods
  console.log('Collecting icons:');
  const iconMap = collectIconFiles(modId);

  if (iconMap.size === 0) {
    console.error('Error: No icons found');
    process.exit(1);
  }

  // Sort icon IDs and build source image list
  const sortedIconIds = Array.from(iconMap.keys()).sort();
  const srcImages = sortedIconIds.map((id) => iconMap.get(id)!);

  console.log(`\nTotal: ${iconMap.size} icons to process`);

  // Run spritesmith
  const result = await new Promise<SpritesmithResult>((resolve, reject) => {
    Spritesmith.run(
      {
        src: srcImages,
        algorithm: 'binary-tree',
        algorithmOpts: { sort: false },
        padding: 0,
        exportOpts: {
          format: 'png',
        },
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result as SpritesmithResult);
      },
    );
  });

  console.log(
    `Spritesheet generated: ${result.properties.width}x${result.properties.height}`,
  );

  // Convert to webp and save
  await sharp(result.image).webp({ quality: 90 }).toFile(outputPath);
  console.log(`Saved to ${outputPath}`);

  // Build new icons array with positions and colors
  const icons: IconData[] = [];

  for (const iconId of sortedIconIds) {
    const fullPath = iconMap.get(iconId)!;
    const coords = result.coordinates[fullPath];

    if (!coords) {
      console.warn(`Warning: No coordinates found for ${iconId}`);
      continue;
    }

    const position = `-${coords.x}px -${coords.y}px`;
    const color = await calculateAverageColor(fullPath);

    icons.push({ id: iconId, position, color });
  }

  // Update data.json
  const data: ModData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  data.icons = icons;

  // Write back (minified to match existing format)
  fs.writeFileSync(dataPath, JSON.stringify(data));
  console.log(`Updated ${dataPath} with ${icons.length} icons`);
}

// Main
const modId = process.argv[2];
if (!modId) {
  console.error(
    'Usage: npx ts-node -r tsconfig-paths/register scripts/build-icons.ts <mod-id>',
  );
  console.error(
    'Example: npx ts-node -r tsconfig-paths/register scripts/build-icons.ts sfy',
  );
  process.exit(1);
}

buildSpritesheet(modId).catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
