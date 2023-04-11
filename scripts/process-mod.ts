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
const factorioPath = `${appDataPath}\\Factorio`;
const modsPath = `${factorioPath}\\mods`;
const modListPath = `${modsPath}\\mod-list.json`;
const playerDataPath = `${factorioPath}\\player-data.json`;
const scriptOutputPath = `${factorioPath}\\script-output`;
const dataRawPath = `${scriptOutputPath}\\data-raw-dump.json`;

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

function getJsonData<T>(file: string): T {
  const str = fs.readFileSync(file).toString();
  const sanitized = str.replace(/"(.*)":\s?-?inf/g, '"$1": 0');
  return JSON.parse(sanitized) as T;
}

function getLocale(file: string): D.Locale {
  const path = `${scriptOutputPath}\\${file}`;
  return getJsonData<D.Locale>(path);
}

function getMultiplier(letter: string): number {
  switch (letter) {
    case '':
      return 0.001;
    case 'k':
    case 'K':
      return 1;
    case 'M':
      return 1000;
    case 'G':
      return 1000000;
    default:
      throw `Unsupported multiplier: '${letter}'`;
  }
}

function getPowerInKw(usage: string): number {
  const match = /(\d+)(\w+)/.exec(usage);
  if (match == null) {
    throw `Unrecognized power format: '${usage}'`;
  }

  const [_, numStr, unit] = [...match];
  if (!unit.endsWith('W')) {
    throw `Unrecognized power unit: '${usage}'`;
  }
  const multiplier = getMultiplier(unit.substring(0, unit.length - 1));
  const num = Number(numStr);
  return multiplier * num;
}

