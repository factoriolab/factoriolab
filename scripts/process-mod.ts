import fs from 'fs';

import { ModData } from '~/models';

const mod = process.argv[2];

if (!mod) {
  throw new Error(
    'Please specify a mod to process by the folder name, e.g. "1.1" for \\src\\data\\1.1\\'
  );
}

console.warn('WARNING: This script is deprecated');

// const iconsPath = `./src/data/${mod}/icons.png`;
const dataPath = `./src/data/${mod}/data.json`;
const rawData = fs.readFileSync(dataPath).toString();
const data: ModData = JSON.parse(rawData);

async function processMod(): Promise<void> {
  // Use this code to shrink prebuilt sprite data from 64px to 32px sizing
  // for (const icon of data.icons) {
  //   const match = icon.position.match(/(-?\d+)px (-?\d+)px/);
  //   if (match != null) {
  //     const newa = Number(match[1]) / 2;
  //     const newb = Number(match[2]) / 2;
  //     icon.position = `${newa}px ${newb}px`;
  //   }
  // }

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

  if (no_in > 0 || no_out > 0) {
    console.log(
      `Fixed recipes: ${no_in} with no inputs and ${no_out} with no outputs.`
    );
  }
}

processMod();
