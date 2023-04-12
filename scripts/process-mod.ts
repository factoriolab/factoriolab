import fs from 'fs';

import {
  Category,
  Entities,
  Item,
  Machine,
  ModData,
  ModuleEffect,
  Recipe,
  Silo,
  Technology,
} from '~/models';
import { EnergyType } from '../src/app/models/enum/energy-type';
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

function getEnergyInMJ(usage: string): number {
  const match = /(\d*\.?\d*)(\w*)/.exec(usage);
  if (match == null) {
    throw `Unrecognized power format: '${usage}'`;
  }

  const [_, numStr, unit] = [...match];
  if (!unit.endsWith('J')) {
    throw `Unrecognized energy unit: '${usage}'`;
  }
  const multiplier = getMultiplier(unit.substring(0, unit.length - 1)) / 1000;
  const num = Number(numStr);
  return multiplier * num;
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
  // Record of limitations by hash: id
  const limitations: Record<string, string> = {};

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

  const iconHash: Record<string, string> = {};
  const iconSet = new Set<string>();

  function getIcon(spec: D.IconSpecification & D.Base): string | undefined {
    // If recipe has no declared icon, get product icon
    if (D.isRecipe(spec) && spec.icon == null && spec.icons == null) {
      spec = getRecipeProduct(spec);
    }

    if (spec.icon == null && spec.icons == null) {
      throw `No icons for proto ${spec.name}`;
    }

    let iconId = spec.name;
    if (iconSet.has(iconId)) {
      // Find alternate id
      let i = 0;
      let altId: string;
      do {
        altId = `${iconId}-${i++}`;
      } while (iconSet.has(altId));
      iconId = altId;
    }

    const hash = `${JSON.stringify(spec.icon)}.${JSON.stringify(
      spec.icon_size
    )}.${JSON.stringify(spec.icon_mipmaps)}.${JSON.stringify(spec.icons)}`;
    if (iconHash[hash]) {
      iconId = iconHash[hash];
    } else {
      iconHash[hash] = iconId;
    }

    return iconId === spec.name ? undefined : iconId;
  }

  function getIconText(proto: D.Technology): string | undefined {
    if (!proto.upgrade) return undefined;

    const match = /(\d+)$/.exec(proto.name);
    return match?.[0] ? match[0] : undefined;
  }

  // Records of producer categories to producers
  type ProducerType = 'burner' | 'crafting' | 'resource';
  type EntityType = 'lab' | 'silo' | 'boiler' | 'offshorePump';
  const producers: Record<ProducerType, Record<string, string[]>> = {
    burner: {},
    crafting: {},
    resource: {},
  };
  const machines: Record<EntityType, string[]> = {
    lab: [],
    silo: [],
    boiler: [],
    offshorePump: [],
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

  function processProducers(proto: MachineProto): void {
    if (D.isMiningDrill(proto)) {
      addProducers(proto.name, proto.resource_categories, 'resource');
    }

    if (!D.isOffshorePump(proto) && proto.energy_source.type === 'burner') {
      if (proto.energy_source.fuel_categories) {
        addProducers(proto.name, proto.energy_source.fuel_categories, 'burner');
      } else if (proto.energy_source.fuel_category) {
        addProducers(proto.name, [proto.energy_source.fuel_category], 'burner');
      }
    }

    if (
      D.isAssemblingMachine(proto) ||
      D.isRocketSilo(proto) ||
      D.isFurnace(proto)
    ) {
      addProducers(proto.name, proto.crafting_categories, 'crafting');
    }

    if (D.isBoiler(proto)) {
      machines.boiler.push(proto.name);
    } else if (D.isRocketSilo(proto)) {
      machines.silo.push(proto.name);
    } else if (D.isLab(proto)) {
      machines.lab.push(proto.name);
    } else if (D.isOffshorePump(proto)) {
      machines.offshorePump.push(proto.name);
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
          console.warn(
            `Only using first fuel category from burner ${proto.name}`
          );
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

  function getMachineDisallowedEffects(
    proto: MachineProto
  ): ModuleEffect[] | undefined {
    if (D.isBoiler(proto) || D.isOffshorePump(proto) || D.isReactor(proto)) {
      return undefined;
    }

    return getDisallowedEffects(proto.allowed_effects);
  }

  function getMachine(proto: MachineProto): Machine {
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

    processProducers(proto);

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
    if (techData.effects) {
      for (const effect of techData.effects) {
        if (D.isUnlockRecipeModifier(effect)) {
          recipesUnlocked[effect.recipe] = techRaw.name;
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
        row: getItemRow(proto),
        category: group.name,
        icon: getIcon(proto),
      };

      modData.items.push(item);
    } else {
      const item: Item = {
        id: proto.name,
        name: itemLocale.names[proto.name],
        stack: proto.stack_size,
        row: getItemRow(proto),
        category: group.name,
        icon: getIcon(proto),
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
          item.machine = getMachine(entity);
        } else if (dataRaw['assembling-machine'][proto.place_result]) {
          const entity = dataRaw['assembling-machine'][proto.place_result];
          item.machine = getMachine(entity);
        } else if (dataRaw['rocket-silo'][proto.place_result]) {
          const entity = dataRaw['rocket-silo'][proto.place_result];
          item.machine = getMachine(entity);
        } else if (dataRaw.furnace[proto.place_result]) {
          const entity = dataRaw.furnace[proto.place_result];
          item.machine = getMachine(entity);
        } else if (dataRaw.lab[proto.place_result]) {
          const entity = dataRaw.lab[proto.place_result];
          item.machine = getMachine(entity);
        } else if (dataRaw['mining-drill'][proto.place_result]) {
          const entity = dataRaw['mining-drill'][proto.place_result];
          item.machine = getMachine(entity);
        } else if (dataRaw['offshore-pump'][proto.place_result]) {
          const entity = dataRaw['offshore-pump'][proto.place_result];
          item.machine = getMachine(entity);
        } else if (dataRaw['reactor'][proto.place_result]) {
          const entity = dataRaw['reactor'][proto.place_result];
          item.machine = getMachine(entity);
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

  // Process recipe protos
  for (const proto of protosSorted.filter(D.isRecipe)) {
    const subgroup = dataRaw['item-subgroup'][getSubgroup(proto)];
    const group = dataRaw['item-group'][subgroup.group];
    groupsUsed.add(group.name);

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
      producers: producers.crafting[proto.category ?? 'crafting'],
      in: recipeIn,
      out: recipeOut,
      unlockedBy: recipesUnlocked[proto.name],
      icon: getIcon(proto),
    };
    modData.recipes.push(recipe);
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
    if (techData.prerequisites?.length) {
      technology.prerequisites = techData.prerequisites;
    }

    const recipe: Recipe = {
      id: techRaw.name,
      name: techLocale.names[techRaw.name],
      category: 'technology',
      row: 0,
      time: techData.unit.time,
      producers: machines.lab,
      in: techData.unit.ingredients.reduce(
        (e: Entities<number>, [id, count]) => {
          e[id] = count;
          return e;
        },
        {}
      ),
      out: { [techRaw.name]: 1 },
      technology,
      icon: getIcon(techRaw),
      iconText: getIconText(techRaw),
    };

    modData.recipes.push(recipe);
  }

  for (const id of groupsUsed) {
    const category: Category = {
      id,
      name: groupLocale.names[id],
    };
    modData.categories.push(category);
  }
  modData.categories.push({ id: 'technology', name: 'Technology' });

  // Sprite sheet
  const iconIds = Object.keys(iconHash).map((i) => iconHash[i]);
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
