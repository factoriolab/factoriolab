import { getAverageColor } from 'fast-average-color-node';
import fs from 'fs';
import sharp from 'sharp';
import spritesmith from 'spritesmith';
import { data } from 'src/data';

import { coalesce, spread } from '~/helpers';
import { CategoryJson } from '~/models/data/category';
import { DefaultsJson } from '~/models/data/defaults';
import { FuelJson } from '~/models/data/fuel';
import { ItemJson } from '~/models/data/item';
import { MachineJson } from '~/models/data/machine';
import { ModData } from '~/models/data/mod-data';
import { ModHash } from '~/models/data/mod-hash';
import { ModI18n } from '~/models/data/mod-i18n';
import { RecipeFlag, RecipeJson } from '~/models/data/recipe';
import { TechnologyJson } from '~/models/data/technology';
import { flags } from '~/models/flags';
import { Entities, Optional } from '~/models/utils';

import {
  AsteroidPrototype,
  FluidBox,
  FluidPrototype,
  isAgriculturalTowerPrototype,
  isAssemblingMachinePrototype,
  isAsteroidCollectorPrototype,
  isBeaconPrototype,
  isBoilerPrototype,
  isCargoWagonPrototype,
  isChangeRecipeProductivityModifier,
  isCreateAsteroidChunkEffectItem,
  isCreateEntityTriggerEffectItem,
  isFluidPrototype,
  isFluidWagonPrototype,
  isFurnacePrototype,
  isItemGroup,
  isLabPrototype,
  isMiningDrillPrototype,
  isModulePrototype,
  isOffshorePumpPrototype,
  isPlanetPrototype,
  isPumpPrototype,
  isReactorPrototype,
  isRecipePrototype,
  isResearchProgressProductPrototype,
  isRocketSiloPrototype,
  isSpaceConnectionPrototype,
  isSpaceLocationPrototype,
  isSurfacePrototype,
  isTechnologyPrototype,
  isTransportBeltPrototype,
  isUnlockRecipeModifier,
  ItemGroup,
  PlantPrototype,
  ProductPrototype,
  RecipePrototype,
  SpaceConnectionPrototype,
  SpaceLocationPrototype,
  SurfaceCondition,
  TechnologyPrototype,
} from './factorio.models';
import {
  anyEntityKeys,
  AnyEntityPrototype,
  anyItemKeys,
  AnyItemPrototype,
  AnyLocationPrototype,
  DataRawDump,
  isAnyItemPrototype,
  isFluidProduct,
  Locale,
  MachineProto,
  ModDataReport,
} from './factorio-build.models';
import {
  addEntityValue,
  coerceArray,
  coerceString,
  getAllowedLocations,
  getEntityMap,
  getIconText,
  getIngredients,
  getItemMap,
  getLastIngredient,
  getLocations,
  getSurfacePropertyDefaults,
  getVersion,
  pushEntityValue,
  updateHash,
} from './helpers/data.helpers';
import {
  factorioPath,
  getJsonData,
  getLocale,
  tryGetLocale,
} from './helpers/file.helpers';
import { logTime, logWarn } from './helpers/log.helpers';
import { getEnergyInMJ, round } from './helpers/power.helpers';
import {
  getBeacon,
  getBelt,
  getCargoWagon,
  getEntitySize,
  getFluidWagon,
  getMachineBaseEffect,
  getMachineDisallowedEffects,
  getMachineDrain,
  getMachineHideRate,
  getMachineIngredientUsage,
  getMachineModules,
  getMachinePollution,
  getMachineSilo,
  getMachineSpeed,
  getMachineType,
  getMachineUsage,
  getPipe,
  getRecipeDisallowedEffects,
} from './helpers/proto.helpers';

/**
 * This script is intended to pull files from a dump from Factorio and build
 * files required by the calculator. If the files already exist, should use
 * existing defaults and append to the hash list.
 */

const modId = process.argv[2];
if (!modId)
  throw new Error(
    'Please specify a mod to process by the folder name, e.g. "1.1" for src/data/1.1',
  );

const lang: Optional<string> = process.argv[3];

const mod = data.mods.find((m) => m.id === modId);
if (!mod)
  throw new Error(
    'Please define this mod set in `src/data/index.ts` before running build.',
  );

