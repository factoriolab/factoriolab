/**
 * Extract individual icons from a spritesheet based on data.json mappings.
 *
 * Usage: npx ts-node -r tsconfig-paths/register scripts/extract-icons.ts <mod-id>
 * Example: npx ts-node -r tsconfig-paths/register scripts/extract-icons.ts sfy
 */
import * as fs from 'fs';
import * as path from 'path';

import sharp from 'sharp';

const ICON_SIZE = 64;

interface IconData {
  id: string;
  position: string;
  color: string;
}

interface ModData {
  icons: IconData[];
}

async function extractIcons(modId: string): Promise<void> {
  const dataDir = path.join(__dirname, '..', 'src', 'data', modId);
  const dataPath = path.join(dataDir, 'data.json');
  const spritesheetPath = path.join(dataDir, 'icons.webp');
  const outputDir = path.join(dataDir, 'icons');

  // Validate inputs exist
  if (!fs.existsSync(dataPath)) {
    console.error(`Error: data.json not found at ${dataPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(spritesheetPath)) {
    console.error(`Error: icons.webp not found at ${spritesheetPath}`);
    process.exit(1);
  }

  // Load data.json
  const data: ModData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const icons = data.icons;

  if (!icons || icons.length === 0) {
    console.error('Error: No icons found in data.json');
    process.exit(1);
  }

  console.log(`Found ${icons.length} icons to extract`);

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Load spritesheet
  const spritesheet = sharp(spritesheetPath);
  const metadata = await spritesheet.metadata();
  console.log(`Spritesheet size: ${metadata.width}x${metadata.height}`);

  // Extract each icon
  let extracted = 0;
  for (const icon of icons) {
    const match = icon.position.match(/-(\d+)px -(\d+)px/);
    if (!match) {
      console.warn(`Warning: Invalid position format for ${icon.id}: ${icon.position}`);
      continue;
    }

    const x = parseInt(match[1], 10);
    const y = parseInt(match[2], 10);

    const outputPath = path.join(outputDir, `${icon.id}.png`);

    try {
      await sharp(spritesheetPath)
        .extract({ left: x, top: y, width: ICON_SIZE, height: ICON_SIZE })
        .png()
        .toFile(outputPath);
      extracted++;
    } catch (err) {
      console.error(`Error extracting ${icon.id}:`, err);
    }
  }

  console.log(`Successfully extracted ${extracted}/${icons.length} icons to ${outputDir}`);

  // Write a mapping file for reference
  const mappingPath = path.join(outputDir, '_mapping.json');
  const mapping = icons.map((icon) => ({
    id: icon.id,
    file: `${icon.id}.png`,
    color: icon.color,
  }));
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`Mapping written to ${mappingPath}`);
}

// Main
const modId = process.argv[2];
if (!modId) {
  console.error('Usage: npx ts-node -r tsconfig-paths/register scripts/extract-icons.ts <mod-id>');
  console.error('Example: npx ts-node -r tsconfig-paths/register scripts/extract-icons.ts sfy');
  process.exit(1);
}

extractIcons(modId).catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
