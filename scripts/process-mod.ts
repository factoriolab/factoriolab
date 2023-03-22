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
// const itemLocalePath = `${scriptOutputPath}\\item-locale.json`;
const techLocalePath = `${scriptOutputPath}\\technology-locale.json`;

//console.log(appDataPath, scriptOutputPath);

/** Read in existing data file */
// const iconsPath = `./src/data/${mod}/icons.png`;
// const dataPath = `./src/data/${mod}/data.json`;
// const rawData = fs.readFileSync(dataPath).toString();
// const data: ModData = JSON.parse(rawData);

function processMod(): void {
  // Read locale data
  // const itemLocaleStr = fs.readFileSync(itemLocalePath).toString();
  // const itemLocale = JSON.parse(itemLocaleStr) as D.Locale;
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
  const recipesUnlocked = new Set<string>();

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
          recipesUnlocked.add(effect.recipe);
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
  const fixedRecipe = new Set<string>();

  for (const key of Object.keys(dataRaw['assembling-machine'])) {
    const assemblingMachine = dataRaw['assembling-machine'][key];
    if (assemblingMachine.fixed_recipe) {
      fixedRecipe.add(assemblingMachine.fixed_recipe);
    }
  }

  for (const key of Object.keys(dataRaw['rocket-silo'])) {
    const rocketSilo = dataRaw['rocket-silo'][key];
    if (rocketSilo.fixed_recipe) {
      fixedRecipe.add(rocketSilo.fixed_recipe);
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
    if (!fixedRecipe.has(key)) {
      // Skip recipes that are not unlocked / enabled
      if (recipe.enabled === false && !recipesUnlocked.has(key)) {
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

  const itemsUsed = new Set<string>();
  const fluidsUsed = new Set<string>();

  // Check for burnt result / rocket launch products
  for (const key of Object.keys(dataRaw.item)) {
    const item = dataRaw.item[key];
    if (item.rocket_launch_product || item.rocket_launch_products) {
      itemsUsed.add(item.name);

      if (item.rocket_launch_product) {
        if (D.isSimpleProduct(item.rocket_launch_product)) {
          itemsUsed.add(item.rocket_launch_product[0]);
        } else if (D.isItemProduct(item.rocket_launch_product)) {
          itemsUsed.add(item.rocket_launch_product.name);
        } else {
          fluidsUsed.add(item.rocket_launch_product.name);
        }
      }

      if (item.rocket_launch_products) {
        for (const product of item.rocket_launch_products) {
          if (D.isSimpleProduct(product)) {
            itemsUsed.add(product[0]);
          } else if (D.isItemProduct(product)) {
            itemsUsed.add(product.name);
          } else {
            fluidsUsed.add(product.name);
          }
        }
      }
    }

    if (item.burnt_result) {
      itemsUsed.add(item.name);
      itemsUsed.add(item.burnt_result);
    }
  }

  console.log(JSON.stringify(Object.keys(recipesEnabled)));

  for (const key of Object.keys(recipesEnabled)) {
    const recipe = dataRaw.recipe[key];
    const recipeData = typeof recipe[mode] === 'object' ? recipe[mode] : recipe;

    // Check ingredients
    for (const ingredient of recipeData.ingredients) {
      if (D.isSimpleIngredient(ingredient)) {
        itemsUsed.add(ingredient[0]);
      } else if (D.isItemIngredient(ingredient)) {
        itemsUsed.add(ingredient.name);
      } else {
        fluidsUsed.add(ingredient.name);
      }
    }

    // Check products
    if (recipeData.results) {
      for (const result of recipeData.results) {
        if (D.isSimpleProduct(result)) {
          itemsUsed.add(result[0]);
        } else if (D.isItemProduct(result)) {
          itemsUsed.add(result.name);
        } else {
          fluidsUsed.add(result.name);
        }
      }
    } else if (recipeData.result) {
      itemsUsed.add(recipeData.result);
    }
  }

  // Sort items
  const itemsRaw = [
    ...Array.from(itemsUsed.keys()).map((key) => {
      const item =
        dataRaw.item[key] ??
        dataRaw.ammo[key] ??
        dataRaw.armor[key] ??
        dataRaw.capsule[key] ??
        dataRaw.gun[key] ??
        dataRaw['item-with-entity-data'][key] ??
        dataRaw.module[key] ??
        dataRaw['rail-planner'][key] ??
        dataRaw['repair-tool'][key] ??
        dataRaw['spidertron-remote'][key] ??
        dataRaw.tool[key];
      if (item == null) {
        console.log(key);
      }
      return item;
    }),
    ...Array.from(fluidsUsed.keys()).map((key) => {
      const fluid = dataRaw.fluid[key];
      if (fluid == null) {
        console.log(key);
      }
      return fluid;
    }),
  ];
  const itemsList = itemsRaw
    .map((item): [string, string, string, string, string, string] => {
      const subgroup = dataRaw['item-subgroup'][item.subgroup ?? 'other'];
      const group = dataRaw['item-group'][subgroup.group];
      return [
        group.order ?? '',
        group.name,
        subgroup.order ?? '',
        subgroup.name,
        item.order ?? '',
        item.name,
      ];
    })
    .sort((a, b) => {
      for (let i = 0; i < 6; i++) {
        if (a[i] !== b[i]) {
          return a[i].localeCompare(b[i]);
        }
      }
      return a[5].localeCompare(b[5]);
    })
    .map((all) => all[5]);
  console.log(JSON.stringify(itemsList));

  const dataTempPath = `./temp/data.json`;
  fs.writeFileSync(dataTempPath, JSON.stringify(dataOut));
}

processMod();
