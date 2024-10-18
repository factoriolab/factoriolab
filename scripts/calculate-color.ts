import { getAverageColor } from 'fast-average-color-node';
import fs from 'fs';

import { ModData } from '~/models/data/mod-data';

import { data } from '../src/data';
import { getJsonData } from './helpers/file.helpers';
import { logTime } from './helpers/log.helpers';

// Load mods from arguments
let mods = process.argv.slice(2);
if (mods.length === 0) mods = data.mods.map((m) => m.id);

/** Run all scripts required to update an array of Factorio mod sets */
async function updateMods(mods: string[]): Promise<void> {
  for (let i = 0; i < mods.length; i++) {
    const mod = mods[i];
    const modPath = `./src/data/${mod}`;
    const modDataPath = `${modPath}/data.json`;
    const modData = getJsonData(modDataPath) as ModData;
    const image = fs.readFileSync(`${modPath}/icons.webp`);

    modData.icons = await Promise.all(
      modData.icons.map(async (icon) => {
        const coords = /-?(\d+)px -?(\d+)px/.exec(icon.position);
        const left = Number(coords?.[1]);
        const top = Number(coords?.[2]);
        const color = await getAverageColor(image, {
          mode: 'precision',
          top,
          left,
          width: 64,
          height: 64,
        });
        icon.color = color.hex;
        return icon;
      }),
    );
    fs.writeFileSync(modDataPath, JSON.stringify(modData));

    logTime(
      `Updated mod '${mod}' (${(i + 1).toString()} of ${mods.length.toString()})`,
    );
  }
}

logTime(
  `Starting update for ${mods.length.toString()} mod${mods.length > 1 ? 's' : ''}...`,
);

void updateMods(mods);
