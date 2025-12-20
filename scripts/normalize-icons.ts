/**
 * Normalize all icons in an icons folder to 64x64 pixels.
 *
 * Usage: npx ts-node -r tsconfig-paths/register scripts/normalize-icons.ts <mod-id>
 * Example: npx ts-node -r tsconfig-paths/register scripts/normalize-icons.ts sfyf
 *
 * Icons that are too large or too small will be resized to fit within 64x64,
 * preserving aspect ratio and centering on a transparent background.
 */
import * as fs from 'fs';
import * as path from 'path';

import sharp from 'sharp';

const ICON_SIZE = 64;

async function normalizeIcon(iconPath: string): Promise<boolean> {
  const metadata = await sharp(iconPath).metadata();
  const { width, height } = metadata;

  if (!width || !height) {
    console.warn(`  Warning: Could not read dimensions for ${path.basename(iconPath)}`);
    return false;
  }

  if (width === ICON_SIZE && height === ICON_SIZE) {
    return false; // Already correct size
  }

  console.log(`  Resizing ${path.basename(iconPath)}: ${width}x${height} -> ${ICON_SIZE}x${ICON_SIZE}`);

  // Resize the icon to fit within 64x64, preserving aspect ratio
  // Then extend to exactly 64x64 with transparent background, centering the image
  const resized = await sharp(iconPath)
    .resize(ICON_SIZE, ICON_SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp(resized).toFile(iconPath);
  return true;
}

async function normalizeIcons(modId: string): Promise<void> {
  const dataDir = path.join(__dirname, '..', 'src', 'data', modId);
  const iconsDir = path.join(dataDir, 'icons');

  if (!fs.existsSync(iconsDir)) {
    console.error(`Error: icons directory not found at ${iconsDir}`);
    process.exit(1);
  }

  const iconFiles = fs
    .readdirSync(iconsDir)
    .filter((f) => f.endsWith('.png'))
    .sort();

  if (iconFiles.length === 0) {
    console.error('Error: No PNG files found in icons directory');
    process.exit(1);
  }

  console.log(`Found ${iconFiles.length} icons to check`);

  let resizedCount = 0;
  let errorCount = 0;

  for (const iconFile of iconFiles) {
    const iconPath = path.join(iconsDir, iconFile);
    try {
      const wasResized = await normalizeIcon(iconPath);
      if (wasResized) {
        resizedCount++;
      }
    } catch (err) {
      console.error(`  Error processing ${iconFile}:`, err);
      errorCount++;
    }
  }

  console.log(`\nDone: ${resizedCount} icons resized, ${iconFiles.length - resizedCount - errorCount} already correct size`);
  if (errorCount > 0) {
    console.log(`${errorCount} errors encountered`);
  }
}

// Main
const modId = process.argv[2];
if (!modId) {
  console.error(
    'Usage: npx ts-node -r tsconfig-paths/register scripts/normalize-icons.ts <mod-id>',
  );
  console.error(
    'Example: npx ts-node -r tsconfig-paths/register scripts/normalize-icons.ts sfyf',
  );
  process.exit(1);
}

normalizeIcons(modId).catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
