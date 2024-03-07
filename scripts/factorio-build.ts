import { getAverageColor } from 'fast-average-color-node';
import fs from 'fs';
import sharp from 'sharp';
import spritesmith from 'spritesmith';

import { orString } from '~/helpers';
import {
  Category,
  Entities,
  Fuel,
  Item,
  Machine,
  ModData,
  ModHash,
  Recipe,
  Technology,
} from '~/models';
import * as D from './factorio-build.models';
import * as M from './factorio.models';
import {
  addEntityValue,
  coerceArray,
  coerceString,
  emptyModHash,
  getBeacon,
  getBelt,
  getCargoWagon,
  getEnergyInMJ,
  getEntityMap,
  getEntitySize,
  getFluidWagon,
  getIconText,
  getIngredients,
  getItemMap,
  getJsonData,
  getLastIngredient,
  getLocale,
  getMachineDisallowedEffects,
  getMachineDrain,
  getMachineModules,
  getMachinePollution,
  getMachineSilo,
  getMachineSpeed,
  getMachineType,
  getMachineUsage,
  getVersion,
  logTime,
  logWarn,
  round,
} from './helpers';

/**
 * This script is intended to pull files from a dump from Factorio and build
 * files required by the calculator. If the files already exist, should use
 * existing defaults and append to the hash list.
 */

const mod = process.argv[2];
let mode: 'normal' | 'expensive' = 'normal';
if (!mod) {
  throw new Error(
    'Please specify a mod to process by the folder name, e.g. "1.1" for src/data/1.1',
  );
}

// Set up paths
const appDataPath = process.env['AppData'];
const factorioPath = `${appDataPath}/Factorio`;
const modsPath = `${factorioPath}/mods`;
const scriptOutputPath = `${factorioPath}/script-output`;
const dataRawPath = `${scriptOutputPath}/data-raw-dump.json`;
const tempPath = './scripts/temp';
const tempIconsPath = `${tempPath}/icons`;
const modPath = `./src/data/${mod}`;
const modDataPath = `${modPath}/data.json`;
const modHashPath = `${modPath}/hash.json`;

/** Check whether this is an existing mod set using expensive mode */
if (fs.existsSync(modDataPath)) {
  const oldData = getJsonData<ModData>(modDataPath);
  if (oldData.expensive) {
    mode = 'expensive';
    console.log('Note: Using expensive mode data for this mod set');
  }
}

