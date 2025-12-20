/**
 * Merge mod data from a config.json that specifies base mods and delta changes.
 *
 * Usage: npx ts-node -r tsconfig-paths/register scripts/merge-mod-data.ts <mod-id>
 * Example: npx ts-node -r tsconfig-paths/register scripts/merge-mod-data.ts sfyf
 *
 * Config file structure (config.json):
 * {
 *   "extends": ["sfy"],           // Base mod(s) to import from, in priority order
 *   "version": { ... },           // Optional: override version info
 *   "add": {                      // New data to add
 *     "categories": [...],
 *     "items": [...],
 *     "recipes": [...]
 *   },
 *   "override": {                 // Data to override (replaces by id)
 *     "items": [...],
 *     "recipes": [...]
 *   },
 *   "remove": {                   // IDs to remove
 *     "items": ["item-id-1"],
 *     "recipes": ["recipe-id-1"]
 *   }
 * }
 *
 * Icons workflow:
 * 1. Extended mods must have an icons/ folder (run extract-icons first if needed)
 * 2. This script copies icons from extended mods to target mod's icons/ folder
 * 3. After merging, run build-icons to generate the spritesheet and update data.json
 */
import * as fs from 'fs';
import * as path from 'path';

import { CategoryJson } from '~/models/data/category';
import { ItemJson } from '~/models/data/item';
import { ModData } from '~/models/data/mod-data';
import { RecipeJson } from '~/models/data/recipe';
import { Entities } from '~/models/utils';

// Config file structure
interface ModConfig {
  extends?: string[];
  version?: Entities;
  add?: Partial<ModData>;
  override?: Partial<ModData>;
  remove?: {
    categories?: string[];
    icons?: string[];
    items?: string[];
    recipes?: string[];
    limitations?: string[];
    locations?: string[];
  };
}

function getDataDir(modId: string): string {
  return path.join(__dirname, '..', 'src', 'data', modId);
}

