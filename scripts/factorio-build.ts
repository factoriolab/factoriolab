import fs from 'fs';
import sharp from 'sharp';
import spritesmith from 'spritesmith';

import {
  Category,
  Entities,
  Item,
  Machine,
  ModData,
  ModHash,
  ModuleEffect,
  Recipe,
  Silo,
  Technology,
} from '~/models';
import { EnergyType } from '../src/app/models/enum/energy-type';
import * as D from './factorio.models';
import { getJsonData } from './helpers';

/**
 * This script is intended to pull files from a dump from Factorio and build
 * files required by the calculator. If the files already exist, should use
 * existing defaults and append to the hash list.
 */

const mod = process.argv[2];
const mode: 'normal' | 'expensive' = 'normal';

if (!mod) {
  throw new Error(
    'Please specify a mod to process by the folder name, e.g. "1.1" for src/data/1.1'
  );
}

// Set up paths
const appDataPath = process.env['AppData'];
const factorioPath = `${appDataPath}/Factorio`;
const modsPath = `${factorioPath}/mods`;
const modListPath = `${modsPath}/mod-list.json`;
const playerDataPath = `${factorioPath}/player-data.json`;
const scriptOutputPath = `${factorioPath}/script-output`;
const dataRawPath = `${scriptOutputPath}/data-raw-dump.json`;
const tempPath = './scripts/temp';
const tempIconsPath = `${tempPath}/icons`;
const modPath = `./src/data/${mod}`;
const modDataPath = `${modPath}/data.json`;
const modHashPath = `${modPath}/hash.json`;

interface ModDataReport {
  noProducers: string[];
  noProducts: string[];
  multiFuelCategory: string[];
}

const start = Date.now();
let temp = Date.now();
function logTime(msg: string): void {
  const now = Date.now();
  const stepTime = now - temp;
  const allTime = now - start;
  temp = now;

  console.log(allTime, stepTime, msg);
}

function addEntityValue(e: Entities<number>, id: string, val: number): void {
  if (e[id] == null) {
    e[id] = val;
  } else {
    e[id] = e[id] + val;
  }
}

function getLocale(file: string): D.Locale {
  const path = `${scriptOutputPath}/${file}`;
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
    case 'T':
      return 1000000000;
    default:
      throw `Unsupported multiplier: '${letter}'`;
  }
}

function round(number: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(number * factor) / factor;
}

function getEnergyInMJ(usage: string): number {
  const match = /(\d*\.?\d*)(\w*)/.exec(usage);
  if (match == null) {
    throw `Unrecognized energy format: '${usage}'`;
  }

  const [_, numStr, unit] = [...match];
  if (!unit.endsWith('J')) {
    throw `Unrecognized energy unit: '${usage}'`;
  }
  const multiplier = getMultiplier(unit.substring(0, unit.length - 1)) / 1000;
  const num = Number(numStr);
  const result = multiplier * num;
  return round(result, 10);
}