function processMod(): void {
  // Read mod data
  const modList = getJsonData<D.ModList>(modListPath);
  const modFiles = fs
    .readdirSync(modsPath)
    // Only include zip files
    .filter((f) => f.endsWith('.zip'))
    // Trim .zip from end of string
    .map((f) => f.substring(0, f.length - 4));

  // Read player data
  const playerData = getJsonData<D.PlayerData>(playerDataPath);

  // Read locale data
  const groupLocale = getLocale('item-group-locale.json');
  const itemLocale = getLocale('item-locale.json');
  const fluidLocale = getLocale('fluid-locale.json');
  const recipeLocale = getLocale('recipe-locale.json');
  const techLocale = getLocale('technology-locale.json');

  // Read main data JSON
  const dataRaw = getJsonData<D.DataRawDump>(dataRawPath);

  // Set up collections
  // Record of icons by hash: id
  const icons: Record<string, string> = {};
  // Record of icon copies by hash: ids
  const iconCopies: Record<string, string[]> = {};

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

  function addIcon(spec: D.IconSpecification & D.Base): void {
    if (spec.icon == null && spec.icons == null) {
      throw `No icons for proto ${spec.name}`;
    }

    const hash = `${JSON.stringify(spec.icon)}.${JSON.stringify(
      spec.icon_size
    )}.${JSON.stringify(spec.icon_mipmaps)}.${JSON.stringify(spec.icons)}`;
    if (icons[hash]) {
      iconCopies[hash].push(spec.name);
    } else {
      icons[hash] = spec.name;
      iconCopies[hash] = [];
    }
  }

  const modData: ModData = {
    version: {},
    categories: [],
    icons: [],
    items: [],
    recipes: [],
    limitations: {},
  };

  modList.mods
    .filter((m) => m.enabled)
    .forEach((m) => {
      if (m.name === 'base') {
        const version = playerData['last-played-version'].game_version;
        modData.version[m.name] = version;
      } else {
        const file = modFiles.find((f) => f.startsWith(m.name));
        if (file == null) {
          throw `No mod file found for mod ${m.name}`;
        } else {
          const version = file.substring(m.name.length + 1);
          modData.version[m.name] = version;
        }
      }
    });

  const recipesUnlocked = new Set<string>();
  const technologyRecipes: Recipe[] = [];

  for (const key of Object.keys(dataRaw.technology)) {
    const techRaw = dataRaw.technology[key];
    const techData = techRaw[mode] ?? techRaw;

    const technology: Technology = {};

    if (techData.prerequisites?.length) {
      technology.prerequisites = techData.prerequisites;
    }

    const unlockRecipes: string[] = [];
    if (techData.effects) {
      for (const effect of techData.effects) {
        if (D.isUnlockRecipeModifier(effect)) {
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
      time: techData.unit.time,
      producers: [], // TODO: Calculate later..
      in: techData.unit.ingredients.reduce(
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
    addIcon(techRaw);
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

      if (proto.icon == null && proto.icons == null) {
        const product = getRecipeProduct(proto);
        addIcon(product);
      } else {
        addIcon(proto);
      }
    } else if (D.isFluid(proto)) {
      const item: Item = {
        id: proto.name,
        name: fluidLocale.names[proto.name],
        row: getItemRow(proto),
        category: group.name,
      };

      modData.items.push(item);
      addIcon(proto);
    } else {
      const item: Item = {
        id: proto.name,
        name: itemLocale.names[proto.name],
        stack: proto.stack_size,
        row: getItemRow(proto),
        category: group.name,
      };

      if (proto.place_result) {
        if (dataRaw['transport-belt'][proto.place_result]) {
          const transportBelt = dataRaw['transport-belt'][proto.place_result];
          item.belt = {
            speed: transportBelt.speed * 480,
          };
        }

        if (dataRaw.beacon[proto.place_result]) {
          const beacon = dataRaw.beacon[proto.place_result];
          item.beacon = {
            effectivity: beacon.distribution_effectivity,
            modules: beacon.module_specification.module_slots ?? 0,
            range: beacon.supply_area_distance,
            type: beacon.energy_source.type,
            usage: getPowerInKw(beacon.energy_usage),
            disallowedEffects: D.allEffects.filter(
              (e) =>
                beacon.allowed_effects == null ||
                beacon.allowed_effects.indexOf(e) === -1
            ),
          };
        }

        if (dataRaw['mining-drill'][proto.place_result]) {
          const miningDrill = dataRaw['mining-drill'][proto.place_result];

          if (
            miningDrill.energy_source.type === 'fluid' ||
            miningDrill.energy_source.type === 'heat'
          ) {
            console.warn(
              `Skipping machine '${miningDrill.name}' with energy source type: '${miningDrill.energy_source.type}'`
            );
          } else {
            item.machine = {
              type: miningDrill.energy_source.type,
              speed: miningDrill.mining_speed,
              usage: getPowerInKw(miningDrill.energy_usage),
              mining: true,
              disallowedEffects: miningDrill.allowed_effects,
            };

            if (miningDrill.module_specification) {
              item.machine.modules =
                miningDrill.module_specification.module_slots ?? 0;
            }

            if (miningDrill.energy_source.emissions_per_minute) {
              item.machine.pollution =
                miningDrill.energy_source.emissions_per_minute;
            }

            switch (miningDrill.energy_source.type) {
              case 'electric': {
                if (miningDrill.energy_source.drain) {
                  item.machine.drain = getPowerInKw(
                    miningDrill.energy_source.drain
                  );
                }
                break;
              }
              case 'burner': {
                if (miningDrill.energy_source.fuel_categories) {
                  if (miningDrill.energy_source.fuel_categories.length > 1) {
                    console.warn(
                      `Using first energy source fuel category for machine ${miningDrill.name}`
                    );
                    item.machine.category =
                      miningDrill.energy_source.fuel_categories[0];
                  } else {
                    item.machine.category =
                      miningDrill.energy_source.fuel_category ?? 'chemical';
                  }
                }
                break;
              }
            }
          }
        }
      }

      modData.items.push(item);
      addIcon(proto);
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

  // Sprite sheet
  const iconIds = Object.keys(icons).map((i) => icons[i]);
  const width = Math.max(8, Math.ceil(Math.pow(iconIds.length, 0.5)));

  const wrap = width * -64;
  let x = 0;
  let y = 0;
  for (const id of iconIds) {
    modData.icons.push({
      id,
      position: `${x}px ${y}px`,
    });

    x = x - 64;
    if (x === wrap) {
      y = y - 64;
      x = 0;
    }
  }

  const dataTempPath = `./temp/data.json`;
  fs.writeFileSync(dataTempPath, JSON.stringify(modData));
}

processMod();
