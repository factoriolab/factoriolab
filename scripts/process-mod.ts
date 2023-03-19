import fs from 'fs';

import { Entities, ModData, Recipe, Technology } from '~/models';
import * as D from './factorio-dump.models';

const mod = process.argv[2];
const mode: 'normal' | 'expensive' = 'normal';

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
const techLocalePath = `${scriptOutputPath}\\technology-locale.json`;

//console.log(appDataPath, scriptOutputPath);

/** Read in existing data file */
// const iconsPath = `./src/data/${mod}/icons.png`;
// const dataPath = `./src/data/${mod}/data.json`;
// const rawData = fs.readFileSync(dataPath).toString();
// const data: ModData = JSON.parse(rawData);

function processMod(): void {
  // Read locale data
  const itemLocaleStr = fs.readFileSync(itemLocalePath).toString();
  const itemLocale = JSON.parse(itemLocaleStr) as D.Locale;
  const techLocaleStr = fs.readFileSync(techLocalePath).toString();
  const techLocale = JSON.parse(techLocaleStr) as D.Locale;

  // Read main data JSON
  const dataRawStr = fs.readFileSync(dataRawPath).toString();
  const dataRaw = JSON.parse(dataRawStr) as D.DataRawDump;

  const dataOut: ModData = {
    version: {},
    categories: [],
    icons: [],
    items: [],
    recipes: [],
    limitations: {},
  };
  const recipesUnlocked: Entities<boolean> = {};

  for (const key of Object.keys(dataRaw.technology)) {
    const techRaw = dataRaw.technology[key];

    const technology: Technology = {};

    if (techRaw.prerequisites?.length) {
      technology.prerequisites = techRaw.prerequisites;
    }

    const unlockRecipes: string[] = [];
    if (techRaw.effects) {
      for (const effect of techRaw.effects) {
        if (D.isUnlockRecipeModifier(effect)) {
          // console.log(technologyRaw.name, 'unlocks', effect.recipe);
          unlockRecipes.push(effect.recipe);
          recipesUnlocked[effect.recipe] = true;
        }
      }
    }

    if (unlockRecipes.length) {
      technology.unlockRecipes = unlockRecipes;
    }

    const recipe: Recipe = {
      id: techRaw.name,
      name: techLocale.names[techRaw.name],
      category: 'technology',
      row: 0,
      time: techRaw.unit.time,
      producers: [], // TODO: Calculate later..
      in: techRaw.unit.ingredients.reduce(
        (e: Entities<number>, [id, count]) => {
          e[id] = count;
          return e;
        },
        {}
      ),
      out: { [techRaw.name]: 1 },
      technology,
    };

    dataOut.recipes.push(recipe);
  }

  const recipesEnabled: Entities<D.Recipe> = {};
  const fixedRecipe: Entities<boolean> = {};

  for (const key of Object.keys(dataRaw['assembling-machine'])) {
    const assemblingMachine = dataRaw['assembling-machine'][key];
    if (assemblingMachine.fixed_recipe) {
      fixedRecipe[assemblingMachine.fixed_recipe] = true;
    }
  }

  for (const key of Object.keys(dataRaw['rocket-silo'])) {
    const rocketSilo = dataRaw['rocket-silo'][key];
    if (rocketSilo.fixed_recipe) {
      fixedRecipe[rocketSilo.fixed_recipe] = true;
    }
  }

  for (const key of Object.keys(dataRaw.recipe)) {
    const recipe = dataRaw.recipe[key];
    let include = true;

    // Skip recipes that don't have results
    if (recipe.result == null && !recipe.results?.length && !recipe[mode]) {
      console.log(`Skipping recipe ${key} due to no results`);
      include = false;
    }

    // Always include fixed recipes that have outputs
    if (!fixedRecipe[key]) {
      // Skip recipes that are not unlocked / enabled
      if (!recipe.enabled && !recipesUnlocked[key]) {
        include = false;
      }

      // Skip recipes that are hidden
      if (recipe.hidden) {
        include = false;
      }
    }

    // TODO: Filter out recipe loops

    if (include) {
      recipesEnabled[key] = recipe;
    }
  }

  const itemsUsed: Entities<boolean> = {};

  for (const key of Object.keys(recipesEnabled)) {
    console.log(key);
  }

  const dataTempPath = `./temp/data.json`;
  fs.writeFileSync(dataTempPath, JSON.stringify(dataOut));
}

processMod();