function loadModData(modId: string): ModData {
  const dataPath = path.join(getDataDir(modId), 'data.json');
  if (!fs.existsSync(dataPath)) {
    throw new Error(`data.json not found for mod: ${modId}`);
  }
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

/**
 * Copy icons from an extended mod's icons/ folder to the target mod's icons folder.
 * Returns the number of icons copied.
 */
function copyIconsFromMod(
  sourceModId: string,
  targetIconsDir: string,
  existingIcons: Set<string>,
): number {
  const sourceIconsDir = path.join(getDataDir(sourceModId), 'icons');

  if (!fs.existsSync(sourceIconsDir)) {
    console.warn(
      `  Warning: No icons/ folder for ${sourceModId}. Run 'npm run extract-icons ${sourceModId}' first.`,
    );
    return 0;
  }

  const iconFiles = fs
    .readdirSync(sourceIconsDir)
    .filter((f) => f.endsWith('.png'));

  let copiedCount = 0;
  for (const iconFile of iconFiles) {
    const iconId = iconFile.replace('.png', '');
    if (existingIcons.has(iconId)) {
      continue; // Don't overwrite existing icons (later mods take priority)
    }

    const sourcePath = path.join(sourceIconsDir, iconFile);
    const targetPath = path.join(targetIconsDir, iconFile);
    fs.copyFileSync(sourcePath, targetPath);
    existingIcons.add(iconId);
    copiedCount++;
  }

  return copiedCount;
}

function loadConfig(modId: string): ModConfig | null {
  const configPath = path.join(
    __dirname,
    '..',
    'src',
    'data',
    modId,
    'config.json',
  );
  if (!fs.existsSync(configPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function mergeById<T extends { id: string }>(
  base: T[],
  additions: T[] | undefined,
  overrides: T[] | undefined,
  removals: string[] | undefined,
): T[] {
  // Create a map for efficient lookup
  const map = new Map<string, T>();

  // Add base items
  for (const item of base) {
    map.set(item.id, item);
  }

  // Remove items first
  if (removals) {
    for (const id of removals) {
      map.delete(id);
    }
  }

  // Apply overrides (replace existing)
  if (overrides) {
    for (const item of overrides) {
      if (map.has(item.id)) {
        map.set(item.id, item);
      } else {
        console.warn(`  Warning: Override for non-existent id: ${item.id}`);
        map.set(item.id, item);
      }
    }
  }

  // Add new items
  if (additions) {
    for (const item of additions) {
      if (map.has(item.id)) {
        console.warn(
          `  Warning: Adding item that already exists: ${item.id} (use override instead)`,
        );
      }
      map.set(item.id, item);
    }
  }

  return Array.from(map.values());
}

function mergeLimitations(
  base: Entities<string[]> | undefined,
  additions: Entities<string[]> | undefined,
  removals: string[] | undefined,
): Entities<string[]> | undefined {
  if (!base && !additions) return undefined;

  const result: Entities<string[]> = { ...base };

  // Remove limitations
  if (removals) {
    for (const key of removals) {
      delete result[key];
    }
  }

  // Add/merge new limitations
  if (additions) {
    for (const [key, value] of Object.entries(additions)) {
      if (result[key]) {
        // Merge arrays, avoiding duplicates
        result[key] = [...new Set([...result[key], ...value])];
      } else {
        result[key] = value;
      }
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function mergeModData(modId: string): void {
  const config = loadConfig(modId);

  if (!config) {
    console.log(`No config.json found for ${modId}, skipping merge`);
    return;
  }

  console.log(`Merging mod data for: ${modId}`);

  const targetDir = getDataDir(modId);
  const targetIconsDir = path.join(targetDir, 'icons');

  // Ensure target icons directory exists
  if (!fs.existsSync(targetIconsDir)) {
    fs.mkdirSync(targetIconsDir, { recursive: true });
  }

  // Track existing icons in target (these take priority)
  const existingIcons = new Set<string>();
  if (fs.existsSync(targetIconsDir)) {
    for (const f of fs.readdirSync(targetIconsDir)) {
      if (f.endsWith('.png')) {
        existingIcons.add(f.replace('.png', ''));
      }
    }
  }
  const originalIconCount = existingIcons.size;

  // Start with empty base data (icons handled separately via files)
  let baseData: ModData = {
    version: {},
    categories: [],
    icons: [], // Will be populated by build-icons
    items: [],
    recipes: [],
  };

  // Load and merge all extended mods in order
  if (config.extends && config.extends.length > 0) {
    for (const baseModId of config.extends) {
      console.log(`  Extending from: ${baseModId}`);
      const extendedData = loadModData(baseModId);

      // Copy icons from extended mod
      const iconsCopied = copyIconsFromMod(
        baseModId,
        targetIconsDir,
        existingIcons,
      );
      console.log(`    Copied ${iconsCopied} icons`);

      // Merge each data type (except icons - handled by build-icons)
      baseData = {
        version: { ...baseData.version, ...extendedData.version },
        categories: mergeById<CategoryJson>(
          baseData.categories,
          extendedData.categories,
          undefined,
          undefined,
        ),
        icons: [], // Will be populated by build-icons
        items: mergeById<ItemJson>(
          baseData.items,
          extendedData.items,
          undefined,
          undefined,
        ),
        recipes: mergeById<RecipeJson>(
          baseData.recipes,
          extendedData.recipes,
          undefined,
          undefined,
        ),
        limitations: mergeLimitations(
          baseData.limitations,
          extendedData.limitations,
          undefined,
        ),
        locations: mergeById<CategoryJson>(
          baseData.locations ?? [],
          extendedData.locations,
          undefined,
          undefined,
        ),
      };
      if (baseData.locations?.length === 0) {
        delete baseData.locations;
      }
    }
  }

  // Apply version override if specified
  if (config.version) {
    baseData.version = { ...baseData.version, ...config.version };
  }

  // Apply removals, overrides, and additions
  baseData.categories = mergeById<CategoryJson>(
    baseData.categories,
    config.add?.categories,
    config.override?.categories,
    config.remove?.categories,
  );

  baseData.items = mergeById<ItemJson>(
    baseData.items,
    config.add?.items,
    config.override?.items,
    config.remove?.items,
  );

  baseData.recipes = mergeById<RecipeJson>(
    baseData.recipes,
    config.add?.recipes,
    config.override?.recipes,
    config.remove?.recipes,
  );

  baseData.limitations = mergeLimitations(
    baseData.limitations,
    config.add?.limitations,
    config.remove?.limitations,
  );

  if (config.add?.locations || config.override?.locations) {
    baseData.locations = mergeById<CategoryJson>(
      baseData.locations ?? [],
      config.add?.locations,
      config.override?.locations,
      config.remove?.locations,
    );
  }
  if (baseData.locations?.length === 0) {
    delete baseData.locations;
  }

  // Handle defaults if present in add/override
  if (config.add?.defaults) {
    baseData.defaults = config.add.defaults;
  }
  if (config.override?.defaults) {
    baseData.defaults = { ...baseData.defaults, ...config.override.defaults };
  }

  // Write output
  const outputPath = path.join(targetDir, 'data.json');
  fs.writeFileSync(outputPath, JSON.stringify(baseData));

  console.log(`\nMerge complete:`);
  console.log(`  Categories: ${baseData.categories.length}`);
  console.log(`  Items: ${baseData.items.length}`);
  console.log(`  Recipes: ${baseData.recipes.length}`);
  console.log(`  Icons: ${originalIconCount} original + ${existingIcons.size - originalIconCount} copied = ${existingIcons.size} total`);
  console.log(`\nOutput written to: ${outputPath}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Run 'npm run normalize-icons ${modId}' to ensure all icons are 64x64`);
  console.log(`  2. Run 'npm run build-icons ${modId}' to generate spritesheet and update data.json`);
}

// Main
const modId = process.argv[2];
if (!modId) {
  console.error(
    'Usage: npx ts-node -r tsconfig-paths/register scripts/merge-mod-data.ts <mod-id>',
  );
  process.exit(1);
}

try {
  mergeModData(modId);
} catch (err) {
  console.error('Fatal error:', err);
  process.exit(1);
}
