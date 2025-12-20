/**
 * Build a spritesheet from individual icons and update data.json.
 *
 * Usage: npx ts-node -r tsconfig-paths/register scripts/build-icons.ts <mod-id>
 * Example: npx ts-node -r tsconfig-paths/register scripts/build-icons.ts sfy
 *
 * Expects icons to be in src/data/<mod-id>/icons/ as PNG files.
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

interface SpritesmithCoordinates {
  [key: string]: { x: number; y: number; width: number; height: number };
}

interface SpritesmithResult {
  image: Buffer;
  coordinates: SpritesmithCoordinates;
  properties: { width: number; height: number };
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
  const dataDir = path.join(__dirname, '..', 'src', 'data', modId);
  const dataPath = path.join(dataDir, 'data.json');
  const iconsDir = path.join(dataDir, 'icons');
  const outputPath = path.join(dataDir, 'icons.webp');

  // Validate inputs exist
  if (!fs.existsSync(dataPath)) {
    console.error(`Error: data.json not found at ${dataPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(iconsDir)) {
    console.error(`Error: icons directory not found at ${iconsDir}`);
    process.exit(1);
  }

  // Get list of icon files (excluding _mapping.json)
  const iconFiles = fs
    .readdirSync(iconsDir)
    .filter((f) => f.endsWith('.png'))
    .sort();

  if (iconFiles.length === 0) {
    console.error('Error: No PNG files found in icons directory');
    process.exit(1);
  }

  console.log(`Found ${iconFiles.length} icons to process`);

  // Build list of source images with full paths
  const srcImages = iconFiles.map((f) => path.join(iconsDir, f));

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

  for (const iconFile of iconFiles) {
    const id = iconFile.replace('.png', '');
    const fullPath = path.join(iconsDir, iconFile);
    const coords = result.coordinates[fullPath];

    if (!coords) {
      console.warn(`Warning: No coordinates found for ${iconFile}`);
      continue;
    }

    const position = `-${coords.x}px -${coords.y}px`;
    const color = await calculateAverageColor(fullPath);

    icons.push({ id, position, color });
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
