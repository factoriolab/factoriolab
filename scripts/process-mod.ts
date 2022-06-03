import { getAverageColor } from 'fast-average-color-node';
import fs from 'fs';

import { ModData } from '~/models';

const mod = process.argv[2];

if (!mod) {
  throw new Error(
    'Please specify a mod to process by the folder name, e.g. "1.1" for \\src\\data\\1.1\\'
  );
}

// Load mod data at specified path, and update icons with new calculated average color
const iconsPath = `./src/data/${mod}/icons.png`;
const dataPath = `./src/data/${mod}/data.json`;
const rawData = fs.readFileSync(dataPath).toString();
const data: ModData = JSON.parse(rawData);

async function processMod(): Promise<void> {
  let start = Date.now();
  let i = 0;
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
    const now = Date.now();
    const time = now - start;
    if (time > 1000) {
      start = now;
      console.log(`Processing ${i} of ${data.icons.length}...`);
    }
    i++;
  }

  let no_in = 0;
  let no_out = 0;

  for (const recipe of data.recipes) {
    if (recipe.in == null) {
      recipe.in = {};
      no_in++;
    }

    if (recipe.out == null) {
      recipe.out = { [recipe.id]: 1 };
      no_out++;
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(data));

  console.log(`Updated color for ${data.icons.length} icons.`);
  if (no_in > 0 || no_out > 0) {
    console.log(
      `Fixed recipes: ${no_in} with no inputs and ${no_out} with no outputs.`
    );
  }
}

processMod();