function getPowerInKw(usage: string): number {
  const match = /(\d*\.?\d*)(\w*)/.exec(usage);
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

function getDisallowedEffects(
  allowedEffects?: (keyof D.Effect)[] | Record<string, never>,
  defaultDisallow = false
): (keyof D.Effect)[] | undefined {
  if (allowedEffects == null) {
    return defaultDisallow ? D.allEffects : undefined;
  }

  if (!Array.isArray(allowedEffects)) {
    allowedEffects = [];
  }

  const checked = allowedEffects;
  const result = D.allEffects.filter((e) => checked.indexOf(e) === -1);
  return result.length === 0 ? undefined : result;
}

async function processMod(): Promise<void> {
  // Read mod data
  logTime('Reading mod data');
  const modList = getJsonData<D.ModList>(modListPath);
  const modFiles = fs
    .readdirSync(modsPath)
    // Only include zip files
    .filter((f) => f.endsWith('.zip'))
    // Trim .zip from end of string
    .map((f) => f.substring(0, f.length - 4));

  // Create directories
  if (fs.existsSync(tempPath)) {
    fs.rmSync(tempPath, { recursive: true });
  }

  fs.mkdirSync(tempPath);
  fs.mkdirSync(tempIconsPath);

  // Read player data
  const playerData = getJsonData<D.PlayerData>(playerDataPath);

  // Read locale data
  const groupLocale = getLocale('item-group-locale.json');
  const itemLocale = getLocale('item-locale.json');
  const fluidLocale = getLocale('fluid-locale.json');
  const recipeLocale = getLocale('recipe-locale.json');
  const techLocale = getLocale('technology-locale.json');

  // Read main data JSON
  const dataRaw = getJsonData<D.DataRawDump>(dataRawPath, true);

  // Set up collections
  // Record of limitations by hash: id
  const limitations: Record<string, string> = {};
  // Record of technology ids by raw id: factoriolab id
  const techId: Record<string, string> = {};

  function getItem(name: string): D.Item | D.Fluid {
    return (
      dataRaw.item[name] ??
      dataRaw.ammo[name] ??
      dataRaw.armor[name] ??
      dataRaw.capsule[name] ??
      dataRaw.gun[name] ??
      dataRaw['item-with-entity-data'][name] ??
      dataRaw['item-with-tags'][name] ??
      dataRaw.module[name] ??
      dataRaw['rail-planner'][name] ??
      dataRaw['repair-tool'][name] ??
      dataRaw['selection-tool'][name] ??
      dataRaw['spidertron-remote'][name] ??
      dataRaw.tool[name] ??
      dataRaw.fluid[name]
    );
  }

  function getRecipeProduct(recipe: D.Recipe): D.Item | D.Fluid | undefined {
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
    } else if (recipeData.results && recipeData.main_product) {
      const mainProduct = recipeData.main_product;
      const result = recipeData.results.find((r) =>
        D.isSimpleProduct(r) ? r[0] === mainProduct : r.name === mainProduct
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
        throw `Main product '${mainProduct}' declared by recipe '${recipe.name}' not found in results`;
      }
    } else {
      return undefined;
    }
  }

  function getRecipeSubgroup(recipe: D.Recipe): string {
    if (recipe.subgroup) {
      return recipe.subgroup;
    }

    const product = getRecipeProduct(recipe);
    if (product == null) {
      throw `Recipe '${recipe.name}' declares no subgroup though it is required`;
    }

    return getSubgroup(product);
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
  function getRecipeRow(proto: D.Recipe | D.Item | D.Fluid): number {
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

  async function resizeIcon(path: string, iconId: string): Promise<void> {
    const outPath = `${tempPath}/icons/${iconId}.png`;
    await sharp(path).resize(64, 64).png().toFile(outPath);
    iconFiles[outPath] = iconId;
  }

  async function getIcon(
    spec: D.IconSpecification & D.Base
  ): Promise<string | undefined> {
    const id = D.isTechnology(spec) ? techId[spec.name] : spec.name;

    // If recipe has no declared icon, get product icon
    if (D.isRecipe(spec) && spec.icon == null && spec.icons == null) {
      const product = getRecipeProduct(spec);
      if (product != null) spec = product;
    }

    // If recipe still has no product icon, calculator will pick first product
    if (!D.isRecipe(spec) && spec.icon == null && spec.icons == null) {
      throw `No icons for proto ${spec.name}`;
    }

    let iconId = id;

    const hash = `${JSON.stringify(spec.icon)}.${JSON.stringify(
      spec.icon_size
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

      let folder = 'item';
      if (D.isRecipe(spec)) {
        folder = 'recipe';
      } else if (D.isFluid(spec)) {
        folder = 'fluid';
      } else if (D.isTechnology(spec)) {
        folder = 'technology';
      } else if (D.isItemGroup(spec)) {
        folder = 'item-group';
      } else {
        folder = 'item';
      }

      const path = `${scriptOutputPath}/${folder}/${spec.name}.png`;
      await resizeIcon(path, iconId);
    }

    return iconId === id ? undefined : iconId;
  }

  function getIconText(proto: D.Base): string | undefined {
    const match = /-(\d+)$/.exec(proto.name);
    return match?.[1] ? match[1] : undefined;
  }

  // Records of producer categories to producers
  type ProducerType = 'burner' | 'crafting' | 'resource';
  type EntityType = 'lab' | 'silo' | 'boiler' | 'offshorePump';
  const producers: Record<ProducerType, Record<string, string[]>> = {
    burner: {},
    crafting: {},
    resource: {},
  };
  // For each machine type, a map of item name : entity name
  const machines: Record<EntityType, Record<string, string>> = {
    lab: {},
    silo: {},
    boiler: {},
    offshorePump: {},
  };

  function addProducers(
    id: string,
    categories: string[],
    type: ProducerType
  ): void {
    const record = producers[type];

    for (const category of categories) {
      if (record[category] == null) {
        record[category] = [];
      }

      record[category].push(id);
    }
  }

  function processProducers(proto: MachineProto, name: string): void {
    if (D.isMiningDrill(proto)) {
      addProducers(name, proto.resource_categories, 'resource');
    }

    if (!D.isOffshorePump(proto) && proto.energy_source.type === 'burner') {
      if (proto.energy_source.fuel_categories) {
        addProducers(name, proto.energy_source.fuel_categories, 'burner');
      } else if (proto.energy_source.fuel_category) {
        addProducers(name, [proto.energy_source.fuel_category], 'burner');
      }
    }

    if (
      D.isAssemblingMachine(proto) ||
      D.isRocketSilo(proto) ||
      D.isFurnace(proto)
    ) {
      addProducers(name, proto.crafting_categories, 'crafting');
    }

    if (D.isBoiler(proto)) {
      machines.boiler[name] = proto.name;
    } else if (D.isRocketSilo(proto)) {
      machines.silo[name] = proto.name;
    } else if (D.isLab(proto)) {
      machines.lab[name] = proto.name;
    } else if (D.isOffshorePump(proto)) {
      machines.offshorePump[name] = proto.name;
    }
  }

  type MachineProto =
    | D.Boiler
    | D.AssemblingMachine
    | D.RocketSilo
    | D.Furnace
    | D.Lab
    | D.MiningDrill
    | D.OffshorePump
    | D.Reactor;

  function getMachineSpeed(proto: MachineProto): number | undefined {
    if (D.isReactor(proto)) {
      return undefined;
    }

    let speed: number;
    if (D.isBoiler(proto)) {
      speed = getPowerInKw(proto.energy_consumption);
    } else if (D.isLab(proto)) {
      speed = proto.research_speed ?? 1;
    } else if (D.isMiningDrill(proto)) {
      speed = proto.mining_speed;
    } else if (D.isOffshorePump(proto)) {
      speed = proto.pumping_speed * 60;
    } else {
      speed = proto.crafting_speed;
    }

    return speed === 1 ? undefined : speed;
  }

  function getMachineModules(proto: MachineProto): number | undefined {
    if (D.isBoiler(proto) || D.isOffshorePump(proto) || D.isReactor(proto)) {
      return undefined;
    }

    return proto.module_specification?.module_slots;
  }

  function getMachineType(proto: MachineProto): EnergyType | undefined {
    if (D.isOffshorePump(proto)) {
      return undefined;
    }

    return proto.energy_source.type as EnergyType;
  }

  function getMachineCategory(proto: MachineProto): string | undefined {
    if (D.isOffshorePump(proto)) {
      return undefined;
    }

    if (proto.energy_source.type === 'burner') {
      if (proto.energy_source.fuel_categories) {
        if (proto.energy_source.fuel_categories.length > 1) {
          modDataReport.multiFuelCategory.push(proto.name);
        }

        return proto.energy_source.fuel_categories[0];
      } else {
        return proto.energy_source.fuel_category;
      }
    }

    return undefined;
  }

  function getMachineUsage(proto: MachineProto): number | undefined {
    if (D.isOffshorePump(proto)) {
      return undefined;
    } else if (D.isBoiler(proto)) {
      return getPowerInKw(proto.energy_consumption);
    } else if (D.isReactor(proto)) {
      return getPowerInKw(proto.consumption);
    }

    return getPowerInKw(proto.energy_usage);
  }

  function getMachineDrain(proto: MachineProto): number | undefined {
    if (D.isOffshorePump(proto)) {
      return undefined;
    }

    if (proto.energy_source.type === 'electric') {
      if (proto.energy_source.drain != null) {
        return getPowerInKw(proto.energy_source.drain);
      } else {
        if (
          D.isAssemblingMachine(proto) ||
          D.isRocketSilo(proto) ||
          D.isFurnace(proto)
        ) {
          const usage = getMachineUsage(proto);
          if (usage != null) {
            const idle = D.isRocketSilo(proto)
              ? getPowerInKw(proto.idle_energy_usage)
              : 0;
            return usage / 30 + idle;
          }
        }
      }
    }

    return undefined;
  }

  function getMachinePollution(proto: MachineProto): number | undefined {
    if (D.isOffshorePump(proto)) {
      return undefined;
    }

    return proto.energy_source.emissions_per_minute;
  }

  function getMachineSilo(proto: MachineProto): Silo | undefined {
    if (D.isRocketSilo(proto)) {
      const rocket = dataRaw['rocket-silo-rocket'][proto.rocket_entity];

      let launch = 0;
      // Lights blinking open
      launch += 1 / proto.light_blinking_speed + 1;
      // Doors opening
      launch += 1 / proto.door_opening_speed + 1;
      // Doors opened
      launch += (proto.rocket_rising_delay ?? 30) + 1;
      // Rocket rising
      launch += 1 / rocket.rising_speed + 1;
      // Rocket ready
      launch += 14; // Estimate for satellite inserter swing time
      // Launch started
      launch += (proto.launch_wait_time ?? 120) + 1;
      // Engine starting
      launch += 1 / rocket.engine_starting_speed + 1;
      // Rocket flying
      const rocketFlightThreshold = 0.5;
      launch +=
        Math.log(
          1 +
            (rocketFlightThreshold * rocket.flying_acceleration) /
              rocket.flying_speed
        ) / Math.log(1 + rocket.flying_acceleration);
      // Lights blinking close
      launch += 1 / proto.light_blinking_speed + 1;
      // Doors closing
      launch += 1 / proto.door_opening_speed + 1;

      launch = Math.floor(launch + 0.5);

      return {
        parts: proto.rocket_parts_required,
        launch,
      };
    }

    return undefined;
  }

  function getIngredients(
    ingredients: D.Ingredient[] | Record<string, never>
  ): Record<string, number> {
    const result: Record<string, number> = {};

    if (Array.isArray(ingredients)) {
      for (const ingredient of ingredients) {
        if (D.isSimpleIngredient(ingredient)) {
          const [itemId, amount] = ingredient;
          addEntityValue(result, itemId, amount);
        } else {
          addEntityValue(result, ingredient.name, ingredient.amount);
        }
      }
    }

    return result;
  }

  function getRecipeData(recipe: D.Recipe): D.RecipeData {
    return typeof recipe[mode] === 'object' ? recipe[mode] : recipe;
  }

  function getProducts(
    results: D.Product[] | Record<string, never> | undefined,
    result?: string,
    result_count = 1
  ): [Record<string, number>, Record<string, number> | undefined, number] {
    const record: Record<string, number> = {};
    let catalyst: Record<string, number> | undefined;
    let total = 0;

    if (Array.isArray(results)) {
      for (const product of results) {
        if (D.isSimpleProduct(product)) {
          const [itemId, amount] = product;
          addEntityValue(record, itemId, amount);
          total += amount;
        } else {
          let amount = product.amount;
          if (amount == null && product.amount_max && product.amount_min) {
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

    return [record, catalyst, total];
  }

  function getMachineDisallowedEffects(
    proto: MachineProto
  ): ModuleEffect[] | undefined {
    if (D.isBoiler(proto) || D.isOffshorePump(proto) || D.isReactor(proto)) {
      return undefined;
    }

    return getDisallowedEffects(proto.allowed_effects);
  }

  function getMachine(proto: MachineProto, name: string): Machine {
    const machine: Machine = {
      speed: getMachineSpeed(proto),
      modules: getMachineModules(proto),
      disallowedEffects: getMachineDisallowedEffects(proto),
      type: getMachineType(proto),
      category: getMachineCategory(proto),
      usage: getMachineUsage(proto),
      drain: getMachineDrain(proto),
      pollution: getMachinePollution(proto),
      silo: getMachineSilo(proto),
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

  const modDataReport: ModDataReport = {
    noProducts: [],
    noProducers: [],
    multiFuelCategory: [],
  };

  const modHashReport: ModHash = {
    items: [],
    beacons: [],
    belts: [],
    fuels: [],
    wagons: [],
    machines: [],
    modules: [],
    technologies: [],
    recipes: [],
  };
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

      modData.defaults = oldData.defaults;

      if (modData.defaults?.excludedRecipes) {
        // Filter excluded recipes for only recipes that exist
        modData.defaults.excludedRecipes =
          modData.defaults.excludedRecipes.filter((e) =>
            modData.recipes.some((r) => r.id === e)
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
      });

      modData.recipes.forEach((r) => {
        addIfMissing(oldHash, 'recipes', r.id);

        if (r.technology) addIfMissing(oldHash, 'technologies', r.id);
      });

      fs.writeFileSync(modHashPath, JSON.stringify(oldHash));
      fs.writeFileSync(
        `${tempPath}/hash-update-report.json`,
        JSON.stringify(modHashReport)
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
        recipes: modData.recipes.map((r) => r.id),
        technologies: modData.recipes
          .filter((r) => r.technology)
          .map((r) => r.id),
      };

      fs.writeFileSync(modHashPath, JSON.stringify(modHash));
    }

    fs.writeFileSync(modDataPath, JSON.stringify(modData));
    fs.writeFileSync(
      `${tempPath}/data-report.json`,
      JSON.stringify(modDataReport)
    );
  }

  logTime('Processing data');

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

  // Record of recipe id : technology id
  const recipesUnlocked: Record<string, string> = {};
  for (const key of Object.keys(dataRaw.technology)) {
    const techRaw = dataRaw.technology[key];
    const techData = techRaw[mode] ?? techRaw;

    if (
      getItem(techRaw.name) ||
      dataRaw.recipe[techRaw.name] ||
      dataRaw['item-group'][techRaw.name]
    ) {
      techId[techRaw.name] = `${techRaw.name}-technology`;
    } else {
      techId[techRaw.name] = techRaw.name;
    }

    if (Array.isArray(techData.effects)) {
      for (const effect of techData.effects) {
        if (D.isUnlockRecipeModifier(effect)) {
          recipesUnlocked[effect.recipe] = techId[techRaw.name];
        }
      }
    }
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

  // Cache recipe results to use later
  const recipeResults: Record<
    string,
    [Record<string, number>, Record<string, number> | undefined, number]
  > = {};
  for (const key of Object.keys(dataRaw.recipe)) {
    const recipe = dataRaw.recipe[key];
    let include = true;

    // Skip recipes that don't have results
    const recipeData = getRecipeData(recipe);
    const results = getProducts(
      recipeData.results,
      recipeData.result,
      recipeData.result_count
    );
    if (results[2] === 0) {
      modDataReport.noProducts.push(key);
      include = false;
    }

    recipeResults[key] = results;

    // Always include fixed recipes that have outputs
    if (!fixedRecipe.has(key)) {
      // Skip recipes that are not unlocked / enabled
      if (recipe.enabled === false && !recipesUnlocked[key]) {
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
    if (Array.isArray(recipeData.ingredients)) {
      for (const ingredient of recipeData.ingredients) {
        if (D.isSimpleIngredient(ingredient)) {
          itemsUsed.add(ingredient[0]);
        } else {
          itemsUsed.add(ingredient.name);
        }
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
          order = getRecipeProduct(proto)?.order;
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

  // Process item protos
  for (const proto of protosSorted) {
    // Skip recipes until producers are processed
    if (D.isRecipe(proto)) continue;

    const subgroup = dataRaw['item-subgroup'][getSubgroup(proto)];
    const group = dataRaw['item-group'][subgroup.group];
    groupsUsed.add(group.name);

    if (D.isFluid(proto)) {
      const item: Item = {
        id: proto.name,
        name: fluidLocale.names[proto.name],
        category: group.name,
        row: getItemRow(proto),
        icon: await getIcon(proto),
      };

      modData.items.push(item);
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
          item.beacon = {
            effectivity: entity.distribution_effectivity,
            modules: entity.module_specification.module_slots ?? 0,
            range: entity.supply_area_distance,
            type: entity.energy_source.type as
              | EnergyType.Electric
              | EnergyType.Void,
            usage: getPowerInKw(entity.energy_usage),
            disallowedEffects: getDisallowedEffects(
              entity.allowed_effects,
              true
            ),
          };
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
          item.belt = {
            speed: entity.speed * 480,
          };
        }

        // Parse cargo wagon
        if (dataRaw['cargo-wagon'][proto.place_result]) {
          const entity = dataRaw['cargo-wagon'][proto.place_result];
          item.cargoWagon = { size: entity.inventory_size };
        }

        // Parse fluid wagon
        if (dataRaw['fluid-wagon'][proto.place_result]) {
          const entity = dataRaw['fluid-wagon'][proto.place_result];
          item.fluidWagon = { capacity: entity.capacity };
        }
      }

      // Parse module
      if (D.isModule(proto)) {
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
            (l) => proto.limitation_blacklist?.indexOf(l) === -1
          );
        }

        if (limitation != null) {
          limitation.sort();
          const hash = JSON.stringify(limitation);
          if (!limitations[hash]) {
            limitations[hash] = proto.name;
            modData.limitations[proto.name] = limitation;
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
      return desiredId;
    }
  }

  // Process recipe protos / fake recipes
  const processedLaunchProto = new Set<string>();
  for (const proto of protosSorted) {
    const subgroup = dataRaw['item-subgroup'][getSubgroup(proto)];
    const group = dataRaw['item-group'][subgroup.group];
    groupsUsed.add(group.name);

    if (D.isRecipe(proto)) {
      const recipeData = getRecipeData(proto);
      const recipeIn = getIngredients(recipeData.ingredients);
      const [recipeOut] = recipeResults[proto.name];
      let [, recipeCatalyst] = recipeResults[proto.name];

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

      const recipe: Recipe = {
        id: proto.name,
        name: recipeLocale.names[proto.name],
        category: subgroup.group,
        row: getRecipeRow(proto),
        time: proto.energy_required ?? 0.5,
        producers: producers.crafting[proto.category ?? 'crafting'],
        in: getIngredients(recipeData.ingredients),
        // Already calculated when determining included recipes
        out: recipeOut,
        catalyst: recipeCatalyst,
        unlockedBy: recipesUnlocked[proto.name],
        icon: await getIcon(proto),
      };
      modData.recipes.push(recipe);
    } else if (D.isFluid(proto)) {
      // Check for offshore pump recipes
      for (const pumpName of Object.keys(machines.offshorePump)) {
        const entityName = machines.offshorePump[pumpName];
        const offshorePump = dataRaw['offshore-pump'][entityName];
        if (offshorePump.fluid === proto.name) {
          // Found an offshore pump recipe
          const id = getFakeRecipeId(
            proto.name,
            `${pumpName}-${proto.name}-pump`
          );
          const recipe: Recipe = {
            id,
            name: `${itemLocale.names[pumpName]} : ${
              fluidLocale.names[proto.name]
            }`,
            category: group.name,
            row: getRecipeRow(proto),
            time: 1,
            in: {},
            out: { [proto.name]: 1 },
            producers: [pumpName],
            cost: 100,
          };
          modData.recipes.push(recipe);
        }
      }

      // Check for boiler recipes
      if (proto.name === 'steam') {
        const water = dataRaw.fluid['water'];
        for (const boilerName of Object.keys(machines.boiler)) {
          const entityName = machines.boiler[boilerName];
          const boiler = dataRaw.boiler[entityName];
          // TODO: Account for different target temperatures
          if (boiler.target_temperature === 165) {
            // Found a boiler recipe
            const id = getFakeRecipeId(
              proto.name,
              `${boilerName}-${proto.name}-boil`
            );

            const tempDiff = 165 - 15;
            const energyReqd =
              tempDiff * getEnergyInMJ(water.heat_capacity ?? '1KJ') * 1000;

            const recipe: Recipe = {
              id,
              name: `${itemLocale.names[boilerName]} : ${
                fluidLocale.names[proto.name]
              }`,
              category: group.name,
              row: getRecipeRow(proto),
              time: round(energyReqd, 10),
              in: { [water.name]: 1 },
              out: { [proto.name]: 1 },
              producers: [boilerName],
            };
            modData.recipes.push(recipe);
          }
        }
      }
    } else {
      // Check for rocket launch recipes
      for (const launch_proto of protosSorted) {
        if (
          // Must be an item
          D.isRecipe(launch_proto) ||
          D.isFluid(launch_proto) ||
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
              : undefined)
        );

        if (recipeOut[proto.name]) {
          // Found rocket launch recipe
          for (const siloName of Object.keys(machines.silo)) {
            const entityName = machines.silo[siloName];
            const silo = dataRaw['rocket-silo'][entityName];
            const id = getFakeRecipeId(
              proto.name,
              `${siloName}-${launch_proto.name}-launch`
            );

            const recipeIn: Record<string, number> = {
              [launch_proto.name]: 1,
            };

            // Add rocket parts
            let part: string | undefined;
            if (silo.fixed_recipe == null) continue;
            const fixedRecipe = dataRaw.recipe[silo.fixed_recipe];
            const fixedRecipeData = getRecipeData(fixedRecipe);
            const [fixedRecipeProducts, _] = getProducts(
              fixedRecipeData.results,
              fixedRecipeData.result,
              fixedRecipeData.result_count
            );
            for (const id of Object.keys(fixedRecipeProducts)) {
              recipeIn[id] =
                fixedRecipeProducts[id] * silo.rocket_parts_required;
              part = id;
            }

            if (part == null) continue;

            const recipe: Recipe = {
              id,
              name: `${itemLocale.names[siloName]} : ${
                itemLocale.names[proto.name]
              }`,
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
            processedLaunchProto.add(launch_proto.name);
          }
        }
      }

      // Check for burn recipes
      if (proto.burnt_result && proto.fuel_category) {
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
          producers: producers.burner[proto.fuel_category],
        };
        modData.recipes.push(recipe);
      }
    }

    const resource = dataRaw.resource[proto.name];
    if (resource && resource.minable) {
      // Found mining recipe
      const id = getFakeRecipeId(proto.name, `${proto.name}-mining`);
      let miners = producers.resource[resource.category ?? 'basic-solid'];
      const recipeIn: Record<string, number> = {};
      if (resource.minable.required_fluid && resource.minable.fluid_amount) {
        const amount = resource.minable.fluid_amount / 10;
        recipeIn[resource.minable.required_fluid] = amount;
        miners = miners.filter((m) => {
          // Only allow producers with fluid boxes
          const item = getItem(m);
          if (!D.isFluid(item) && item.place_result) {
            const miningDrill = dataRaw['mining-drill'][item.place_result];
            return miningDrill.input_fluid_box != null;
          } else {
            // Seems to be an invalid entry
            return false;
          }
        });
      }

      const [recipeOut, recipeCatalyst, total] = getProducts(
        resource.minable.results,
        resource.minable.result,
        resource.minable.count
      );

      const recipe: Recipe = {
        id,
        name: D.isFluid(proto)
          ? fluidLocale.names[proto.name]
          : itemLocale.names[proto.name],
        category: group.name,
        row: getRecipeRow(proto),
        time: resource.minable.mining_time,
        in: recipeIn,
        out: recipeOut,
        catalyst: recipeCatalyst,
        cost: 10000 / total,
        mining: true,
        producers: miners,
      };
      modData.recipes.push(recipe);
    }
  }

  const technologies = Object.keys(dataRaw.technology).map(
    (t) => dataRaw.technology[t]
  );
  technologies.sort((a, b) => {
    return (a.order ?? '').localeCompare(b.order ?? '');
  });
  for (const techRaw of technologies) {
    const techData = techRaw[mode] ?? techRaw;
    const technology: Technology = {};
    const id = techId[techRaw.name];
    if (techData.prerequisites?.length) {
      technology.prerequisites = techData.prerequisites.map((p) => techId[p]);
    }

    const recipe: Recipe = {
      id,
      name: techLocale.names[techRaw.name],
      category: 'technology',
      row: 0,
      time: techData.unit.time,
      producers: Object.keys(machines.lab),
      in: getIngredients(techData.unit.ingredients),
      out: { [id]: 1 },
      technology,
      icon: await getIcon(techRaw),
      iconText: getIconText(techRaw),
    };
    modData.recipes.push(recipe);

    const item: Item = {
      id,
      name: recipe.name,
      category: recipe.category,
      row: 0,
      icon: recipe.icon,
      iconText: recipe.iconText,
    };
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
  modData.categories.push({
    id: 'technology',
    name: 'Technology',
    icon: 'lab',
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

      modData.icons = Object.keys(result.coordinates).map((file) => {
        const coords = result.coordinates[file];
        return {
          id: iconFiles[file],
          position: `${-coords.x}px ${-coords.y}px`,
        };
      });

      logTime('Writing data');
      writeData();
      logTime('Complete');
    }
  );
}

processMod();
