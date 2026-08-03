import fs from 'fs';
import sharp from 'sharp';
import spritesmith from 'spritesmith';
import { getAverageColor } from 'fast-average-color-node';

import { datasets } from '~/data/datasets';
import { ModData } from '~/data/schema/mod-data';
import { getJsonData } from './utils/file';
import { logTime } from './utils/log';


const modId = process.argv[2];
if (!modId)
  throw new Error(
    'Please specify a mod to process by the folder name, e.g. "1.1" for src/data/1.1',
  );


const mod = datasets.mods.find((m) => m.id === modId);
if (!mod)
  throw new Error(
    'Please define this mod set in `src/data/index.ts` before running build.',
  );

// Set up paths
const tempPath = './scripts/temp';
const tempIconsSourcePath = `${tempPath}/icons`;
const tempIconsOutputPath = `${tempPath}/icons-sm`;
const tempDataPath = `${tempPath}/data.json`;

const modPath = `./public/data/${modId}`;
const modDataPath = `${modPath}/data.json`;
const modHashPath = `${modPath}/hash.json`;
const modDefaultsPath = `${modPath}/defaults.json`;

async function processMod(): Promise<void> {
  if (fs.existsSync(tempIconsOutputPath)) {
    fs.rmSync(tempIconsOutputPath, { recursive: true });
  }
  fs.mkdirSync(tempIconsOutputPath);

  // Record of icon hash : icon id
  const iconHash: Record<string, string> = {};
  const iconSet = new Set<string>();
  // Record of file path : icon id
  const iconFiles: Record<string, string> = {};
  const iconColors: Record<string, string> = {};

  async function resizeIcon(path: string, iconId: string): Promise<void> {
    const outPath = `${tempIconsOutputPath}/${iconId}.png`;
    const color = await getAverageColor(path, { mode: 'precision' });
    await sharp(path).resize(64, 64).png().toFile(outPath);
    iconFiles[outPath] = iconId;
    iconColors[outPath] = color.hex;
    iconSet.add(iconId);
  }

  const allIconPaths = fs.readdirSync(tempIconsSourcePath, {
    encoding: 'utf8',
  });

  for (const iconPath of allIconPaths) {
    try {
      await resizeIcon(
        tempIconsSourcePath + '/' + iconPath,
        iconPath.replace('.png', ''),
      );
    } catch (error) {
      console.log('Failed resizing icon:', iconPath);
      throw error;
    }
  }

  const modData: ModData = getJsonData(tempDataPath) as ModData;
  modData.version = { boi: '0.4.0' };
  modData.flags = [
    'consumptionAsDrain',
    'miningProductivity',
    'miningDepletion',
    'power',
  ];

  modData.categories = [
    {
      id: 'logistics',
      name: 'Logistics',
      icon: 'belt_mk1',
    },
    {
      id: 'production',
      name: 'Production',
      icon: 'assembler_mk1',
    },
    {
      id: 'intermediate',
      name: 'Intermediates',
      icon: 'iron_plate',
    },
    {
      id: 'energy-and-power',
      name: 'Energy & Power',
      icon: 'wood_power_pole'
    },
    {
      id: 'architecture',
      name: 'Architecture',
      icon: 'concrete',
    },
    {
      id: 'equipment',
      name: 'Equipment',
      icon: 'crowbar',
    },
  ];

  const modDefaults = getJsonData(modDefaultsPath);
  if (modDefaults) {
    modData.defaults = modDefaults;
  }

  function writeData(): void {
    modData.recipes = modData.recipes.filter((r) => {
      if (!r.producers?.length) {
        return false;
      }
      if (r.category === 'uncategorized') {
        return false;
      }
      return true;
    });

    modData.recipes.forEach((it) => {
      if (!iconSet.has(it.id)) {
        it.icon = 'missing_icon';
      }
    });

    modData.items.filter((it) => {
      if (it.category === 'uncategorized') {
        return false;
      }
      return true;
    });

    modData.items.forEach((it) => {
      if (!iconSet.has(it.id)) {
        it.icon = 'missing_icon';
      }
    });

    fs.writeFileSync(modDataPath, JSON.stringify(modData));
  }

  // Sprite sheet
  logTime('Generating sprite sheet');

  async function finalize(
    result: spritesmith.SpritesmithResult,
  ): Promise<void> {
    modData.icons = Object.keys(result.coordinates).map((file) => {
        const coords = result.coordinates[file];
        return {
          id: iconFiles[file],
          x: coords.x,
          y: coords.y,
          color: iconColors[file],
        };
      });

    logTime('Writing data');
    writeData();
    logTime('Complete');
  }

  spritesmith.run({ src: Object.keys(iconFiles), padding: 2 }, (_, result) => {
    const modIconsPath = `${modPath}/icons.webp`;
    sharp(result.image)
      .webp()
      .toFile(modIconsPath)
      .then(async () => {
        await finalize(result);
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  });
}

void processMod();
