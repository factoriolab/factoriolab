import { datasets } from '~/data/datasets';
import { CUSTOM_MOD } from '~/data/game';
import { ModData } from '~/data/schema/mod-data';

import { getJsonData, writeJsonData } from './utils/file';
import { logTime } from './utils/log';

const CURRENT_FACTORIO_MODS = datasets.mods
  .filter((m) => m.id !== CUSTOM_MOD)
  .map((m) => m.id);

// Load mods from arguments
let mods = process.argv.slice(2);

// Fallback to update all mods
if (mods.length === 0) {
  mods = CURRENT_FACTORIO_MODS;
}

/** Run all scripts required to update an array of Factorio mod sets */
function updateMods(mods: string[]): void {
  for (let i = 0; i < mods.length; i++) {
    const mod = mods[i];
    const modPath = `./public/data/${mod}`;
    const modDataPath = `${modPath}/data.json`;
    const modData = getJsonData(modDataPath) as ModData;

    // modData.items.forEach((i) => {
    // });
    // modData.recipes.forEach((i) => {
    //   if (i.name == null) console.log('recipe', i.id);
    // });

    writeJsonData(modDataPath, modData);
    logTime(
      `Migrated mod '${mod}' (${(i + 1).toString()} of ${mods.length.toString()})`,
    );
  }
}

logTime(
  `Starting migration for ${mods.length.toString()} mod${mods.length > 1 ? 's' : ''}...`,
);

updateMods(mods);
