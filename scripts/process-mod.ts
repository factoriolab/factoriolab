import fs from 'fs';

import { ModData } from '~/models';
import {
  DataRawDump,
  isUnlockRecipeModifier,
  Locale,
} from './factorio-dump.models';

const mod = process.argv[2];

if (!mod) {
  throw new Error(
    'Please specify a mod to process by the folder name, e.g. "1.1" for \\src\\data\\1.1\\'
  );
}

/** Read data dump */

// Set up paths
const appDataPath = process.env['AppData'];
const scriptOutputPath = `${appDataPath}\\Factorio\\script-output`;
const dataRawPath = `${scriptOutputPath}\\data-raw-dump.json`;
const itemLocalePath = `${scriptOutputPath}\\item-locale.json`;

// Read locale data
const itemLocaleStr = fs.readFileSync(itemLocalePath).toString();
const itemLocale = JSON.parse(itemLocaleStr) as Locale;

for (const key of Object.keys(itemLocale.names)) {
  console.log(key, itemLocale.names[key]);
}

// Read main data JSON
const dataRawStr = fs.readFileSync(dataRawPath).toString();
const dataRaw = JSON.parse(dataRawStr) as DataRawDump;
for (const key of Object.keys(dataRaw.item)) {
  console.log(key);
}

for (const key of Object.keys(dataRaw.technology)) {
  const tech = dataRaw.technology[key];
  if (tech.effects) {
    for (const effect of tech.effects) {
      if (isUnlockRecipeModifier(effect)) {
        console.log(tech.name, 'unlocks', effect.recipe);
      }
    }
  }
}

//console.log(appDataPath, scriptOutputPath);

/** Read in existing data file */
const iconsPath = `./src/data/${mod}/icons.png`;
const dataPath = `./src/data/${mod}/data.json`;
const rawData = fs.readFileSync(dataPath).toString();
const data: ModData = JSON.parse(rawData);

async function processMod(): Promise<void> {
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

// processMod();