async function processMod(): Promise<void> {
  // Read mod data
  logTime('Reading mod data');

  // Create directories
  if (fs.existsSync(tempPath)) {
    fs.rmSync(tempPath, { recursive: true });
  }

  fs.mkdirSync(tempPath);
  fs.mkdirSync(tempIconsPath);

  // Read locale data
  const groupLocale = getLocale('item-group-locale.json');
  const itemLocale = getLocale('item-locale.json');
  const fluidLocale = getLocale('fluid-locale.json');
  const recipeLocale = getLocale('recipe-locale.json');
  const techLocale = getLocale('technology-locale.json');
  const entityLocale = getLocale('entity-locale.json');

  // Read main data JSON
  const dataRaw = getJsonData<D.DataRawDump>(dataRawPath);

  // Set up collections
  // Record of limitations by hash: id
  const limitations: Record<string, string> = {};
  // Record of technology ids by raw id: factoriolab id
  const techId: Record<string, string> = {};

  const itemMap = getItemMap(dataRaw);
  const entityMap = getEntityMap(dataRaw);

  function getRecipeProduct(
    recipe: M.RecipePrototype,
  ): D.AnyItemPrototype | M.FluidPrototype | undefined {
    const recipeData = getRecipeData(recipe);
    if (recipeData.result) {
      return itemMap[recipeData.result];
    } else if (recipeData.results?.length === 1) {
      const result = recipeData.results[0];
      if (D.isSimpleProduct(result)) {
        return itemMap[result[0]];
      } else if (D.isFluidProduct(result)) {
        return dataRaw.fluid[result.name];
      } else {
        return itemMap[result.name];
      }
    } else if (recipeData.results && recipeData.main_product) {
      const mainProduct = recipeData.main_product;
      const result = recipeData.results.find((r) =>
        D.isSimpleProduct(r) ? r[0] === mainProduct : r.name === mainProduct,
      );
      if (result) {
        if (D.isSimpleProduct(result)) {
          return itemMap[result[0]];
        } else if (D.isFluidProduct(result)) {
          return dataRaw.fluid[result.name];
        } else {
          return itemMap[result.name];
        }
      } else {
        throw `Main product '${mainProduct}' declared by recipe '${recipe.name}' not found in results`;
      }
    } else {
      return undefined;
    }
  }

  function getRecipeSubgroup(recipe: M.RecipePrototype): string {
    if (recipe.subgroup) {
      return recipe.subgroup;
    }

    const product = getRecipeProduct(recipe);
    if (product == null) {
      throw `Recipe '${recipe.name}' declares no subgroup though it is required`;
    }

    return getSubgroup(product);
  }

  function getSubgroup(
    proto:
      | D.AnyItemPrototype
      | D.AnyEntityPrototype
      | M.FluidPrototype
      | M.RecipePrototype,
  ): string {
    if (proto.subgroup) return proto.subgroup;

    if (M.isRecipePrototype(proto)) {
      return getRecipeSubgroup(proto);
    } else if (M.isFluidPrototype(proto)) {
      return 'fluid';
    } else {
      return 'other';
    }
  }

  let lastItemRow = 0;
  let lastItemGroup = '';
  let lastItemSubgroup = '';
  function getItemRow(
    item: D.AnyItemPrototype | D.AnyEntityPrototype | M.FluidPrototype,
  ): number {
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
  function getRecipeRow(
    proto:
      | M.RecipePrototype
      | D.AnyItemPrototype
      | D.AnyEntityPrototype
      | M.FluidPrototype,
  ): number {
    const subgroupId = getSubgroup(proto);
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

  // Record of icon hash : icon id
  const iconHash: Record<string, string> = {};
  const iconSet = new Set<string>();
  // Record of file path : icon id
  const iconFiles: Record<string, string> = {};
  const iconColors: Record<string, string> = {};

  async function resizeIcon(path: string, iconId: string): Promise<void> {
    const outPath = `${tempIconsPath}/${iconId}.png`;
    const color = await getAverageColor(path, { mode: 'precision' });
    await sharp(path).resize(64, 64).png().toFile(outPath);
    iconFiles[outPath] = iconId;
    iconColors[outPath] = color.hex;
  }

  async function getIcon(
    spec:
      | D.AnyItemPrototype
      | D.AnyEntityPrototype
      | M.FluidPrototype
      | M.ItemGroup
      | M.RecipePrototype
      | M.TechnologyPrototype,
  ): Promise<string | undefined> {
    const id = M.isTechnologyPrototype(spec) ? techId[spec.name] : spec.name;

    // If recipe has no declared icon, get product icon
    if (M.isRecipePrototype(spec) && spec.icon == null && spec.icons == null) {
      const product = getRecipeProduct(spec);
      if (product != null) spec = product;
    }

    // If recipe still has no product icon, calculator will pick first product
    if (!M.isRecipePrototype(spec) && spec.icon == null && spec.icons == null) {
      throw `No icons for proto ${spec.name}`;
    }

    let iconId = id;

    const hash = `${JSON.stringify(spec.icon)}.${JSON.stringify(
      spec.icon_size,
    )}.${JSON.stringify(spec.icon_mipmaps)}.${JSON.stringify(spec.icons)}`;
    if (iconHash[hash]) {
      iconId = iconHash[hash];
    } else {
      if (iconSet.has(iconId)) {
        // Find alternate id
        let i = 0;
        let altId: string;
        do {
          altId = `${iconId}-${i++}`;
        } while (iconSet.has(altId));
        iconId = altId;
      }

      iconHash[hash] = iconId;
      iconSet.add(iconId);

      let folder = 'item';
      if (M.isRecipePrototype(spec)) {
        folder = 'recipe';
      } else if (M.isFluidPrototype(spec)) {
        folder = 'fluid';
      } else if (M.isTechnologyPrototype(spec)) {
        folder = 'technology';
      } else if (M.isItemGroup(spec)) {
        folder = 'item-group';
      } else if (D.isAnyItemPrototype(spec)) {
        folder = 'item';
      } else {
        folder = 'entity';
      }

      const path = `${scriptOutputPath}/${folder}/${spec.name}.png`;
      await resizeIcon(path, iconId);
    }

    return iconId === id ? undefined : iconId;
  }

  const craftingFluidBoxes: Record<string, M.FluidBox[]> = {};
  type EntityType = 'lab' | 'silo' | 'boiler' | 'offshorePump';
  // For each machine type, a map of item name : entity name
  const machines: Record<EntityType, Record<string, string>> = {
    lab: {},
    silo: {},
    boiler: {},
    offshorePump: {},
  };

  // Keep track of all used fluid temperatures
  const fluidTemps: Record<string, Set<number>> = {};
  function addFluidTemp(id: string, temp: number): void {
    if (fluidTemps[id] == null) fluidTemps[id] = new Set<number>();

    fluidTemps[id].add(temp);
  }

  // Records of producer categories to producers
  type ProducerType = 'burner' | 'crafting' | 'resource';
  const producersMap: Record<ProducerType, Record<string, string[]>> = {
    burner: {},
    crafting: {},
    resource: {},
  };
  function addProducers(
    id: string,
    categories: string[],
    type: ProducerType,
  ): void {
    const record = producersMap[type];

    for (const category of categories) {
      if (record[category] == null) {
        record[category] = [];
      }

      record[category].push(id);
    }
  }

  function processProducers(proto: D.MachineProto, name: string): void {
    if (M.isMiningDrillPrototype(proto)) {
      addProducers(name, proto.resource_categories, 'resource');
    }

    if (!M.isOffshorePumpPrototype(proto)) {
      if (proto.energy_source.type === 'burner') {
        if (proto.energy_source.fuel_categories) {
          addProducers(name, proto.energy_source.fuel_categories, 'burner');
        } else if (proto.energy_source.fuel_category) {
          addProducers(name, [proto.energy_source.fuel_category], 'burner');
        }
      }
    }

    if (
      M.isAssemblingMachinePrototype(proto) ||
      M.isRocketSiloPrototype(proto) ||
      M.isFurnacePrototype(proto)
    ) {
      addProducers(name, proto.crafting_categories, 'crafting');
      if (proto.fluid_boxes == null) {
        craftingFluidBoxes[name] = [];
      } else if (Array.isArray(proto.fluid_boxes)) {
        craftingFluidBoxes[name] = proto.fluid_boxes;
      } else {
        craftingFluidBoxes[name] = [];
        for (let i = 1; proto.fluid_boxes[i] != null; i++) {
          craftingFluidBoxes[name].push(proto.fluid_boxes[i]);
        }
      }
    }

    if (M.isBoilerPrototype(proto)) {
      machines.boiler[name] = proto.name;
    } else if (M.isRocketSiloPrototype(proto)) {
      machines.silo[name] = proto.name;
    } else if (M.isLabPrototype(proto)) {
      machines.lab[name] = proto.name;
    } else if (M.isOffshorePumpPrototype(proto)) {
      machines.offshorePump[name] = proto.name;
    }
  }

  const ANY_FLUID_BURN = 'fluid';
  const ANY_FLUID_HEAT = 'fluid-heat';
  function getMachineCategory(proto: D.MachineProto): string[] | undefined {
    if (M.isOffshorePumpPrototype(proto)) {
      return undefined;
    }

    if (proto.energy_source.type === 'burner') {
      if (proto.energy_source.fuel_categories) {
        return proto.energy_source.fuel_categories;
      } else {
        return [proto.energy_source.fuel_category ?? 'chemical'];
      }
    }

    if (proto.energy_source.type === 'fluid') {
      if (proto.energy_source.fluid_box.filter != null)
        return [proto.energy_source.fluid_box.filter];

      if (proto.energy_source.burns_fluid) return [ANY_FLUID_BURN];

      return [ANY_FLUID_HEAT];
    }

    return undefined;
  }

  function getRecipeData(recipe: M.RecipePrototype): M.RecipeData {
    const data = recipe[mode];
    return typeof data === 'object' ? data : (recipe as M.RecipeData);
  }

  function getProducts(
    results:
      | M.ProductPrototype[]
      | Record<string, M.ProductPrototype>
      | undefined,
    result?: string,
    result_count = 1,
  ): [
    // Products
    Record<string, number>,
    // Catalysts, if defined
    Record<string, number> | undefined,
    // Total number of outputs
    number,
    // Temperatures of fluid outputs, if any
    Record<string, number>,
  ] {
    const record: Record<string, number> = {};
    const temps: Record<string, number> = {};
    let catalyst: Record<string, number> | undefined;
    let total = 0;

    if (results != null) {
      for (const product of coerceArray(results)) {
        if (D.isSimpleProduct(product)) {
          const [itemId, amount] = product;
          addEntityValue(record, itemId, amount);
          total += amount;
        } else {
          if (D.isFluidProduct(product)) {
            const fluid = dataRaw.fluid[product.name];
            const temp = product.temperature ?? fluid.default_temperature;
            temps[product.name] = temp;
            addFluidTemp(product.name, temp);
          }

          let amount = product.amount;
          if (
            amount == null &&
            product.amount_max != null &&
            product.amount_min != null
          ) {
            amount = (product.amount_max + product.amount_min) / 2;
          }

          if (amount == null) continue;

          if (product.probability) {
            amount = amount * product.probability;
          }

          addEntityValue(record, product.name, amount);

          if (product.catalyst_amount) {
            if (catalyst == null) catalyst = {};

            addEntityValue(catalyst, product.name, product.catalyst_amount);
          }

          total += amount;
        }
      }
    } else if (result && result_count) {
      addEntityValue(record, result, result_count);
      total += result_count;
    }

    return [record, catalyst, total, temps];
  }

  function getMachine(proto: D.MachineProto, name: string): Machine {
    const machine: Machine = {
      speed: getMachineSpeed(proto),
      modules: getMachineModules(proto),
      disallowedEffects: getMachineDisallowedEffects(proto),
      type: getMachineType(proto),
      fuelCategories: getMachineCategory(proto),
      usage: getMachineUsage(proto),
      drain: getMachineDrain(proto),
      pollution: getMachinePollution(proto),
      silo: getMachineSilo(proto, dataRaw['rocket-silo-rocket']),
      size: getEntitySize(proto),
    };

    processProducers(proto, name);

    return machine;
  }

  const modData: ModData = {
    version: {},
    categories: [],
    icons: [],
    items: [],
    recipes: [],
    limitations: {},
  };

  const modDataReport: D.ModDataReport = {
    noProducts: [],
    noProducers: [],
    resourceNoMinableProducts: [],
    resourceDuplicate: [],
  };

  const modHashReport = emptyModHash();
  function addIfMissing(hash: ModHash, key: keyof ModHash, id: string): void {
    if (hash[key] == null) hash[key] = [];

    if (hash[key].indexOf(id) === -1) {
      hash[key].push(id);
      modHashReport[key].push(id);
    }
  }

  function writeData(): void {
    if (fs.existsSync(modDataPath)) {
      const oldData = getJsonData<ModData>(modDataPath);
      const oldHash = getJsonData<ModHash>(modHashPath);

      if (mode === 'expensive') {
        modData.expensive = true;
      }

      modData.defaults = oldData.defaults;

      if (modData.defaults?.excludedRecipes) {
        // Filter excluded recipes for only recipes that exist
        modData.defaults.excludedRecipes =
          modData.defaults.excludedRecipes.filter((e) =>
            modData.recipes.some((r) => r.id === e),
          );
      }

      modData.items.forEach((i) => {
        addIfMissing(oldHash, 'items', i.id);

        if (i.beacon) addIfMissing(oldHash, 'beacons', i.id);
        if (i.belt) addIfMissing(oldHash, 'belts', i.id);
        if (i.fuel) addIfMissing(oldHash, 'fuels', i.id);
        if (i.cargoWagon || i.fluidWagon) addIfMissing(oldHash, 'wagons', i.id);
        if (i.machine) addIfMissing(oldHash, 'machines', i.id);
        if (i.module) addIfMissing(oldHash, 'modules', i.id);
        if (i.technology) addIfMissing(oldHash, 'technologies', i.id);
      });

      modData.recipes.forEach((r) => addIfMissing(oldHash, 'recipes', r.id));

      fs.writeFileSync(modHashPath, JSON.stringify(oldHash));
      fs.writeFileSync(
        `${tempPath}/hash-update-report.json`,
        JSON.stringify(modHashReport),
      );
    } else {
      const modHash: ModHash = {
        items: modData.items.map((i) => i.id),
        beacons: modData.items.filter((i) => i.beacon).map((i) => i.id),
        belts: modData.items.filter((i) => i.belt).map((i) => i.id),
        fuels: modData.items.filter((i) => i.fuel).map((i) => i.id),
        wagons: modData.items
          .filter((i) => i.cargoWagon || i.fluidWagon)
          .map((i) => i.id),
        machines: modData.items.filter((i) => i.machine).map((i) => i.id),
        modules: modData.items.filter((i) => i.module).map((i) => i.id),
        technologies: modData.items
          .filter((i) => i.technology)
          .map((i) => i.id),
        recipes: modData.recipes.map((r) => r.id),
      };

      fs.writeFileSync(modHashPath, JSON.stringify(modHash));
    }

    fs.writeFileSync(modDataPath, JSON.stringify(modData));
    fs.writeFileSync(
      `${tempPath}/data-report.json`,
      JSON.stringify(modDataReport),
    );
  }

  modData.version = getVersion(modsPath, factorioPath);

  logTime('Calculating included recipes');

  // Record of recipe id : technology id
  const recipesUnlocked: Record<string, string> = {};
  const technologySet = new Set<M.TechnologyPrototype>();
  for (const key of Object.keys(dataRaw.technology)) {
    const techRaw = dataRaw.technology[key];
    const techData = techRaw[mode] || (techRaw as M.TechnologyData);

    if (
      itemMap[techRaw.name] ||
      entityMap[techRaw.name] ||
      dataRaw.recipe[techRaw.name] ||
      dataRaw['item-group'][techRaw.name]
    ) {
      techId[techRaw.name] = `${techRaw.name}-technology`;
    } else {
      techId[techRaw.name] = techRaw.name;
    }

    if (!techData.hidden && techData.enabled !== false) {
      technologySet.add(techRaw);

      for (const effect of coerceArray(techData.effects)) {
        if (M.isUnlockRecipeModifier(effect)) {
          recipesUnlocked[effect.recipe] = techId[techRaw.name];
          technologySet.add(techRaw);
        }
      }
    }
  }

  const recipesEnabled: Entities<M.RecipePrototype> = {};
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

  // Cache recipe results to use later
  const recipeDataMap: Record<string, M.RecipeData> = {};
  const recipeResultsMap: Record<
    string,
    [
      Record<string, number>,
      Record<string, number> | undefined,
      number,
      Record<string, number>,
    ]
  > = {};
  const recipeIngredientsMap: Record<
    string,
    [
      Record<string, number>,
      Record<string, [number | undefined, number | undefined]>,
    ]
  > = {};
  for (const key of Object.keys(dataRaw.recipe)) {
    const recipe = dataRaw.recipe[key];
    let include = true;

    // Skip recipes that don't have results
    const recipeData = getRecipeData(recipe);
    const results = getProducts(
      recipeData.results,
      recipeData.result,
      recipeData.result_count,
    );

    if (results[2] === 0) {
      modDataReport.noProducts.push(key);
      include = false;
    }

    recipeDataMap[key] = recipeData;
    recipeResultsMap[key] = results;

    // Always include fixed recipes that have outputs
    if (!fixedRecipe.has(key)) {
      // Skip recipes that are not unlocked / enabled
      if (recipeData.enabled === false && !recipesUnlocked[key]) {
        include = false;
      }

      // Skip recipes that are hidden
      if (recipeData.hidden) {
        include = false;
      }
    }

    if (include) {
      /**
       * Exclude loading / unloading containers from Freight Forwarding
       * These are imperfect loops that are not detected automatically, because
       * there is a chance the container will break in the unload recipe
       */
      const subgroup = dataRaw['item-subgroup'][getSubgroup(recipe)];
      if (
        subgroup.group === 'ic-load-container' ||
        subgroup.group === 'ic-unload-container'
      ) {
        include = false;
      }
    }

    if (include) {
      recipesEnabled[key] = recipe;
      recipeIngredientsMap[key] = getIngredients(recipeData.ingredients);
    }
  }

  function checkForMatch(
    ingredients: Record<string, number>,
    results: Record<string, number>,
  ): boolean {
    const inKeys = Object.keys(ingredients);
    const outKeys = Object.keys(results);
    return (
      inKeys.length === outKeys.length &&
      inKeys.every((i) => results[i] === ingredients[i])
    );
  }

  const keysToRemove = new Set<string>();
  const recipesIncluded = Object.keys(recipesEnabled);

  // Check for recipe loops
  for (const key of Object.keys(recipesEnabled)) {
    const ingredientsKeys = Object.keys(recipeIngredientsMap[key][0]);
    let matchKey: string | undefined;
    let matchMulti = false;
    const matchIngredients: string[] = [];
    for (const r of recipesIncluded) {
      const results = recipeResultsMap[r][0];
      const ingredients = recipeIngredientsMap[r][0];
      for (const key of ingredientsKeys) {
        if (results[key]) {
          if (matchKey == null) {
            matchKey = r;
          } else {
            matchMulti = true;
            break;
          }
        }

        if (ingredients[key]) {
          matchIngredients.push(key);
        }
      }

      if (matchMulti) break;
    }

    if (matchKey != null && !matchMulti && matchIngredients.length === 1) {
      // Ingredients to this recipe are only produced by one recipe
      // If matchIngredients.length is 1, then the ingredients are also not used elsewhere

      // Check for a loop
      const results = recipeResultsMap[matchKey][0];
      const ingredientMatch = checkForMatch(
        recipeIngredientsMap[key][0],
        results,
      );

      if (ingredientMatch) {
        // Check whether results of this recipe match ingredients of matched recipe
        const results = recipeResultsMap[key][0];
        const fullMatch = checkForMatch(
          recipeIngredientsMap[matchKey][0],
          results,
        );

        if (fullMatch) {
          // Detected recipe loop
          keysToRemove.add(key);
          keysToRemove.add(matchKey);
          delete recipesEnabled[key];
          delete recipesEnabled[matchKey];
        }
      }
    }
  }

  for (const key of keysToRemove) {
    delete recipesEnabled[key];
  }

  logTime('Processing data');
  // Include all modules by default
  const itemsUsed = new Set<string>(Object.keys(dataRaw.module));

  const itemKeys = D.anyItemKeys.reduce((result: string[], key) => {
    result.push(...Object.keys(dataRaw[key]));
    return result;
  }, []);

  const entityKeys = D.anyEntityKeys.reduce((result: string[], key) => {
    result.push(...Object.keys(dataRaw[key]));
    return result;
  }, []);

  // Check for burnt result / rocket launch products, fuels
  for (const key of itemKeys) {
    const item = itemMap[key];

    if (M.isFluidPrototype(item)) continue;

    if (item.fuel_value) itemsUsed.add(item.name);

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

  // Add resources
  for (const name of Object.keys(dataRaw.resource)) {
    const resource = dataRaw.resource[name];
    if (resource && resource.minable) {
      const recipeOut = getProducts(
        resource.minable.results,
        resource.minable.result,
        resource.minable.count,
      )[0];
      for (const outKey of Object.keys(recipeOut)) {
        itemsUsed.add(outKey);
      }
    }
  }

  // Check for use in recipe ingredients / products
  for (const key of Object.keys(recipesEnabled)) {
    for (const ingredient of Object.keys(recipeIngredientsMap[key][0])) {
      itemsUsed.add(ingredient);
    }

    for (const product of Object.keys(recipeResultsMap[key][0])) {
      itemsUsed.add(product);
    }
  }

  // Check for use in technology ingredients
  const techDataMap: Record<string, M.TechnologyData> = {};
  const techIngredientsMap: Record<string, Record<string, number>> = {};
  for (const tech of technologySet) {
    const techData = tech[mode] || (tech as M.TechnologyData);
    const techIngredients =
      techData.unit == null ? {} : getIngredients(techData.unit.ingredients)[0];

    for (const ingredient of Object.keys(techIngredients)) {
      itemsUsed.add(ingredient);
    }

    techDataMap[tech.name] = techData;
    techIngredientsMap[tech.name] = techIngredients;
  }

  const itemsUsedProtos = Array.from(itemsUsed.values()).map(
    (key) => itemMap[key],
  );

  // Add any entities that are not placed by the added items
  const placedEntities = new Set<string>();
  for (const proto of itemsUsedProtos) {
    if (!M.isFluidPrototype(proto) && proto.place_result != null) {
      placedEntities.add(proto.place_result);
    }
  }

  const entitiesUsedProtos = entityKeys
    .filter((id) => !placedEntities.has(id) && !itemsUsed.has(id))
    .map((id) => entityMap[id])
    // Exclude any entities without icons (non-placeable)
    .filter((e) => e.icon || e.icons);

  // Sort items
  const protos = [
    ...itemsUsedProtos,
    ...entitiesUsedProtos,
    ...Object.keys(recipesEnabled).map((r) => recipesEnabled[r]),
  ];
  const protosSorted = protos
    .map(
      (
        proto,
      ): {
        proto:
          | D.AnyItemPrototype
          | D.AnyEntityPrototype
          | M.FluidPrototype
          | M.RecipePrototype;
        sort: [string, string, string, string, string, string];
      } => {
        const subgroupId = getSubgroup(proto);
        const subgroup = dataRaw['item-subgroup'][subgroupId];
        const group = dataRaw['item-group'][subgroup.group];

        let order = proto.order;
        if (order == null && M.isRecipePrototype(proto)) {
          order = getRecipeProduct(proto)?.order;
        }

        return {
          proto,
          sort: [
            coerceString(group.order),
            group.name,
            coerceString(subgroup.order),
            subgroup.name,
            coerceString(order),
            proto.name,
          ],
        };
      },
    )
    .sort((a, b) => {
      for (let i = 0; i < 5; i++) {
        if (a.sort[i] !== b.sort[i]) {
          return a.sort[i].localeCompare(b.sort[i]);
        }
      }
      return a.sort[5].localeCompare(b.sort[5]);
    })
    .map((all) => all.proto);

  const groupsUsed = new Set<string>();

  // Process item protos
  for (const proto of protosSorted) {
    // Skip recipes until producers are processed
    if (M.isRecipePrototype(proto)) continue;

    const subgroup = dataRaw['item-subgroup'][getSubgroup(proto)];
    const group = dataRaw['item-group'][subgroup.group];
    groupsUsed.add(group.name);

    if (M.isFluidPrototype(proto)) {
      // Check for alternate temperatures from boilers
      for (const boilerName of Object.keys(dataRaw.boiler)) {
        const boiler = dataRaw.boiler[boilerName];
        if (
          boiler.output_fluid_box.filter === proto.name &&
          boiler.target_temperature !== proto.default_temperature
        ) {
          addFluidTemp(proto.name, boiler.target_temperature);
        }
      }

      let fuel: Fuel | undefined;
      if (proto.fuel_value) {
        fuel = {
          category: ANY_FLUID_BURN,
          value: getEnergyInMJ(proto.fuel_value),
        };
      }

      const icon = await getIcon(proto);
      let temps = [proto.default_temperature];
      if (fluidTemps[proto.name] != null) {
        temps = [...fluidTemps[proto.name]];
      }

      // Move default temperature, if present, to index 0
      temps.sort((a, b) =>
        a === proto.default_temperature
          ? -1
          : b === proto.default_temperature
            ? 1
            : 0,
      );
      fluidTemps[proto.name] = new Set(temps);

      temps.forEach((temp, i) => {
        const id = i === 0 ? proto.name : `${proto.name}-${temp}`;
        const itemTemp: Item = {
          id,
          name: fluidLocale.names[proto.name],
          category: group.name,
          row: getItemRow(proto),
          icon,
          fuel,
        };

        if (i > 0 && itemTemp.icon == null) itemTemp.icon = proto.name;

        if (temp !== proto.default_temperature) {
          itemTemp.name += ` (${temp}°C)`;
          itemTemp.iconText = `${temp}°`;

          if (temp > proto.default_temperature) {
            // Add fluid heat fuel
            const tempDiff = temp - proto.default_temperature;
            const energyGenerated =
              tempDiff * getEnergyInMJ(proto.heat_capacity ?? '1KJ');
            const heatFuel: Fuel = {
              category: ANY_FLUID_HEAT,
              value: round(energyGenerated, 10),
            };
            if (itemTemp.fuel == null) {
              itemTemp.fuel = heatFuel;
            } else {
              // Need to add fake item for fluid heat value
              modData.items.push({
                id: `${id}-heat-fuel`,
                name: itemTemp.name,
                category: itemTemp.category,
                row: getItemRow(proto),
                icon,
                fuel: heatFuel,
              });
            }
          }
        }

        modData.items.push(itemTemp);
      });
    } else if (M.isBeaconPrototype(proto)) {
      modData.items.push({
        id: proto.name,
        name: entityLocale.names[proto.name],
        category: group.name,
        row: getItemRow(proto),
        icon: await getIcon(proto),
        beacon: getBeacon(proto),
      });
    } else if (
      M.isAssemblingMachinePrototype(proto) ||
      M.isBoilerPrototype(proto) ||
      M.isFurnacePrototype(proto) ||
      M.isLabPrototype(proto) ||
      M.isMiningDrillPrototype(proto) ||
      M.isOffshorePumpPrototype(proto) ||
      M.isReactorPrototype(proto) ||
      M.isRocketSiloPrototype(proto)
    ) {
      modData.items.push({
        id: proto.name,
        name: entityLocale.names[proto.name],
        category: group.name,
        row: getItemRow(proto),
        icon: await getIcon(proto),
        machine: getMachine(proto, proto.name),
      });
    } else if (M.isTransportBeltPrototype(proto)) {
      modData.items.push({
        id: proto.name,
        name: entityLocale.names[proto.name],
        category: group.name,
        row: getItemRow(proto),
        icon: await getIcon(proto),
        belt: getBelt(proto),
      });
    } else if (M.isCargoWagonPrototype(proto)) {
      modData.items.push({
        id: proto.name,
        name: entityLocale.names[proto.name],
        category: group.name,
        row: getItemRow(proto),
        icon: await getIcon(proto),
        cargoWagon: getCargoWagon(proto),
      });
    } else if (M.isFluidWagonPrototype(proto)) {
      modData.items.push({
        id: proto.name,
        name: entityLocale.names[proto.name],
        category: group.name,
        row: getItemRow(proto),
        icon: await getIcon(proto),
        fluidWagon: getFluidWagon(proto),
      });
    } else {
      const item: Item = {
        id: proto.name,
        name: itemLocale.names[proto.name],
        category: group.name,
        stack: proto.stack_size,
        row: getItemRow(proto),
        icon: await getIcon(proto),
      };

      if (proto.place_result) {
        // Parse beacon
        if (dataRaw.beacon[proto.place_result]) {
          const entity = dataRaw.beacon[proto.place_result];
          item.beacon = getBeacon(entity);
        }

        // Parse machine
        if (dataRaw.boiler[proto.place_result]) {
          const entity = dataRaw.boiler[proto.place_result];
          item.machine = getMachine(entity, proto.name);
        } else if (dataRaw['assembling-machine'][proto.place_result]) {
          const entity = dataRaw['assembling-machine'][proto.place_result];
          item.machine = getMachine(entity, proto.name);
        } else if (dataRaw['rocket-silo'][proto.place_result]) {
          const entity = dataRaw['rocket-silo'][proto.place_result];
          item.machine = getMachine(entity, proto.name);
        } else if (dataRaw.furnace[proto.place_result]) {
          const entity = dataRaw.furnace[proto.place_result];
          item.machine = getMachine(entity, proto.name);
        } else if (dataRaw.lab[proto.place_result]) {
          const entity = dataRaw.lab[proto.place_result];
          item.machine = getMachine(entity, proto.name);
        } else if (dataRaw['mining-drill'][proto.place_result]) {
          const entity = dataRaw['mining-drill'][proto.place_result];
          item.machine = getMachine(entity, proto.name);
        } else if (dataRaw['offshore-pump'][proto.place_result]) {
          const entity = dataRaw['offshore-pump'][proto.place_result];
          item.machine = getMachine(entity, proto.name);
        } else if (dataRaw['reactor'][proto.place_result]) {
          const entity = dataRaw['reactor'][proto.place_result];
          item.machine = getMachine(entity, proto.name);
        }

        // Parse transport belt
        if (dataRaw['transport-belt'][proto.place_result]) {
          const entity = dataRaw['transport-belt'][proto.place_result];
          item.belt = getBelt(entity);
        }

        // Parse cargo wagon
        if (dataRaw['cargo-wagon'][proto.place_result]) {
          const entity = dataRaw['cargo-wagon'][proto.place_result];
          item.cargoWagon = getCargoWagon(entity);
        }

        // Parse fluid wagon
        if (dataRaw['fluid-wagon'][proto.place_result]) {
          const entity = dataRaw['fluid-wagon'][proto.place_result];
          item.fluidWagon = getFluidWagon(entity);
        }
      }

      // Parse module
      if (M.isModulePrototype(proto)) {
        item.module = {
          consumption: proto.effect.consumption?.bonus || undefined,
          pollution: proto.effect.pollution?.bonus || undefined,
          productivity: proto.effect.productivity?.bonus || undefined,
          speed: proto.effect.speed?.bonus || undefined,
        };

        let limitation = proto.limitation;
        if (proto.limitation_blacklist) {
          limitation = limitation ?? Object.keys(recipesEnabled);
          limitation = limitation.filter(
            (l) => proto.limitation_blacklist?.indexOf(l) === -1,
          );
        }

        if (limitation != null) {
          const set = new Set(limitation);
          const value = [...set].sort();
          const hash = JSON.stringify(value);
          if (!limitations[hash]) {
            limitations[hash] = proto.name;
            modData.limitations[proto.name] = value;
          }

          item.module.limitation = limitations[hash];
        }
      }

      // Parse fuel
      if (proto.fuel_category != null && proto.fuel_value != null) {
        item.fuel = {
          category: proto.fuel_category,
          value: getEnergyInMJ(proto.fuel_value),
          result: proto.burnt_result,
        };
      }

      modData.items.push(item);
    }
  }

  const recipeKeysUsed = new Set<string>(Object.keys(recipesEnabled));

  function getFakeRecipeId(desiredId: string, backupId: string): string {
    if (recipeKeysUsed.has(desiredId)) {
      recipeKeysUsed.add(backupId);
      return backupId;
    } else {
      recipeKeysUsed.add(desiredId);
      return desiredId;
    }
  }

  function getRecipeInOptions(
    recipeIn: Record<string, number>,
    recipeInTemp: Record<string, [number | undefined, number | undefined]>,
  ): [Record<string, number>, string[]][] {
    const fluidTempRules = Object.keys(recipeInTemp);
    if (fluidTempRules.length === 0) return [[recipeIn, []]];

    /**
     * Cycle through fluid input temperature rules and find valid
     * ingredient temperatures
     */
    const fluidTempOptions: Record<string, number[]> = {};
    for (let i = 0; i < fluidTempRules.length; i++) {
      const fluidId = fluidTempRules[i];
      const [minTemp, maxTemp] = recipeInTemp[fluidId];
      const fluid = dataRaw.fluid[fluidId];

      const all = [...fluidTemps[fluid.name]];
      const ok = all.filter(
        (a) =>
          (minTemp == null || minTemp <= a) &&
          (maxTemp == null || maxTemp >= a),
      );
      fluidTempOptions[fluidId] = ok;
    }

    /**
     * Cycle through valid fluid temperature options and generate
     * variants of the recipe inputs with matching temperatures. Each
     * iteration should create variants of every previous variant, in the
     * case that there are multiple input fluids with multiple valid
     * temperatures.
     */
    let recipeInOptions: [Record<string, number>, string[]][] = [
      [recipeIn, []],
    ];
    for (const key of Object.keys(fluidTempOptions)) {
      const defaultTemp = [...fluidTemps[key]][0];
      const old = [...recipeInOptions];
      recipeInOptions = []; // Clear out list
      const options = fluidTempOptions[key];
      options.forEach((temp) => {
        recipeInOptions.push(
          /**
           * Take each previously generated recipe input set and generate
           * a variant with this valid input fluid temperature.
           */
          ...old.map((data) => {
            if (temp !== defaultTemp) {
              const [original, ids] = data;
              const altered = { ...original };
              const id = `${key}-${temp}`;
              altered[id] = altered[key];
              delete altered[key];
              return [altered, [...ids, id]] as [
                Record<string, number>,
                string[],
              ];
            } else {
              return data;
            }
          }),
        );
      });
    }

    return recipeInOptions;
  }

  // Process recipe protos / fake recipes
  const processedLaunchProto = new Set<string>();
  for (const proto of protosSorted) {
    const subgroup = dataRaw['item-subgroup'][getSubgroup(proto)];
    const group = dataRaw['item-group'][subgroup.group];
    groupsUsed.add(group.name);

    if (M.isRecipePrototype(proto)) {
      const recipeData = recipeDataMap[proto.name];
      const [recipeIn, recipeInTemp] = recipeIngredientsMap[proto.name];
      const [_recipeOut, , , temps] = recipeResultsMap[proto.name];
      let [, recipeCatalyst] = recipeResultsMap[proto.name];

      // Convert fluid outputs to use correct ids
      const recipeOut = { ..._recipeOut };
      for (const outId of Object.keys(recipeOut)) {
        if (temps[outId] != null) {
          const temp = temps[outId];
          const index = Array.from(fluidTemps[outId]).indexOf(temp);
          if (index !== 0) {
            recipeOut[`${outId}-${temp}`] = recipeOut[outId];
            delete recipeOut[outId];
          }
        }
      }

      // Check for calculated catalysts
      for (const outId of Object.keys(recipeOut)) {
        if (
          recipeIn[outId] &&
          (recipeCatalyst == null || !recipeCatalyst[outId])
        ) {
          // Need to manually calculate and add catalyst amount for this item
          if (recipeCatalyst == null) recipeCatalyst = {};

          const amount = Math.min(recipeOut[outId], recipeIn[outId]);
          recipeCatalyst[outId] = amount;
        }
      }

      let producers = producersMap.crafting[proto.category ?? 'crafting'];
      if (producers != null) {
        // Ensure producers have sufficient fluid boxes
        const fluidIngredients = Object.keys(recipeIn)
          .map((i) => itemMap[i])
          .filter((i) => M.isFluidPrototype(i));
        if (fluidIngredients.length > 0) {
          producers = producers.filter((p) => {
            const fluidBoxes = craftingFluidBoxes[p];
            const inputFluidBoxes = fluidBoxes.filter(
              (f) =>
                f.production_type === 'input' ||
                f.production_type === 'input-output',
            );
            const usedIndices = new Set<number>();
            for (const ingredient of fluidIngredients) {
              const availableFluidBoxes = inputFluidBoxes.filter(
                (_, i) => !usedIndices.has(i),
              );
              if (availableFluidBoxes.length === 0) return false;

              const filterFluidBox = availableFluidBoxes.find(
                (f) => f.filter === ingredient.name,
              );
              if (filterFluidBox != null) {
                usedIndices.add(inputFluidBoxes.indexOf(filterFluidBox));
              } else {
                const fluidBox = availableFluidBoxes[0];
                usedIndices.add(inputFluidBoxes.indexOf(fluidBox));
              }
            }

            return true;
          });
        }
        const fluidProducts = Object.keys(_recipeOut)
          .map((i) => itemMap[i])
          .filter((i) => M.isFluidPrototype(i));
        if (fluidProducts.length > 0) {
          producers = producers.filter((p) => {
            const fluidBoxes = craftingFluidBoxes[p];
            const outputFluidBoxes = fluidBoxes.filter(
              (f) => f.production_type === 'output',
            );
            const usedIndices = new Set<number>();
            for (const product of fluidProducts) {
              const availableFluidBoxes = outputFluidBoxes.filter(
                (_, i) => !usedIndices.has(i),
              );
              if (availableFluidBoxes.length === 0) return false;

              const filterFluidBox = availableFluidBoxes.find(
                (f) => f.filter === product.name,
              );
              if (filterFluidBox != null) {
                usedIndices.add(outputFluidBoxes.indexOf(filterFluidBox));
              } else {
                const fluidBox = availableFluidBoxes[0];
                usedIndices.add(outputFluidBoxes.indexOf(fluidBox));
              }
            }

            return true;
          });
        }

        const recipeInOptions = getRecipeInOptions(recipeIn, recipeInTemp);
        // For each set of valid fluid temperature inputs, generate a recipe
        const icon = await getIcon(proto);
        for (let i = 0; i < recipeInOptions.length; i++) {
          // For first option, use proto name, for others append index
          const [recipeIn, ids] = recipeInOptions[i];
          const id = i === 0 ? proto.name : `${proto.name}-${ids.join('-')}`;

          if (proto.name === 'ore-tin') {
            console.log(recipeInTemp);
          }

          const recipe: Recipe = {
            id,
            name: recipeLocale.names[proto.name],
            category: subgroup.group,
            row: getRecipeRow(proto),
            time: recipeData.energy_required ?? 0.5,
            producers,
            in: recipeIn,
            /**
             * Already calculated when determining included recipes.
             * Note: Output temperatures do not vary
             */
            out: recipeOut,
            catalyst: recipeCatalyst,
            unlockedBy: recipesUnlocked[proto.name],
            icon,
          };

          if (i > 0) {
            recipe.icon = recipe.icon ?? proto.name;
            // Add recipe temperature variants to relevant limitations
            for (const limitationId of Object.keys(modData.limitations)) {
              const limitation = modData.limitations[limitationId];
              if (limitation.includes(proto.name)) limitation.push(id);
            }
          }

          modData.recipes.push(recipe);
        }
      } else {
        modDataReport.noProducers.push(proto.name);
      }
    } else if (M.isFluidPrototype(proto)) {
      // Check for offshore pump recipes
      for (const pumpName of Object.keys(machines.offshorePump)) {
        const entityName = machines.offshorePump[pumpName];
        const offshorePump = dataRaw['offshore-pump'][entityName];
        if (offshorePump.fluid === proto.name) {
          // Found an offshore pump recipe
          const id = getFakeRecipeId(
            proto.name,
            `${pumpName}-${proto.name}-pump`,
          );
          const out = offshorePump.pumping_speed * 60;
          const recipe: Recipe = {
            id,
            name: `${itemLocale.names[pumpName]} : ${
              fluidLocale.names[proto.name]
            }`,
            category: group.name,
            row: getRecipeRow(proto),
            time: 1,
            in: {},
            out: { [proto.name]: out },
            producers: [pumpName],
          };
          modData.recipes.push(recipe);
        }
      }

      // Check for boiler recipes
      for (const boilerName of Object.keys(machines.boiler)) {
        const entityName = machines.boiler[boilerName];
        const boiler = dataRaw.boiler[entityName];
        if (boiler.output_fluid_box.filter === proto.name) {
          if (boiler.fluid_box.filter == null) continue;
          const inputProto = dataRaw.fluid[boiler.fluid_box.filter];
          let outputId = proto.name;
          if (boiler.target_temperature !== [...fluidTemps[proto.name]][0]) {
            outputId = `${proto.name}-${boiler.target_temperature}`;
          }

          // Found a boiler recipe
          const id = getFakeRecipeId(
            proto.name,
            `${boilerName}-${proto.name}-boil`,
          );

          const tempDiff =
            boiler.target_temperature - inputProto.default_temperature;
          const energyReqd =
            tempDiff * getEnergyInMJ(inputProto.heat_capacity ?? '1KJ') * 1000;

          const recipe: Recipe = {
            id,
            name: `${itemLocale.names[boilerName]} : ${
              fluidLocale.names[proto.name]
            }`,
            category: group.name,
            row: getRecipeRow(proto),
            time: round(energyReqd, 10),
            in: { [inputProto.name]: 1 },
            out: { [outputId]: 1 },
            producers: [boilerName],
          };
          modData.recipes.push(recipe);
        }
      }
    } else {
      // Check for rocket launch recipes
      for (const launch_proto of protosSorted) {
        if (
          // Must be an item
          !D.isAnyItemPrototype(launch_proto) ||
          // Ignore if already processed
          processedLaunchProto.has(launch_proto.name) ||
          // Ignore if no launch products
          (launch_proto.rocket_launch_product == null &&
            launch_proto.rocket_launch_products == null)
        )
          continue;

        const [recipeOut, recipeCatalyst] = getProducts(
          launch_proto.rocket_launch_products ??
            (launch_proto.rocket_launch_product
              ? [launch_proto.rocket_launch_product]
              : undefined),
        );

        if (recipeOut[proto.name]) {
          // Found rocket launch recipe
          for (const siloName of Object.keys(machines.silo)) {
            const entityName = machines.silo[siloName];
            const silo = dataRaw['rocket-silo'][entityName];

            const partRecipes: M.RecipePrototype[] = [];
            if (silo.fixed_recipe) {
              partRecipes.push(dataRaw.recipe[silo.fixed_recipe]);
            } else {
              const categories = silo.crafting_categories;
              partRecipes.push(
                ...Object.keys(dataRaw.recipe)
                  .map((r) => dataRaw.recipe[r])
                  .filter((r) => categories.includes(r.category ?? 'crafting')),
              );
            }

            for (const partRecipe of partRecipes) {
              const isFixed = silo.fixed_recipe === partRecipe.name;
              const alternateId = isFixed
                ? `${siloName}-${launch_proto.name}-launch`
                : `${siloName}-${launch_proto.name}-${partRecipe.name}-launch`;
              const id = getFakeRecipeId(proto.name, alternateId);

              const name = isFixed
                ? `${itemLocale.names[siloName]} : ${
                    itemLocale.names[proto.name]
                  }`
                : `${itemLocale.names[siloName]} : ${
                    itemLocale.names[proto.name]
                  } (${recipeLocale.names[partRecipe.name]})`;

              const recipeIn: Record<string, number> = {
                [launch_proto.name]: 1,
              };

              // Add rocket parts
              let part: string | undefined;
              const partRecipeData = getRecipeData(partRecipe);
              const [partRecipeProducts, _] = getProducts(
                partRecipeData.results,
                partRecipeData.result,
                partRecipeData.result_count,
              );
              for (const id of Object.keys(partRecipeProducts)) {
                recipeIn[id] =
                  partRecipeProducts[id] * silo.rocket_parts_required;
                part = id;
              }

              if (part == null) continue;

              const recipe: Recipe = {
                id,
                name,
                category: group.name,
                row: getRecipeRow(proto),
                time: 40.6, // Ignored for silo recipes in calculator
                in: recipeIn,
                out: recipeOut,
                catalyst: recipeCatalyst,
                part,
                producers: [siloName],
              };
              modData.recipes.push(recipe);
            }
            processedLaunchProto.add(launch_proto.name);
          }
        }
      }

      // Check for burn recipes
      if (
        D.isAnyItemPrototype(proto) &&
        proto.burnt_result &&
        proto.fuel_category
      ) {
        // Found burn recipe
        const id = getFakeRecipeId(proto.burnt_result, `${proto.name}-burn`);
        const recipe: Recipe = {
          id,
          name: `${itemLocale.names[proto.name]} : ${
            itemLocale.names[proto.burnt_result]
          }`,
          category: group.name,
          row: getRecipeRow(proto),
          time: 1,
          in: { [proto.name]: 0 },
          out: { [proto.burnt_result]: 0 },
          producers: producersMap.burner[proto.fuel_category],
          isBurn: true,
        };
        modData.recipes.push(recipe);
      }
    }
  }

  const resourceHash = new Set<string>();
  for (const name of Object.keys(dataRaw.resource)) {
    const resource = dataRaw.resource[name];
    if (resource && resource.minable) {
      // Found mining recipe
      const minable = resource.minable;
      let miners = producersMap.resource[resource.category ?? 'basic-solid'];
      const recipeIn: Record<string, number> = {};
      const recipeInTemp: Record<
        string,
        [number | undefined, number | undefined]
      > = {};
      if (minable.required_fluid && minable.fluid_amount) {
        const amount = minable.fluid_amount / 10;
        recipeIn[minable.required_fluid] = amount;
        recipeInTemp[minable.required_fluid] = [undefined, undefined];
        miners = miners.filter((m) => {
          // Only allow producers with fluid boxes
          const entity = entityMap[m];
          if (entity != null && M.isMiningDrillPrototype(entity))
            return entity.input_fluid_box != null;

          const item = itemMap[m];
          if (item != null && !M.isFluidPrototype(item) && item.place_result) {
            const miningDrill = dataRaw['mining-drill'][item.place_result];
            return miningDrill.input_fluid_box != null;
          }

          // Seems to be an invalid entry
          return false;
        });
      }

      const [recipeOut, recipeCatalyst, total] = getProducts(
        minable.results,
        minable.result,
        minable.count,
      );

      const proto = itemMap[Object.keys(recipeOut)[0]];
      if (proto != null) {
        const subgroup = dataRaw['item-subgroup'][getSubgroup(proto)];
        const group = dataRaw['item-group'][subgroup.group];
        const fakeId = getFakeRecipeId(proto.name, `${name}-mining`);

        const recipeInOptions = getRecipeInOptions(recipeIn, recipeInTemp);
        recipeInOptions.forEach(([recipeIn, ids], i) => {
          const id = i === 0 ? fakeId : `${fakeId}-${ids.join('-')}`;

          const recipe: Recipe = {
            id: '',
            name: M.isFluidPrototype(proto)
              ? fluidLocale.names[proto.name]
              : itemLocale.names[proto.name],
            category: group.name,
            row: getRecipeRow(proto),
            time: minable.mining_time,
            in: recipeIn,
            out: recipeOut,
            catalyst: recipeCatalyst,
            cost: 100 / total,
            isMining: true,
            producers: miners,
          };

          const hash = JSON.stringify(recipe);
          if (resourceHash.has(hash)) {
            modDataReport.resourceDuplicate.push(name);
          } else {
            recipe.id = id;
            modData.recipes.push(recipe);
            resourceHash.add(hash);
          }
        });
      } else {
        modDataReport.resourceNoMinableProducts.push(name);
      }
    }
  }

  const sortedProtoIds = protosSorted.map((p) => p.name);

  const technologies = Array.from(technologySet).sort((a, b) => {
    // First, sort by number of ingredients
    const aData = a[mode] || (a as M.TechnologyData);
    const bData = b[mode] || (b as M.TechnologyData);
    const aIngredients = coerceArray(aData.unit.ingredients);
    const bIngredients = coerceArray(bData.unit.ingredients);

    if (aIngredients.length !== bIngredients.length) {
      return aIngredients.length - bIngredients.length;
    }

    // Second, sort by sort order of the last ingredient
    const aLastIngredient = getLastIngredient(aIngredients);
    const bLastIngredient = getLastIngredient(bIngredients);
    if (aLastIngredient !== bLastIngredient) {
      return (
        sortedProtoIds.indexOf(aLastIngredient) -
        sortedProtoIds.indexOf(bLastIngredient)
      );
    }

    // Third, sort by prototype order field
    return orString(a.order).localeCompare(orString(b.order));
  });

  const labs = Object.keys(machines.lab);
  const technologyIds = technologies.map((t) => t.name);
  for (const techRaw of technologies) {
    const techData = techDataMap[techRaw.name];
    const technology: Technology = {};
    const id = techId[techRaw.name];
    const prerequisites = coerceArray(techData.prerequisites);
    if (prerequisites?.length) {
      technology.prerequisites = prerequisites
        // Ignore any disabled or hidden prerequisites
        .filter((p) => technologyIds.includes(p))
        .map((p) => techId[p]);
    }

    const inputs = Object.keys(techIngredientsMap[techRaw.name]);
    const row = inputs.length;
    const producers = labs.filter((l) => {
      const lab = dataRaw.lab[machines.lab[l]];
      const labInputs = coerceArray(lab.inputs);
      return inputs.every((i) => labInputs.includes(i));
    });

    const recipe: Recipe = {
      id,
      name: techLocale.names[techRaw.name],
      category: 'technology',
      row,
      time: techData.unit.time,
      producers,
      in: techIngredientsMap[techRaw.name],
      out: { [id]: 1 },
      isTechnology: true,
      icon: await getIcon(techRaw),
      iconText: getIconText(techRaw),
    };
    modData.recipes.push(recipe);

    const item: Item = {
      id,
      name: recipe.name,
      category: recipe.category,
      row,
      technology,
      icon: recipe.icon,
      iconText: recipe.iconText,
    };

    if (inputs.length) {
      const firstInput = itemMap[inputs[0]];
      if (!M.isFluidPrototype(firstInput)) {
        item.stack = firstInput.stack_size;
      }
    }

    modData.items.push(item);
  }

  for (const id of groupsUsed) {
    const itemGroup = dataRaw['item-group'][id];
    const category: Category = {
      id,
      name: groupLocale.names[id],
      icon: await getIcon(itemGroup),
    };
    modData.categories.push(category);
  }

  let icon = 'lab';
  let lab = modData.items.find((i) => i.id === icon);
  if (lab == null) {
    lab = modData.items.find((i) => i.id.indexOf('lab') !== -1);
    if (lab == null) {
      throw 'Technology icon not found';
    } else {
      icon = lab.icon ?? lab.id;
    }
  } else if (lab.icon != null) {
    icon = lab.icon;
  }

  modData.categories.push({
    id: 'technology',
    name: 'Technology',
    icon,
  });

  // Filter out recipes with no producers
  modData.recipes = modData.recipes.filter((r) => {
    if (!r.producers?.length) {
      modDataReport.noProducers.push(r.id);
      return false;
    }

    return true;
  });

  // Sprite sheet
  logTime('Generating sprite sheet');
  spritesmith.run(
    { src: Object.keys(iconFiles), padding: 2 },
    async (_, result) => {
      const modIconsPath = `${modPath}/icons.webp`;
      await sharp(result.image).webp().toFile(modIconsPath);

      modData.icons = await Promise.all(
        Object.keys(result.coordinates).map(async (file) => {
          const coords = result.coordinates[file];
          return {
            id: iconFiles[file],
            position: `${-coords.x}px ${-coords.y}px`,
            color: iconColors[file],
          };
        }),
      );

      logTime('Writing data');
      writeData();
      logTime('Complete');

      const warnings = (
        Object.keys(modDataReport) as (keyof D.ModDataReport)[]
      ).some((k) => modDataReport[k].length);

      if (warnings) logWarn('\nWARNINGS:');

      if (modDataReport.noProducers.length) {
        logWarn(
          `Recipes with no producers: ${modDataReport.noProducers.length}`,
        );
        console.log('These recipes have been removed.');
      }

      if (modDataReport.noProducts.length) {
        logWarn(`Recipes with no products: ${modDataReport.noProducts.length}`);
        console.log('These recipes have been removed.');
      }

      if (modDataReport.resourceNoMinableProducts.length) {
        logWarn(
          `Resources with no minable products: ${modDataReport.resourceNoMinableProducts.length}`,
        );
        console.log('No mining recipe is generated for these resources.');
      }

      if (modDataReport.resourceDuplicate.length) {
        logWarn(
          `Resource duplicates: ${modDataReport.resourceDuplicate.length}`,
        );
        console.log(
          'Only one mining resource is generated for duplicate resources',
        );
      }

      if (warnings) {
        console.log('\nSee scripts/temp/data-report.json for details');
      }
    },
  );
}

processMod();
