import fs from 'fs';

import {
  Category,
  Entities,
  Item,
  ModData,
  Recipe,
  Technology,
} from '~/models';
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
const groupLocalePath = `${scriptOutputPath}\\item-group-locale.json`;
const itemLocalePath = `${scriptOutputPath}\\item-locale.json`;
const fluidLocalePath = `${scriptOutputPath}\\fluid-locale.json`;
const recipeLocalePath = `${scriptOutputPath}\\recipe-locale.json`;
const techLocalePath = `${scriptOutputPath}\\technology-locale.json`;

//console.log(appDataPath, scriptOutputPath);

/** Read in existing data file */
// const iconsPath = `./src/data/${mod}/icons.png`;
// const dataPath = `./src/data/${mod}/data.json`;
// const rawData = fs.readFileSync(dataPath).toString();
// const data: ModData = JSON.parse(rawData);

function addEntityValue(e: Entities<number>, id: string, val: number): void {
  if (e[id] == null) {
    e[id] = val;
  } else {
    e[id] = e[id] + val;
  }
}

function processMod(): void {
  // Read locale data
  const groupLocaleStr = fs.readFileSync(groupLocalePath).toString();
  const groupLocale = JSON.parse(groupLocaleStr) as D.Locale;
  const itemLocaleStr = fs.readFileSync(itemLocalePath).toString();
  const itemLocale = JSON.parse(itemLocaleStr) as D.Locale;
  const fluidLocaleStr = fs.readFileSync(fluidLocalePath).toString();
  const fluidLocale = JSON.parse(fluidLocaleStr) as D.Locale;
  const recipeLocaleStr = fs.readFileSync(recipeLocalePath).toString();
  const recipeLocale = JSON.parse(recipeLocaleStr) as D.Locale;
  const techLocaleStr = fs.readFileSync(techLocalePath).toString();
  const techLocale = JSON.parse(techLocaleStr) as D.Locale;

  // Read main data JSON
  const dataRawStr = fs.readFileSync(dataRawPath).toString();
  const dataRaw = JSON.parse(dataRawStr) as D.DataRawDump;

  function getItem(name: string): D.Item | D.Fluid {
    return (
      dataRaw.item[name] ??
      dataRaw.ammo[name] ??
      dataRaw.armor[name] ??
      dataRaw.capsule[name] ??
      dataRaw.gun[name] ??
      dataRaw['item-with-entity-data'][name] ??
      dataRaw.module[name] ??
      dataRaw['rail-planner'][name] ??
      dataRaw['repair-tool'][name] ??
      dataRaw['spidertron-remote'][name] ??
      dataRaw.tool[name] ??
      dataRaw.fluid[name]
    );
  }

  function getRecipeProduct(recipe: D.Recipe): D.Item | D.Fluid {
    const recipeData = typeof recipe[mode] === 'object' ? recipe[mode] : recipe;
    if (recipeData.result) {
      return getItem(recipeData.result);
    } else if (recipeData.results?.length === 1) {
      const result = recipeData.results[0];
      if (D.isSimpleProduct(result)) {
        return getItem(result[0]);
      } else if (D.isItemProduct(result)) {
        return getItem(result.name);
      } else {
        return dataRaw.fluid[result.name];
      }
    } else if (recipeData.results && recipe.main_product) {
      const mainProduct = recipe.main_product;
      const result = recipeData.results.find((r) =>
        D.isSimpleIngredient(r) ? r[0] === mainProduct : r.name === mainProduct
      );
      if (result) {
        if (D.isSimpleProduct(result)) {
          return getItem(result[0]);
        } else if (D.isItemProduct(result)) {
          return getItem(result.name);
        } else {
          return dataRaw.fluid[result.name];
        }
      } else {
        throw `Main product ${mainProduct} declared by recipe ${recipe.name} not found in results`;
      }
    } else {
      throw `Recipe ${recipe.name} declares no subgroup though it is required`;
    }
  }

  function getRecipeSubgroup(recipe: D.Recipe): string {
    if (recipe.subgroup) {
      return recipe.subgroup;
    }

    return getSubgroup(getRecipeProduct(recipe));
  }

  function getSubgroup(proto: D.Recipe | D.Item | D.Fluid): string {
    if (proto.subgroup) {
      return proto.subgroup;
    }

    if (D.isRecipe(proto)) {
      return getRecipeSubgroup(proto);
    } else if (D.isFluid(proto)) {
      return 'fluid';
    } else {
      return 'other';
    }
  }

  let lastItemRow = 0;
  let lastItemGroup = '';
  let lastItemSubgroup = '';
  function getItemRow(item: D.Item | D.Fluid): number {
    const subgroup = dataRaw['item-subgroup'][getSubgroup(item)];
    if (subgroup.group === lastItemGroup) {
      if (subgroup.name !== lastItemSubgroup) {
        lastItemRow++;
      }
    } else {
      lastItemRow = 0;
    }

    lastItemGroup = subgroup.group;
    lastItemSubgroup = subgroup.name;
    return lastItemRow;
  }

  let lastRecipeRow = 0;
  let lastRecipeGroup = '';
  let lastRecipeSubgroup = '';
  function getRecipeRow(recipe: D.Recipe): number {
    const subgroupId = getRecipeSubgroup(recipe);
    const subgroup = dataRaw['item-subgroup'][subgroupId];
    if (subgroup.group === lastRecipeGroup) {
      if (subgroup.name !== lastRecipeSubgroup) {
        lastRecipeRow++;
      }
    } else {
      lastRecipeRow = 0;
    }

    lastRecipeGroup = subgroup.group;
    lastRecipeSubgroup = subgroup.name;
    return lastRecipeRow;
  }
  const modData: ModData = {
    version: {},
    categories: [],
    icons: [],
    items: [],
    recipes: [],
    limitations: {},
  };
  const recipesUnlocked = new Set<string>();
  const technologyRecipes: Recipe[] = [];

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

    technologyRecipes.push(recipe);
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

  // Check for burnt result / rocket launch products
  for (const key of Object.keys(dataRaw.item)) {
    const item = dataRaw.item[key];
    if (item.rocket_launch_product || item.rocket_launch_products) {
      itemsUsed.add(item.name);

      if (item.rocket_launch_product) {
        if (D.isSimpleProduct(item.rocket_launch_product)) {
          itemsUsed.add(item.rocket_launch_product[0]);
        } else {
          itemsUsed.add(item.rocket_launch_product.name);
        }
      }

      if (item.rocket_launch_products) {
        for (const product of item.rocket_launch_products) {
          if (D.isSimpleProduct(product)) {
            itemsUsed.add(product[0]);
          } else {
            itemsUsed.add(product.name);
          }
        }
      }
    }

    if (item.burnt_result) {
      itemsUsed.add(item.name);
      itemsUsed.add(item.burnt_result);
    }
  }

  for (const key of Object.keys(recipesEnabled)) {
    const recipeRaw = dataRaw.recipe[key];
    const recipeData =
      typeof recipeRaw[mode] === 'object' ? recipeRaw[mode] : recipeRaw;

    // Check ingredients
    for (const ingredient of recipeData.ingredients) {
      if (D.isSimpleIngredient(ingredient)) {
        itemsUsed.add(ingredient[0]);
      } else {
        itemsUsed.add(ingredient.name);
      }
    }

    // Check products
    if (recipeData.results) {
      for (const result of recipeData.results) {
        if (D.isSimpleProduct(result)) {
          itemsUsed.add(result[0]);
        } else {
          itemsUsed.add(result.name);
        }
      }
    } else if (recipeData.result) {
      itemsUsed.add(recipeData.result);
    }
  }

  // Sort items
  const protos = [
    ...Array.from(itemsUsed.keys()).map((key) => getItem(key)),
    ...Object.keys(recipesEnabled).map((r) => recipesEnabled[r]),
  ];
  const protosSorted = protos
    .map(
      (
        proto
      ): {
        proto: D.Item | D.Fluid | D.Recipe;
        sort: [string, string, string, string, string, string];
      } => {
        const subgroupId = getSubgroup(proto);
        const subgroup = dataRaw['item-subgroup'][subgroupId];
        const group = dataRaw['item-group'][subgroup.group];

        let order = proto.order;
        if (order == null && D.isRecipe(proto)) {
          order = getRecipeProduct(proto).order;
        }

        return {
          proto,
          sort: [
            group.order ?? '',
            group.name,
            subgroup.order ?? '',
            subgroup.name,
            order ?? '',
            proto.name,
          ],
        };
      }
    )
    .sort((a, b) => {
      for (let i = 0; i < 6; i++) {
        if (a.sort[i] !== b.sort[i]) {
          return a.sort[i].localeCompare(b.sort[i]);
        }
      }
      return a.sort[5].localeCompare(b.sort[5]);
    })
    .map((all) => all.proto);

  const groupsUsed = new Set<string>();

  // Process protos
  for (const proto of protosSorted) {
    const subgroup = dataRaw['item-subgroup'][getSubgroup(proto)];
    const group = dataRaw['item-group'][subgroup.group];
    groupsUsed.add(group.name);
    if (D.isRecipe(proto)) {
      const recipeData = typeof proto[mode] === 'object' ? proto[mode] : proto;

      const recipeIn: Entities<number> = {};
      const recipeOut: Entities<number> = {};

      // Check ingredients
      for (const ingredient of recipeData.ingredients) {
        if (D.isSimpleIngredient(ingredient)) {
          const [itemId, amount] = ingredient;
          addEntityValue(recipeIn, itemId, amount);
        } else {
          addEntityValue(recipeIn, ingredient.name, ingredient.amount);
        }
      }

      // Check products
      if (recipeData.results) {
        for (const result of recipeData.results) {
          if (D.isSimpleProduct(result)) {
            const [itemId, amount] = result;
            addEntityValue(recipeOut, itemId, amount);
          } else {
            addEntityValue(recipeOut, result.name, result.amount);
          }
        }
      } else if (recipeData.result) {
        addEntityValue(
          recipeOut,
          recipeData.result,
          recipeData.result_count ?? 1
        );
      }

      const recipe: Recipe = {
        id: proto.name,
        name: recipeLocale.names[proto.name],
        category: subgroup.group,
        row: getRecipeRow(proto),
        time: proto.energy_required ?? 0.5,
        producers: [],
        in: recipeIn,
        out: recipeOut,
      };
      modData.recipes.push(recipe);
    } else if (D.isFluid(proto)) {
      const item: Item = {
        id: proto.name,
        name: fluidLocale.names[proto.name],
        row: getItemRow(proto),
        category: group.name,
      };
      modData.items.push(item);
    } else {
      const item: Item = {
        id: proto.name,
        name: itemLocale.names[proto.name],
        stack: proto.stack_size,
        row: getItemRow(proto),
        category: group.name,
      };
      modData.items.push(item);
    }
  }

  modData.recipes.push(...technologyRecipes);

  for (const id of groupsUsed) {
    const category: Category = {
      id,
      name: groupLocale.names[id],
    };
    modData.categories.push(category);
  }
  modData.categories.push({ id: 'technology', name: 'Technology' });

  const dataTempPath = `./temp/data.json`;
  fs.writeFileSync(dataTempPath, JSON.stringify(modData));
}

processMod();
