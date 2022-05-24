import { getAverageColor } from 'fast-average-color-node';
import fs from 'fs';

import { ModData } from '~/models';

const mod = process.argv[2];

if (!mod) {
  throw new Error(
    'Please specify a mod to process by the folder name, e.g. "1.1" for \\src\\data\\1.1\\'
  );
}

const iconsPath = `./src/data/${mod}/icons.png`;
const dataPath = `./src/data/${mod}/data.json`;
const rawData = fs.readFileSync(dataPath).toString();
const data: ModData = JSON.parse(rawData);

async function processMod(): Promise<void> {
  for (const icon of data.icons) {
    const match = /^-?(\d+)px -?(\d+)px$/.exec(icon.position);
    if (match?.length == 3) {
      const color = await getAverageColor(iconsPath, {
        mode: 'precision',
        top: Number(match[2]),
        left: Number(match[1]),
        width: 64,
        height: 64,
      });
      icon.color = color.hex;
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(data));

  console.log(`Successfully updated color for ${data.icons.length} icons.`);
}

processMod();
