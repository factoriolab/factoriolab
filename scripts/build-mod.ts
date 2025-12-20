/**
 * Build a mod from its config.json by running all necessary steps.
 *
 * Usage: npx ts-node -r tsconfig-paths/register scripts/build-mod.ts <mod-id>
 * Example: npx ts-node -r tsconfig-paths/register scripts/build-mod.ts sfyf
 *
 * Steps performed:
 * 1. Extract icons from extended mods (if their icons/ folder doesn't exist)
 * 2. Merge mod data from config.json
 * 3. Normalize mod's own icons to 64x64
 * 4. Build spritesheet from all icons
 * 5. Update hash.json
 * 6. Minify data.json and hash.json
 */
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface ModConfig {
  extends?: string[];
  [key: string]: unknown;
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

function runScript(scriptName: string, args: string[] = []): void {
  const cmd = `npm run ${scriptName} ${args.join(' ')}`;
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
}

function hasIconsFolder(modId: string): boolean {
  const iconsDir = path.join(getDataDir(modId), 'icons');
  if (!fs.existsSync(iconsDir)) {
    return false;
  }
  const pngFiles = fs.readdirSync(iconsDir).filter((f) => f.endsWith('.png'));
  return pngFiles.length > 0;
}

function buildMod(modId: string): void {
  console.log(`\n========================================`);
  console.log(`Building mod: ${modId}`);
  console.log(`========================================`);

  const config = loadConfig(modId);

  // Step 1: Extract icons from extended mods if needed
  if (config?.extends) {
    for (const baseModId of config.extends) {
      if (!hasIconsFolder(baseModId)) {
        console.log(`\n[Step 1] Extracting icons from ${baseModId}...`);
        runScript('extract-icons', [baseModId]);
      } else {
        console.log(`\n[Step 1] Icons folder exists for ${baseModId}, skipping extraction`);
      }
    }
  }

  // Step 2: Merge mod data
  if (config) {
    console.log(`\n[Step 2] Merging mod data...`);
    runScript('merge-mod-data', [modId]);
  } else {
    console.log(`\n[Step 2] No config.json found, skipping merge`);
  }

  // Step 3: Normalize mod's own icons
  if (hasIconsFolder(modId)) {
    console.log(`\n[Step 3] Normalizing icons...`);
    runScript('normalize-icons', [modId]);
  } else {
    console.log(`\n[Step 3] No icons folder for ${modId}, skipping normalization`);
  }

  // Step 4: Build spritesheet
  console.log(`\n[Step 4] Building spritesheet...`);
  runScript('build-icons', [modId]);

  // Step 5: Update hash
  console.log(`\n[Step 5] Updating hash...`);
  runScript('update-hash', [modId]);

  // Step 6: Minify data
  console.log(`\n[Step 6] Minifying data...`);
  runScript('minify-data', [modId]);

  console.log(`\n========================================`);
  console.log(`Build complete for: ${modId}`);
  console.log(`========================================\n`);
}

// Main
const modId = process.argv[2];
if (!modId) {
  console.error(
    'Usage: npx ts-node -r tsconfig-paths/register scripts/build-mod.ts <mod-id>',
  );
  console.error(
    'Example: npx ts-node -r tsconfig-paths/register scripts/build-mod.ts sfyf',
  );
  process.exit(1);
}

try {
  buildMod(modId);
} catch (err) {
  console.error('\nBuild failed:', err);
  process.exit(1);
}