// Set up paths
const modsPath = `${factorioPath}/mods`;
const scriptOutputPath = `${factorioPath}/script-output`;
const dataRawPath = `${scriptOutputPath}/data-raw-dump.json`;
const tempPath = './scripts/temp';
const tempIconsPath = `${tempPath}/icons`;
const modPath = `./src/data/${modId}`;
const modDataPath = `${modPath}/data.json`;
const modHashPath = `${modPath}/hash.json`;
const modDefaultsPath = `${modPath}/defaults.json`;
const modFlags = flags[mod.flags];

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
  const spaceLocationLocale = getLocale('space-location-locale.json');
  const techLocale = getLocale('technology-locale.json');
  const entityLocale = getLocale('entity-locale.json');
  // Not generated when the `space-age` mod is disabled:
  const spaceConnectionLocale = tryGetLocale('space-connection-locale.json');
  const surfaceLocale = tryGetLocale('surface-locale.json');

  // Read main data JSON
  const dataRaw = getJsonData(dataRawPath) as DataRawDump;

  // Set up collections
  // Record of technology ids by raw id: factoriolab id
  const techId: Record<string, string> = {};

  const itemMap = getItemMap(dataRaw);
  const entityMap = getEntityMap(dataRaw);
  const surfacePropertyDefaults = getSurfacePropertyDefaults(dataRaw);
  const allLocations = getLocations(dataRaw);

  function getDataAllowedLocations(
    surface_conditions: Optional<SurfaceCondition[]>,
  ): Optional<AnyLocationPrototype[]> {
    return getAllowedLocations(
      surface_conditions,
      allLocations,
      surfacePropertyDefaults,
    );
  }

  function getLocaleName(locale: Locale, key: string): string {
    const name = locale.names[key];
    return name.replaceAll(/\[(.*?)\]/g, '');
  }

  function getRecipeProduct(
    recipe: RecipePrototype,
  ): AnyItemPrototype | FluidPrototype | undefined {
    if (recipe.results?.length === 1) {
      const result = recipe.results[0];
      if (isFluidProduct(result)) return dataRaw.fluid[result.name];
      // TODO: Handle research progress products
      else if (isResearchProgressProductPrototype(result)) return undefined;
      else return itemMap[result.name];
    } else if (recipe.results && recipe.main_product) {
      const mainProduct = recipe.main_product;
      const result = recipe.results.find(
        (r) => !isResearchProgressProductPrototype(r) && r.name === mainProduct,
      );
      if (result) {
        if (isFluidProduct(result)) return dataRaw.fluid[result.name];
        // TODO: Handle research progress products
        else if (isResearchProgressProductPrototype(result)) return undefined;
        else return itemMap[result.name];
      } else {
        throw new Error(
          `Main product '${mainProduct}' declared by recipe '${recipe.name}' not found in results`,
        );
      }
    } else {
      return undefined;
    }
  }

  function getRecipeSubgroup(recipe: RecipePrototype): string {
    if (recipe.subgroup) return recipe.subgroup;

    const product = getRecipeProduct(recipe);
    if (product) return getSubgroup(product);

    return 'other';
  }

  function getSubgroup(
    proto:
      | AnyItemPrototype
      | AnyEntityPrototype
      | AnyLocationPrototype
      | FluidPrototype
      | RecipePrototype
      | SpaceLocationPrototype
      | SpaceConnectionPrototype
      | PlantPrototype,
  ): string {
    if (proto.subgroup) return proto.subgroup;

    if (isRecipePrototype(proto)) return getRecipeSubgroup(proto);
    else if (isFluidPrototype(proto)) return 'fluid';
    else return 'other';
  }

  let lastItemRow = 0;
  let lastItemGroup = '';
  let lastItemSubgroup = '';
  function getItemRow(
    item: AnyItemPrototype | AnyEntityPrototype | FluidPrototype,
  ): number {
    const subgroup = dataRaw['item-subgroup'][getSubgroup(item)];
    if (subgroup.group === lastItemGroup) {
      if (subgroup.name !== lastItemSubgroup) lastItemRow++;
    } else lastItemRow = 0;

    lastItemGroup = subgroup.group;
    lastItemSubgroup = subgroup.name;
    return lastItemRow;
  }

  let lastRecipeRow = 0;
  let lastRecipeGroup = '';
  let lastRecipeSubgroup = '';
  function getRecipeRow(
    proto:
      | RecipePrototype
      | AnyItemPrototype
      | AnyEntityPrototype
      | FluidPrototype
      | SpaceLocationPrototype
      | SpaceConnectionPrototype
      | PlantPrototype,
  ): number {
    const subgroupId = getSubgroup(proto);
    const subgroup = dataRaw['item-subgroup'][subgroupId];
    if (subgroup.group === lastRecipeGroup) {
      if (subgroup.name !== lastRecipeSubgroup) lastRecipeRow++;
    } else lastRecipeRow = 0;

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
      | AnyItemPrototype
      | AnyEntityPrototype
      | AnyLocationPrototype
      | FluidPrototype
      | ItemGroup
      | RecipePrototype
      | TechnologyPrototype
      | SpaceConnectionPrototype
      | SpaceLocationPrototype
      | PlantPrototype,
  ): Promise<string | undefined> {
    const id = isTechnologyPrototype(spec) ? techId[spec.name] : spec.name;

    // If recipe has no declared icon, get product icon
    if (isRecipePrototype(spec) && spec.icon == null && spec.icons == null) {
      const product = getRecipeProduct(spec);
      if (product != null) spec = product;
    }

    // If recipe still has no product icon, calculator will pick first product
    if (
      !isRecipePrototype(spec) &&
      spec.icon == null &&
      (isSurfacePrototype(spec) || spec.icons == null)
    )
      throw new Error(`No icons for proto ${spec.name}`);

    let iconId = id;

    let hash = `${JSON.stringify(spec.icon)}.${JSON.stringify(
      spec.icon_size,
    )}.`;
    if (!isSurfacePrototype(spec)) hash += JSON.stringify(spec.icons);
    if (iconHash[hash]) {
      iconId = iconHash[hash];
    } else {
      if (iconSet.has(iconId)) {
        // Find alternate id
        let i = 0;
        let altId: string;
        do {
          const altIdNum = i++;
          altId = `${iconId}-${altIdNum.toString()}`;
        } while (iconSet.has(altId));
        iconId = altId;
      }

      iconHash[hash] = iconId;
      iconSet.add(iconId);

      let folder = 'item';
      if (isRecipePrototype(spec)) folder = 'recipe';
      else if (isFluidPrototype(spec)) folder = 'fluid';
      else if (isTechnologyPrototype(spec)) folder = 'technology';
      else if (isItemGroup(spec)) folder = 'item-group';
      else if (isAnyItemPrototype(spec)) folder = 'item';
      else if (isSurfacePrototype(spec)) folder = 'surface';
      else if (isSpaceConnectionPrototype(spec)) folder = 'space-connection';
      else if (isSpaceLocationPrototype(spec) || isPlanetPrototype(spec))
        folder = 'space-location';
      else folder = 'entity';

      const path = `${scriptOutputPath}/${folder}/${spec.name}.png`;
      await resizeIcon(path, iconId);
    }

    return iconId === id ? undefined : iconId;
  }

  const craftingFluidBoxes: Record<string, FluidBox[]> = {};
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
  type ProducerType =
    | 'burner'
    | 'crafting'
    | 'resource'
    | 'asteroid'
    | 'spoil'
    | 'agriculture';
  const producersMap: Record<ProducerType, Record<string, string[]>> = {
    burner: {},
    crafting: {},
    resource: {},
    asteroid: {},
    spoil: { ['']: ['spoilage'] },
    agriculture: {},
  };
  function addProducers(
    id: string,
    categories: string[],
    type: ProducerType,
  ): void {
    const record = producersMap[type];

    for (const category of categories) {
      if (record[category] == null) record[category] = [];
      record[category].push(id);
    }
  }

  function processProducers(proto: MachineProto, name: string): void {
    if (isMiningDrillPrototype(proto))
      addProducers(name, proto.resource_categories, 'resource');

    if (
      !isOffshorePumpPrototype(proto) &&
      proto.energy_source.type === 'burner' &&
      proto.energy_source.fuel_categories
    )
      addProducers(name, proto.energy_source.fuel_categories, 'burner');

    if (
      isAssemblingMachinePrototype(proto) ||
      isRocketSiloPrototype(proto) ||
      isFurnacePrototype(proto)
    ) {
      addProducers(name, proto.crafting_categories, 'crafting');
      if (proto.fluid_boxes == null) craftingFluidBoxes[name] = [];
      else if (Array.isArray(proto.fluid_boxes))
        craftingFluidBoxes[name] = proto.fluid_boxes;
      else {
        craftingFluidBoxes[name] = [];
        for (let i = 1; proto.fluid_boxes[i] != null; i++)
          craftingFluidBoxes[name].push(proto.fluid_boxes[i]);
      }
    }

    if (isBoilerPrototype(proto)) {
      machines.boiler[name] = proto.name;
    } else if (isRocketSiloPrototype(proto)) {
      machines.silo[name] = proto.name;
    } else if (isLabPrototype(proto)) {
      machines.lab[name] = proto.name;
    } else if (isOffshorePumpPrototype(proto)) {
      machines.offshorePump[name] = proto.name;
    }

    if (isAsteroidCollectorPrototype(proto))
      addProducers(name, [''], 'asteroid');

    if (isAgriculturalTowerPrototype(proto))
      addProducers(name, [''], 'agriculture');
  }

  const ANY_FLUID_BURN = 'fluid';
  const ANY_FLUID_HEAT = 'fluid-heat';
  function getMachineCategory(proto: MachineProto): string[] | undefined {
    if (isOffshorePumpPrototype(proto)) return undefined;

    if (
      proto.energy_source.type === 'burner' &&
      proto.energy_source.fuel_categories
    )
      return proto.energy_source.fuel_categories;

    if (proto.energy_source.type === 'fluid') {
      if (proto.energy_source.fluid_box.filter != null)
        return [proto.energy_source.fluid_box.filter];

      if (proto.energy_source.burns_fluid) return [ANY_FLUID_BURN];

      return [ANY_FLUID_HEAT];
    }

    return undefined;
  }

  function getProducts(
    results: ProductPrototype[] | Record<string, ProductPrototype> | undefined,
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
        if (isResearchProgressProductPrototype(product)) continue;
        if (isFluidProduct(product)) {
          const fluid = dataRaw.fluid[product.name];
          const temp = product.temperature ?? fluid.default_temperature;
          temps[product.name] = temp;
          addFluidTemp(product.name, temp);
        }

        // TODO: Handle research progress products
        let amount = product.amount;
        if (
          amount == null &&
          product.amount_max != null &&
          product.amount_min != null
        ) {
          amount = (product.amount_max + product.amount_min) / 2;
        }

        if (amount == null) continue;

        if (product.probability) amount = amount * product.probability;

        addEntityValue(record, product.name, amount);

        if (product.ignored_by_productivity) {
          if (catalyst == null) catalyst = {};

          addEntityValue(
            catalyst,
            product.name,
            product.ignored_by_productivity,
          );
        }

        total += amount;
      }
    } else if (result && result_count) {
      addEntityValue(record, result, result_count);
      total += result_count;
    }

    return [record, catalyst, total, temps];
  }

  function getMachine(
    proto: MachineProto,
    name: string,
  ): MachineJson | undefined {
    const machine: MachineJson = {
      speed: getMachineSpeed(proto),
      modules: getMachineModules(proto),
      disallowedEffects: getMachineDisallowedEffects(proto),
      type: getMachineType(proto),
      fuelCategories: getMachineCategory(proto),
      usage: getMachineUsage(proto),
      drain: getMachineDrain(proto),
      pollution: getMachinePollution(proto),
      silo: getMachineSilo(proto),
      size: getEntitySize(proto),
      baseEffect: getMachineBaseEffect(proto),
      entityType: proto.type,
      hideRate: getMachineHideRate(proto),
      locations: getDataAllowedLocations(proto.surface_conditions)?.map(
        (l) => l.name,
      ),
      ingredientUsage: getMachineIngredientUsage(proto),
    };

    if (machine.speed === 0) {
      modDataReport.machineSpeedZero.push(name);
      return undefined;
    }

    processProducers(proto, name);

    return machine;
  }

  const modData: ModData = {
    version: {},
    categories: [],
    icons: [],
    items: [],
    recipes: [],
  };

  const modDataReport: ModDataReport = {
    machineSpeedZero: [],
    noProducers: [],
    resourceNoMinableProducts: [],
    resourceDuplicate: [],
  };

  function writeData(): void {
    if (lang) {
      function entityNames(list: { id: string; name: string }[]): Entities {
        return list.reduce((e: Entities, i) => {
          e[i.id] = i.name;
          return e;
        }, {});
      }
      const modI18n: ModI18n = {
        categories: entityNames(modData.categories),
        items: entityNames(modData.items),
        recipes: entityNames(modData.recipes),
      };
      if (modData.locations) modI18n.locations = entityNames(modData.locations);
      const modI18nPath = `${modPath}/i18n/${lang}.json`;
      fs.writeFileSync(modI18nPath, JSON.stringify(modI18n));
      console.log(lang);
      return;
    }

    const modDefaults = getJsonData(modDefaultsPath) as DefaultsJson | null;
    if (modDefaults) {
      modData.defaults = modDefaults;
    }
    if (fs.existsSync(modDataPath)) {
      const oldHash = getJsonData(modHashPath) as ModHash;

      if (modData.defaults?.excludedRecipes) {
        // Filter excluded recipes for only recipes that exist
        modData.defaults.excludedRecipes =
          modData.defaults.excludedRecipes.filter((e) =>
            modData.recipes.some((r) => r.id === e),
          );
      }

      updateHash(modData, oldHash, modFlags);
      fs.writeFileSync(modHashPath, JSON.stringify(oldHash));
    } else {
      const modHash: ModHash = {
        items: modData.items.map((i) => i.id),
        beacons: modData.items.filter((i) => i.beacon).map((i) => i.id),
        belts: modData.items.filter((i) => i.belt).map((i) => i.id),
        fuels: modData.items.filter((i) => i.fuel).map((i) => i.id),
        wagons: modData.items
          .filter((i) => i.cargoWagon ?? i.fluidWagon)
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
  const recipesLocked = new Set<string>();
  const prodUpgrades: Record<string, string[]> = {};
  const technologySet = new Set<TechnologyPrototype>();
  const technologyUnlocks: Record<string, string[]> = {};
  for (const key of Object.keys(dataRaw.technology)) {
    const tech = dataRaw.technology[key];

    if (
      itemMap[tech.name] ||
      entityMap[tech.name] ||
      dataRaw.recipe[tech.name] ||
      dataRaw['item-group'][tech.name]
    ) {
      techId[tech.name] = `${tech.name}-technology`;
    } else {
      techId[tech.name] = tech.name;
    }

    if (!tech.hidden && tech.enabled !== false) {
      technologySet.add(tech);
      const id = techId[tech.name];

      const upgradedRecipes = [];
      for (const effect of coerceArray(tech.effects)) {
        if (isUnlockRecipeModifier(effect)) {
          recipesLocked.add(effect.recipe);
          pushEntityValue(technologyUnlocks, id, effect.recipe);
        }

        if (isChangeRecipeProductivityModifier(effect))
          upgradedRecipes.push(effect.recipe);
      }
      if (upgradedRecipes.length) prodUpgrades[id] = upgradedRecipes;
    }
  }

  const recipesEnabled: Entities<RecipePrototype> = {};
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

    // Always include fixed recipes that have outputs
    if (!fixedRecipe.has(key)) {
      // Skip recipes that are not unlocked / enabled
      if (recipe.enabled === false && !recipesLocked.has(key)) continue;

      // Skip recipes that are hidden and disabled
      if (recipe.hidden && recipe.enabled === false) continue;
    }

    // Process recycling recipes later, after determining included items
    if (recipe.category === 'recycling') continue;

    // Don't include recipes with no inputs/outputs
    const ingredients = getIngredients(recipe.ingredients);
    const products = getProducts(recipe.results);
    if (
      Object.keys(ingredients[0]).length === 0 &&
      Object.keys(products[0]).length === 0
    )
      continue;

    recipesEnabled[recipe.name] = recipe;
    recipeIngredientsMap[recipe.name] = ingredients;
    recipeResultsMap[recipe.name] = products;
  }

  logTime('Processing data');
  // Include all modules by default
  const itemsUsed = new Set<string>(Object.keys(dataRaw.module));

  const itemKeys = anyItemKeys.reduce((result: string[], key) => {
    const data = dataRaw[key] ?? {};
    result.push(...Object.keys(data));
    return result;
  }, []);

  const entityKeys = anyEntityKeys.reduce((result: string[], key) => {
    result.push(...Object.keys(dataRaw[key] ?? {}));
    return result;
  }, []);

  // Check for burnt result / rocket launch products, fuels
  for (const key of itemKeys) {
    const item = itemMap[key];

    if (isFluidPrototype(item)) continue;

    if (item.fuel_value) itemsUsed.add(item.name);

    if (item.rocket_launch_products) {
      itemsUsed.add(item.name);

      if (item.rocket_launch_products) {
        for (const product of item.rocket_launch_products)
          itemsUsed.add(product.name);
      }
    }

    if (item.burnt_result) {
      itemsUsed.add(item.name);
      itemsUsed.add(item.burnt_result);
    }

    if (item.spoil_result) {
      itemsUsed.add(item.name);
      itemsUsed.add(item.spoil_result);
    }
  }

  // Add resources
  for (const name of Object.keys(dataRaw.resource)) {
    const resource = dataRaw.resource[name];
    if (resource?.minable) {
      const recipeOut = getProducts(
        resource.minable.results,
        resource.minable.result,
        resource.minable.count,
      )[0];
      for (const outKey of Object.keys(recipeOut)) itemsUsed.add(outKey);
    }
  }

  // Check for use in recipe ingredients / products
  for (const key of Object.keys(recipesEnabled)) {
    for (const ingredient of Object.keys(recipeIngredientsMap[key][0]))
      itemsUsed.add(ingredient);

    for (const product of Object.keys(recipeResultsMap[key][0]))
      itemsUsed.add(product);
  }

  // Check for use in technology ingredients
  const techIngredientsMap: Record<string, Record<string, number>> = {};
  for (const tech of technologySet) {
    const techIngredients = coerceArray(tech.unit?.ingredients).reduce(
      (e: Record<string, number>, [itemId, amount]) => {
        e[itemId] = amount;
        return e;
      },
      {},
    );

    for (const ingredient of Object.keys(techIngredients))
      itemsUsed.add(ingredient);

    techIngredientsMap[tech.name] = techIngredients;
  }

  // Add relevant recycling recipes
  for (const key of Object.keys(dataRaw.recipe)) {
    if (recipesEnabled[key]) continue;

    const recipe = dataRaw.recipe[key];
    if (recipe.category !== 'recycling') continue;

    // Only include recycling recipes with used items
    const ingredients = getIngredients(recipe.ingredients);
    const products = getProducts(recipe.results);

    if (
      !Object.keys(ingredients[0]).every((i) => itemsUsed.has(i)) ||
      !Object.keys(products[0]).every((i) => itemsUsed.has(i))
    )
      continue;

    technologyUnlocks['recycling'].push(recipe.name);
    recipesEnabled[recipe.name] = recipe;
    recipeIngredientsMap[recipe.name] = ingredients;
    recipeResultsMap[recipe.name] = products;
  }

  const itemsUsedProtos = Array.from(itemsUsed.values()).map(
    (key) => itemMap[key],
  );

  // Exclude any entities that are placed by the added items
  const placedEntities = new Set<string>();
  for (const proto of itemsUsedProtos) {
    if (!isFluidPrototype(proto) && proto.place_result != null)
      placedEntities.add(proto.place_result);
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
          | AnyItemPrototype
          | AnyEntityPrototype
          | FluidPrototype
          | RecipePrototype;
        sort: [string, string, string, string, string, string];
      } => {
        const subgroupId = getSubgroup(proto);
        const subgroup = dataRaw['item-subgroup'][subgroupId];
        const group = dataRaw['item-group'][subgroup.group];

        let order = proto.order;
        if (order == null && isRecipePrototype(proto))
          order = getRecipeProduct(proto)?.order;

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
        if (a.sort[i] !== b.sort[i]) return a.sort[i].localeCompare(b.sort[i]);
      }
      return a.sort[5].localeCompare(b.sort[5]);
    })
    .map((all) => all.proto);

  const groupsUsed = new Set<string>();

  // Process item protos
  for (const proto of protosSorted) {
    // Skip recipes until producers are processed
    if (isRecipePrototype(proto)) continue;

    const subgroup = dataRaw['item-subgroup'][getSubgroup(proto)];
    const group = dataRaw['item-group'][subgroup.group];
    groupsUsed.add(group.name);

    if (isFluidPrototype(proto)) {
      // Check for alternate temperatures from boilers
      for (const boilerName of Object.keys(dataRaw.boiler)) {
        const boiler = dataRaw.boiler[boilerName];
        if (
          boiler.output_fluid_box.filter === proto.name &&
          boiler.target_temperature &&
          boiler.target_temperature !== proto.default_temperature
        )
          addFluidTemp(proto.name, boiler.target_temperature);
      }

      let fuel: FuelJson | undefined;
      if (proto.fuel_value) {
        fuel = {
          category: ANY_FLUID_BURN,
          value: getEnergyInMJ(proto.fuel_value),
        };
      }

      const icon = await getIcon(proto);
      let temps = [proto.default_temperature];
      if (fluidTemps[proto.name] != null) temps = [...fluidTemps[proto.name]];

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
        const id = i === 0 ? proto.name : `${proto.name}-${temp.toString()}`;
        const itemTemp: ItemJson = {
          id,
          name: fluidLocale.names[proto.name],
          category: group.name,
          row: getItemRow(proto),
          icon,
          fuel,
        };

        if (i > 0 && itemTemp.icon == null) itemTemp.icon = proto.name;

        if (temp !== proto.default_temperature) {
          itemTemp.name += ` (${temp.toString()}°C)`;
          itemTemp.iconText = `${temp.toString()}°`;

          if (temp > proto.default_temperature) {
            // Add fluid heat fuel
            const tempDiff = temp - proto.default_temperature;
            const energyGenerated =
              tempDiff * getEnergyInMJ(proto.heat_capacity ?? '1KJ');
            const heatFuel: FuelJson = {
              category: ANY_FLUID_HEAT,
              value: round(energyGenerated, 10),
            };
            if (itemTemp.fuel == null) itemTemp.fuel = heatFuel;
            else {
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
    } else if (isBeaconPrototype(proto)) {
      modData.items.push({
        id: proto.name,
        name: entityLocale.names[proto.name],
        category: group.name,
        row: getItemRow(proto),
        icon: await getIcon(proto),
        beacon: getBeacon(proto),
      });
    } else if (
      isAssemblingMachinePrototype(proto) ||
      isBoilerPrototype(proto) ||
      isFurnacePrototype(proto) ||
      isLabPrototype(proto) ||
      isMiningDrillPrototype(proto) ||
      isOffshorePumpPrototype(proto) ||
      isReactorPrototype(proto) ||
      isRocketSiloPrototype(proto) ||
      isAsteroidCollectorPrototype(proto) ||
      isAgriculturalTowerPrototype(proto)
    ) {
      modData.items.push({
        id: proto.name,
        name: entityLocale.names[proto.name],
        category: group.name,
        row: getItemRow(proto),
        icon: await getIcon(proto),
        machine: getMachine(proto, proto.name),
      });
    } else if (isTransportBeltPrototype(proto)) {
      modData.items.push({
        id: proto.name,
        name: entityLocale.names[proto.name],
        category: group.name,
        row: getItemRow(proto),
        icon: await getIcon(proto),
        belt: getBelt(proto),
      });
    } else if (isPumpPrototype(proto)) {
      modData.items.push({
        id: proto.name,
        name: entityLocale.names[proto.name],
        category: group.name,
        row: getItemRow(proto),
        icon: await getIcon(proto),
        pipe: getPipe(proto),
      });
    } else if (isCargoWagonPrototype(proto)) {
      modData.items.push({
        id: proto.name,
        name: entityLocale.names[proto.name],
        category: group.name,
        row: getItemRow(proto),
        icon: await getIcon(proto),
        cargoWagon: getCargoWagon(proto),
      });
    } else if (isFluidWagonPrototype(proto)) {
      modData.items.push({
        id: proto.name,
        name: entityLocale.names[proto.name],
        category: group.name,
        row: getItemRow(proto),
        icon: await getIcon(proto),
        fluidWagon: getFluidWagon(proto),
      });
    } else {
      const item: ItemJson = {
        id: proto.name,
        name: itemLocale.names[proto.name],
        category: group.name,
        stack: proto.stack_size,
        row: getItemRow(proto),
        icon: await getIcon(proto),
      };

      if (proto.place_result) {
        let result = proto.place_result;
        /**
         * GH Issue #1310 - Freight Forwarding rocket silo appears to be placed
         * by a script on top of a `ff-rocket-silo-dummy` automatically, which
         * is a mining drill, so that the rocket silo is forced to be placed in
         * a specific place (leveraging drill placement rules). There does not
         * appear to be any connection between the entities in the raw data, so
         * this needs to be a hard-coded conversion.
         */
        if (result === 'ff-rocket-silo-dummy') result = 'rocket-silo';

        // Parse beacon
        if (dataRaw.beacon[result]) {
          const entity = dataRaw.beacon[result];
          item.beacon = getBeacon(entity);
        }

        // Parse machine
        if (dataRaw.boiler[result]) {
          const entity = dataRaw.boiler[result];
          item.machine = getMachine(entity, proto.name);
        } else if (dataRaw['assembling-machine'][result]) {
          const entity = dataRaw['assembling-machine'][result];
          item.machine = getMachine(entity, proto.name);
        } else if (dataRaw['rocket-silo'][result]) {
          const entity = dataRaw['rocket-silo'][result];
          item.machine = getMachine(entity, proto.name);
        } else if (dataRaw.furnace[result]) {
          const entity = dataRaw.furnace[result];
          item.machine = getMachine(entity, proto.name);
        } else if (dataRaw.lab[result]) {
          const entity = dataRaw.lab[result];
          item.machine = getMachine(entity, proto.name);
        } else if (dataRaw['mining-drill'][result]) {
          const entity = dataRaw['mining-drill'][result];
          item.machine = getMachine(entity, proto.name);
        } else if (dataRaw['offshore-pump'][result]) {
          const entity = dataRaw['offshore-pump'][result];
          item.machine = getMachine(entity, proto.name);
        } else if (dataRaw.reactor[result]) {
          const entity = dataRaw.reactor[result];
          item.machine = getMachine(entity, proto.name);
        } else if (dataRaw['asteroid-collector']?.[result]) {
          const entity = dataRaw['asteroid-collector'][result];
          item.machine = getMachine(entity, proto.name);
        } else if (dataRaw['agricultural-tower']?.[result]) {
          const entity = dataRaw['agricultural-tower'][result];
          item.machine = getMachine(entity, proto.name);
        }

        // Parse transport belt
        if (dataRaw['transport-belt'][result]) {
          const entity = dataRaw['transport-belt'][result];
          item.belt = getBelt(entity);
        }

        // Parse pipe
        if (dataRaw.pump[result]) {
          const entity = dataRaw.pump[result];
          item.pipe = getPipe(entity);
        }

        // Parse cargo wagon
        if (dataRaw['cargo-wagon'][result]) {
          const entity = dataRaw['cargo-wagon'][result];
          item.cargoWagon = getCargoWagon(entity);
        }

        // Parse fluid wagon
        if (dataRaw['fluid-wagon'][result]) {
          const entity = dataRaw['fluid-wagon'][result];
          item.fluidWagon = getFluidWagon(entity);
        }
      } else if (proto.name === 'spoilage') {
        item.machine = {
          speed: 1,
          hideRate: true,
          entityType: 'spoilage',
        };
      }

      // Parse module
      if (isModulePrototype(proto)) {
        let quality: number | undefined;
        if (proto.effect.quality) quality = proto.effect.quality / 10;
        item.module = {
          consumption: proto.effect.consumption || undefined,
          pollution: proto.effect.pollution || undefined,
          productivity: proto.effect.productivity || undefined,
          quality,
          speed: proto.effect.speed || undefined,
        };
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
    for (const fluidId of fluidTempRules) {
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
              const altered = spread(original);
              const id = `${key}-${temp.toString()}`;
              altered[id] = altered[key];
              delete altered[key];
              return [altered, [...ids, id]] as [
                Record<string, number>,
                string[],
              ];
            } else return data;
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

    if (isRecipePrototype(proto)) {
      const [recipeIn, recipeInTemp] = recipeIngredientsMap[proto.name];
      const [_recipeOut, , , temps] = recipeResultsMap[proto.name];
      const [, recipeCatalyst] = recipeResultsMap[proto.name];
      const disallowedEffects = getRecipeDisallowedEffects(proto);

      // Convert fluid outputs to use correct ids
      const recipeOut = spread(_recipeOut);
      for (const outId of Object.keys(recipeOut)) {
        if (temps[outId] != null) {
          const temp = temps[outId];
          const index = Array.from(fluidTemps[outId]).indexOf(temp);
          if (index !== 0) {
            recipeOut[`${outId}-${temp.toString()}`] = recipeOut[outId];
            delete recipeOut[outId];
          }
        }
      }

      let producers = producersMap.crafting[proto.category ?? 'crafting'];
      if (producers != null) {
        // Ensure producers have sufficient fluid boxes
        const fluidIngredients = Object.keys(recipeIn)
          .map((i) => itemMap[i])
          .filter((i) => isFluidPrototype(i));
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
          .filter((i) => isFluidPrototype(i));
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
        const locations = getDataAllowedLocations(
          proto.surface_conditions,
        )?.map((l) => l.name);
        // For each set of valid fluid temperature inputs, generate a recipe
        const icon = await getIcon(proto);
        for (let i = 0; i < recipeInOptions.length; i++) {
          // For first option, use proto name, for others append index
          const [recipeIn, ids] = recipeInOptions[i];
          const id = i === 0 ? proto.name : `${proto.name}-${ids.join('-')}`;

          const recipe: RecipeJson = {
            id,
            name: recipeLocale.names[proto.name],
            category: subgroup.group,
            row: getRecipeRow(proto),
            time: proto.energy_required ?? 0.5,
            producers,
            in: recipeIn,
            /**
             * Already calculated when determining included recipes.
             * Note: Output temperatures do not vary
             */
            out: recipeOut,
            catalyst: recipeCatalyst,
            icon,
            locations,
          };

          const flags: RecipeFlag[] = [];

          if (recipesLocked.has(proto.name)) flags.push('locked');
          if (proto.category === 'recycling') flags.push('recycling', 'locked');

          if (flags.length) recipe.flags = flags;

          if (i > 0) recipe.icon = recipe.icon ?? proto.name;
          if (disallowedEffects) recipe.disallowedEffects = disallowedEffects;

          if (id !== proto.name) {
            // Need to update unlocked recipes
            Object.keys(technologyUnlocks)
              .map((t) => technologyUnlocks[t])
              .filter((t) => t.includes(proto.name))
              .forEach((t) => {
                t.push(id);
              });
          }

          modData.recipes.push(recipe);
        }
      } else {
        modDataReport.noProducers.push(proto.name);
      }
    } else if (isFluidPrototype(proto)) {
      // Check for offshore pump recipes
      for (const pumpName of Object.keys(machines.offshorePump)) {
        const entityName = machines.offshorePump[pumpName];
        const offshorePump = dataRaw['offshore-pump'][entityName];
        if (
          offshorePump.fluid_box.filter == null ||
          offshorePump.fluid_box.filter === proto.name
        ) {
          const locations: string[] = allLocations
            .filter((l) => {
              if (!isPlanetPrototype(l)) return false;

              const settings =
                l.map_gen_settings?.autoplace_settings?.tile?.settings;
              if (settings == null) return false;

              const keys = Object.keys(settings);
              return keys.some((k) => dataRaw.tile[k].fluid === proto.name);
            })
            .map((l) => l.name);

          if (locations.length === 0) continue;

          const id = getFakeRecipeId(
            proto.name,
            `${pumpName}-${proto.name}-pump`,
          );
          const out = offshorePump.pumping_speed * 60;
          const recipe: RecipeJson = {
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
            locations,
          };
          modData.recipes.push(recipe);
        }
      }

      // Check for boiler recipes
      for (const boilerName of Object.keys(machines.boiler)) {
        const entityName = machines.boiler[boilerName];
        const boiler = dataRaw.boiler[entityName];
        if (
          boiler.output_fluid_box.filter === proto.name &&
          boiler.target_temperature
        ) {
          if (boiler.fluid_box.filter == null) continue;
          const inputProto = dataRaw.fluid[boiler.fluid_box.filter];
          let outputId = proto.name;
          if (boiler.target_temperature !== [...fluidTemps[proto.name]][0])
            outputId = `${proto.name}-${boiler.target_temperature.toString()}`;

          // Found a boiler recipe
          const id = getFakeRecipeId(
            proto.name,
            `${boilerName}-${proto.name}-boil`,
          );

          const tempDiff =
            boiler.target_temperature - inputProto.default_temperature;
          const energyReqd =
            tempDiff * getEnergyInMJ(inputProto.heat_capacity ?? '1KJ') * 1000;

          const recipe: RecipeJson = {
            id,
            name: `${itemLocale.names[boilerName]} : ${
              fluidLocale.names[proto.name]
            }`,
            category: group.name,
            row: getRecipeRow(proto),
            time: round(energyReqd, 10),
            in: { [inputProto.name]: 1 },
            out: { [outputId]: 10 },
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
          !isAnyItemPrototype(launch_proto) ||
          // Ignore if already processed
          processedLaunchProto.has(launch_proto.name) ||
          // Ignore if no launch products
          launch_proto.rocket_launch_products == null
        )
          continue;

        const [recipeOut, recipeCatalyst] = getProducts(
          launch_proto.rocket_launch_products,
        );

        if (recipeOut[proto.name]) {
          // Found rocket launch recipe
          for (const siloName of Object.keys(machines.silo)) {
            const entityName = machines.silo[siloName];
            const silo = dataRaw['rocket-silo'][entityName];

            const partRecipes: RecipePrototype[] = [];
            if (silo.fixed_recipe)
              partRecipes.push(dataRaw.recipe[silo.fixed_recipe]);
            else {
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
              const [partRecipeProducts, _] = getProducts(partRecipe.results);
              for (const id of Object.keys(partRecipeProducts)) {
                recipeIn[id] =
                  partRecipeProducts[id] * silo.rocket_parts_required;
                part = id;
              }

              if (part == null) continue;

              const recipe: RecipeJson = {
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
        isAnyItemPrototype(proto) &&
        proto.burnt_result &&
        proto.fuel_category
      ) {
        // Found burn recipe
        const id = getFakeRecipeId(proto.burnt_result, `${proto.name}-burn`);
        const recipe: RecipeJson = {
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
          flags: ['burn'],
        };
        modData.recipes.push(recipe);
      }

      // Check for spoil recipes
      if (isAnyItemPrototype(proto) && proto.spoil_result) {
        // Found spoil recipe
        const id = getFakeRecipeId(proto.spoil_result, `${proto.name}-spoil`);
        const recipe: RecipeJson = {
          id,
          name: `${itemLocale.names[proto.name]} : ${
            itemLocale.names[proto.spoil_result]
          }`,
          category: group.name,
          row: getRecipeRow(proto),
          time: 1,
          in: { [proto.name]: 1 },
          out: { [proto.spoil_result]: 1 },
          producers: producersMap.spoil[''],
          flags: ['hideProducer'],
        };
        modData.recipes.push(recipe);
      }

      // Check for agriculture recipes
      if (isAnyItemPrototype(proto) && proto.plant_result) {
        const plantProto = dataRaw.plant[proto.plant_result];
        const minable = plantProto.minable;
        if (minable != null) {
          const icon = await getIcon(plantProto);
          const name = entityLocale.names[plantProto.name];
          const producers = producersMap.agriculture[''];
          const time = plantProto.growth_ticks / 60;
          const [recipeOut, recipeCatalyst] = getProducts(
            minable.results,
            minable.result,
            minable.count,
          );

          const baseLocations =
            getDataAllowedLocations(plantProto.surface_conditions) ??
            allLocations;
          const locations = baseLocations
            .filter((l) => {
              const tiles = plantProto.autoplace?.tile_restriction;

              if (tiles == null) return true;

              if (!isPlanetPrototype(l)) return false;
              return tiles.some(
                (t) =>
                  typeof t === 'string' &&
                  l.map_gen_settings?.autoplace_settings?.tile?.settings?.[t] !=
                    null,
              );
            })
            .map((l) => l.name);

          const TREES_PER_TOWER = 46;
          Object.keys(recipeOut).forEach((k) => {
            recipeOut[k] *= TREES_PER_TOWER;
          });
          if (recipeCatalyst) {
            Object.keys(recipeCatalyst).forEach((k) => {
              recipeCatalyst[k] *= TREES_PER_TOWER;
            });
          }

          const recipe: RecipeJson = {
            id: plantProto.name,
            name,
            category: group.name,
            row: getRecipeRow(plantProto),
            time,
            producers,
            in: { [proto.name]: TREES_PER_TOWER },
            out: recipeOut,
            catalyst: recipeCatalyst,
            cost: 100,
            icon,
            locations,
            flags: ['grow'],
          };

          modData.recipes.push(recipe);
        }
      }
    }
  }

  const resourceHash = new Set<string>();
  for (const key of Object.keys(dataRaw.resource)) {
    const resource = dataRaw.resource[key];
    if (resource?.minable) {
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
          if (entity != null && isMiningDrillPrototype(entity))
            return entity.input_fluid_box != null;

          const item = itemMap[m];
          if (item != null && !isFluidPrototype(item) && item.place_result) {
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
        const fakeId = getFakeRecipeId(proto.name, `${key}-mining`);

        const recipeInOptions = getRecipeInOptions(recipeIn, recipeInTemp);
        recipeInOptions.forEach(([recipeIn, ids], i) => {
          const id = i === 0 ? fakeId : `${fakeId}-${ids.join('-')}`;

          const locations = allLocations
            .filter((l) => {
              if (!isPlanetPrototype(l)) return false;
              return (
                l.map_gen_settings?.autoplace_settings?.entity?.settings?.[
                  key
                ] != null
              );
            })
            .map((l) => l.name);
          const recipe: RecipeJson = {
            id: '',
            name: isFluidPrototype(proto)
              ? fluidLocale.names[proto.name]
              : itemLocale.names[proto.name],
            category: group.name,
            row: getRecipeRow(proto),
            time: minable.mining_time,
            in: recipeIn,
            out: recipeOut,
            catalyst: recipeCatalyst,
            cost: 100 / total,
            flags: ['mining'],
            producers: miners,
            locations,
          };

          const hash = JSON.stringify(recipe);
          if (resourceHash.has(hash)) {
            modDataReport.resourceDuplicate.push(key);
          } else {
            recipe.id = id;
            modData.recipes.push(recipe);
            resourceHash.add(hash);
          }
        });
      } else {
        modDataReport.resourceNoMinableProducts.push(key);
      }
    }
  }

  // Add asteroid recipes
  const asteroidResults: Entities<Entities<number>> = {};
  if (dataRaw.asteroid) {
    const rawAsteroid = dataRaw.asteroid;

    function addAsteroidResult(
      asteroid: AsteroidPrototype,
      num: number,
      out: Entities<number>,
    ): void {
      if (itemMap[asteroid.name]) {
        addEntityValue(out, asteroid.name, num);
      } else if (asteroid.dying_trigger_effect) {
        if (Array.isArray(asteroid.dying_trigger_effect)) {
          asteroid.dying_trigger_effect.forEach((e) => {
            if (isCreateEntityTriggerEffectItem(e)) {
              const count =
                num * (e.probability ?? 1) * (e.offsets?.length ?? 1);

              if (itemMap[e.entity_name])
                addEntityValue(out, e.entity_name, count);
              else {
                const child = rawAsteroid[e.entity_name];
                if (child) addAsteroidResult(child, count, out);
              }
            } else if (isCreateAsteroidChunkEffectItem(e)) {
              const count =
                num * (e.probability ?? 1) * (e.offsets?.length ?? 1);
              if (itemMap[e.asteroid_name])
                addEntityValue(out, e.asteroid_name, count);
              else {
                const child = rawAsteroid[e.asteroid_name];
                if (child) {
                  addAsteroidResult(child, count, out);
                }
              }
            }
          });
        } else {
          throw new Error('Non-array asteroid trigger effect not handled');
        }
      }
    }

    for (const key of Object.keys(dataRaw.asteroid)) {
      const proto = dataRaw.asteroid[key];
      asteroidResults[proto.name] = {};
      addAsteroidResult(proto, 1, asteroidResults[proto.name]);
    }
  }

  function addAsteroidProbability(
    out: Entities<number>,
    asteroidId: string,
    probability: number,
  ): void {
    if (dataRaw['asteroid-chunk'][asteroidId])
      addEntityValue(out, asteroidId, probability);
    else {
      Object.keys(asteroidResults[asteroidId]).forEach((k) => {
        addEntityValue(out, k, probability * asteroidResults[asteroidId][k]);
      });
    }
  }

  async function addAsteroidRecipe(
    key: string,
    proto: SpaceLocationPrototype | SpaceConnectionPrototype,
  ): Promise<void> {
    if (proto.asteroid_spawn_definitions) {
      // Add asteroid mining recipe
      let name = '';
      const subgroup = dataRaw['item-subgroup'][getSubgroup(proto)];
      const group = dataRaw['item-group'][subgroup.group];
      const fakeId = getFakeRecipeId(proto.name, `${key}-asteroid-collection`);
      const out: Entities<number> = {};
      if (isSpaceLocationPrototype(proto)) {
        name = getLocaleName(spaceLocationLocale, key);
        proto.asteroid_spawn_definitions.forEach((def) => {
          addAsteroidProbability(out, def.asteroid, def.probability);
        });
      } else {
        name = getLocaleName(spaceConnectionLocale, key);
        proto.asteroid_spawn_definitions.forEach((def) => {
          if (Array.isArray(def)) {
            const [asteroidId, spawn] = def;
            spawn.forEach((d) => {
              addAsteroidProbability(out, asteroidId, d.probability);
            });
          } else {
            def.spawn_points.forEach((spawn) => {
              addAsteroidProbability(out, def.asteroid, spawn.probability);
            });
          }
        });
      }

      const total = Object.keys(out).reduce((n, k) => (n += out[k]), 0);
      Object.keys(out).forEach((k) => {
        out[k] /= total;
      });

      const icon = await getIcon(proto);
      const recipe: RecipeJson = {
        id: fakeId,
        icon,
        name,
        category: group.name,
        row: getRecipeRow(proto),
        time: 1,
        in: {},
        out,
        producers: producersMap.asteroid[''],
      };
      modData.recipes.push(recipe);
    }
  }

  if (dataRaw['space-connection']) {
    for (const key of Object.keys(dataRaw['space-connection'])) {
      const proto = dataRaw['space-connection'][key];
      await addAsteroidRecipe(key, proto);
    }
  }

  for (const key of Object.keys(dataRaw['space-location'])) {
    const proto = dataRaw['space-location'][key];
    await addAsteroidRecipe(key, proto);
  }

  const sortedProtoIds = protosSorted.map((p) => p.name);

  const technologies = Array.from(technologySet).sort((a, b) => {
    // First, sort by number of ingredients
    const aIngredients = coerceArray(a.unit?.ingredients);
    const bIngredients = coerceArray(b.unit?.ingredients);

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
    return coalesce(a.order, '').localeCompare(coalesce(b.order, ''));
  });

  const labs = Object.keys(machines.lab);
  const technologyIds = technologies.map((t) => t.name);
  for (const tech of technologies) {
    const technology: TechnologyJson = {};
    const id = techId[tech.name];
    const prerequisites = coerceArray(tech.prerequisites);
    if (prerequisites?.length) {
      technology.prerequisites = prerequisites
        // Ignore any disabled or hidden prerequisites
        .filter((p) => technologyIds.includes(p))
        .map((p) => techId[p]);
    }
    const unlockedRecipes = technologyUnlocks[id];
    if (unlockedRecipes) technology.unlockedRecipes = unlockedRecipes;

    if (id in prodUpgrades) technology.prodUpgrades = prodUpgrades[id];

    const inputs = Object.keys(techIngredientsMap[tech.name]);
    const row = inputs.length;
    const producers = labs.filter((l) => {
      const lab = dataRaw.lab[machines.lab[l]];
      const labInputs = coerceArray(lab.inputs);
      return inputs.every((i) => labInputs.includes(i));
    });

    const item: ItemJson = {
      id,
      name: techLocale.names[tech.name],
      category: 'technology',
      row,
      technology,
      icon: await getIcon(tech),
      iconText: getIconText(tech),
    };

    if (tech.unit) {
      const recipe: RecipeJson = {
        id,
        name: item.name,
        category: item.category,
        row,
        time: tech.unit.time,
        producers,
        in: techIngredientsMap[tech.name],
        out: { [id]: 1 },
        flags: ['technology'],
        icon: item.icon,
        iconText: item.iconText,
      };
      modData.recipes.push(recipe);
    }

    if (inputs.length) {
      const firstInput = itemMap[inputs[0]];
      if (!isFluidPrototype(firstInput)) {
        item.stack = firstInput.stack_size;
      }
    }

    modData.items.push(item);
  }

  for (const id of groupsUsed) {
    const itemGroup = dataRaw['item-group'][id];
    const category: CategoryJson = {
      id,
      name: groupLocale.names[id],
      icon: await getIcon(itemGroup),
    };
    modData.categories.push(category);
  }

  const locations: CategoryJson[] = [];
  for (const loc of allLocations) {
    const locale = isPlanetPrototype(loc) ? spaceLocationLocale : surfaceLocale;
    const location: CategoryJson = {
      id: loc.name,
      name: getLocaleName(locale, loc.name),
      icon: await getIcon(loc),
    };
    locations.push(location);
  }

  if (locations.length) modData.locations = locations;

  let icon = 'lab';
  let lab = modData.items.find((i) => i.id === icon);
  if (lab == null) {
    lab = modData.items.find((i) => i.id.includes('lab'));
    if (lab == null) {
      throw new Error('Technology icon not found');
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

  async function finalize(
    result: spritesmith.SpritesmithResult,
  ): Promise<void> {
    modData.icons = await Promise.all(
      Object.keys(result.coordinates).map((file) => {
        const coords = result.coordinates[file];
        return {
          id: iconFiles[file],
          position: `${(-coords.x).toString()}px ${(-coords.y).toString()}px`,
          color: iconColors[file],
        };
      }),
    );

    logTime('Writing data');
    writeData();
    logTime('Complete');

    const warnings = (
      Object.keys(modDataReport) as (keyof ModDataReport)[]
    ).some((k) => modDataReport[k].length);

    if (warnings) logWarn('\nWARNINGS:');

    if (modDataReport.machineSpeedZero.length) {
      logWarn(
        `Machines with zero crafting speed: ${modDataReport.machineSpeedZero.length.toString()}`,
      );
      console.log('These machines have been removed.');
    }

    if (modDataReport.noProducers.length) {
      logWarn(
        `Recipes with no producers: ${modDataReport.noProducers.length.toString()}`,
      );
      console.log('These recipes have been removed.');
    }

    if (modDataReport.resourceNoMinableProducts.length) {
      logWarn(
        `Resources with no minable products: ${modDataReport.resourceNoMinableProducts.length.toString()}`,
      );
      console.log('No mining recipe is generated for these resources.');
    }

    if (modDataReport.resourceDuplicate.length) {
      logWarn(
        `Resource duplicates: ${modDataReport.resourceDuplicate.length.toString()}`,
      );
      console.log(
        'Only one mining resource is generated for duplicate resources',
      );
    }

    if (warnings)
      console.log('\nSee scripts/temp/data-report.json for details');
  }

  spritesmith.run({ src: Object.keys(iconFiles), padding: 2 }, (_, result) => {
    const modIconsPath = `${modPath}/icons.webp`;
    sharp(result.image)
      .webp()
      .toFile(modIconsPath)
      .then(async () => {
        await finalize(result);
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  });
}

void processMod();
