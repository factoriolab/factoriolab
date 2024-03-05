import { getAverageColor } from 'fast-average-color-node';
import fs from 'fs';

import { ModData } from '~/models';
import { data } from '../src/data';
import { getJsonData, logTime } from './helpers';

const mods = data.mods.map((m) => m.id);

/** Run all scripts required to update an array of Factorio mod sets */
async function updateMods(mods: string[]): Promise<void> {
  for (let i = 0; i < mods.length; i++) {
    const mod = mods[i];
    const modPath = `./src/data/${mod}`;
    const modDataPath = `${modPath}/data.json`;
    const modData = getJsonData<ModData>(modDataPath);
    const image = fs.readFileSync(`${modPath}/icons.webp`);

    modData.icons = await Promise.all(
      modData.icons.map(async (icon) => {
        const coords = icon.position.match(/-?(\d+)px -?(\d+)px/);
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

    logTime(`Updated mod '${mod}' (${i + 1} of ${mods.length})`);
  }
}

logTime(
  `Starting update for ${mods.length} mod${mods.length > 1 ? 's' : ''}...`,
);
updateMods(mods);
