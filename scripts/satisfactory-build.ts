/**
 * This script is used to update the Satisfactory (sfy) mod set
 * in %STEAM%\steamapps\common\Satisfactory\CommunityResources\Docs there are localization files also containing recipes and unlocks.
 * We will fill the data from these files into the src/sfy/data.json file.
 */

// layout of Docs/en-US.json file
// [
// {
// "NativeClass": "/Script/CoreUObject.Class'/Script/FactoryGame.FGItemDescriptor'",
// "Classes": [
// {
//   "ClassName": "Recipe_Alternate_CrystalOscillator_C",
//   "FullName": "BlueprintGeneratedClass /Game/FactoryGame/Recipes/AlternateRecipes/Parts/Recipe_Alternate_CrystalOscillator.Recipe_Alternate_CrystalOscillator_C",
//   "mDisplayName": "Alternate: Insulated Crystal Oscillator",
//   "mIngredients": "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/QuartzCrystal/Desc_QuartzCrystal.Desc_QuartzCrystal_C'\",Amount=10),(ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/Rubber/Desc_Rubber.Desc_Rubber_C'\",Amount=7),(ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/CircuitBoardHighSpeed/Desc_CircuitBoardHighSpeed.Desc_CircuitBoardHighSpeed_C'\",Amount=1))",
//   "mProduct": "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/CrystalOscillator/Desc_CrystalOscillator.Desc_CrystalOscillator_C'\",Amount=1))",
//   "mManufacturingMenuPriority": "4.000000",
//   "mManufactoringDuration": "32.000000",
//   "mManualManufacturingMultiplier": "1.000000",
//   "mProducedIn": "(\"/Game/FactoryGame/Buildable/Factory/ManufacturerMk1/Build_ManufacturerMk1.Build_ManufacturerMk1_C\")",
//   "mRelevantEvents": "",
//   "mVariablePowerConsumptionConstant": "0.000000",
//   "mVariablePowerConsumptionFactor": "1.000000"
// },

// and
// {
//   "NativeClass": "/Script/CoreUObject.Class'/Script/FactoryGame.FGRecipe'",
//   "Classes": [
//     {
//         "ClassName": "Recipe_IronRod_C",
//         "FullName": "BlueprintGeneratedClass /Game/FactoryGame/Recipes/Constructor/Recipe_IronRod.Recipe_IronRod_C",
//         "mDisplayName": "Iron Rod",
//         "mIngredients": "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronIngot/Desc_IronIngot.Desc_IronIngot_C'\",Amount=1))",
//         "mProduct": "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronRod/Desc_IronRod.Desc_IronRod_C'\",Amount=1))",
//         "mManufacturingMenuPriority": "1.000000",
//         "mManufactoringDuration": "4.000000",
//         "mManualManufacturingMultiplier": "0.500000",
//         "mProducedIn": "(\"/Game/FactoryGame/Buildable/Factory/ConstructorMk1/Build_ConstructorMk1.Build_ConstructorMk1_C\",\"/Game/FactoryGame/Buildable/-Shared/WorkBench/BP_WorkBenchComponent.BP_WorkBenchComponent_C\",\"/Script/FactoryGame.FGBuildableAutomatedWorkBench\")",
//         "mRelevantEvents": "",
//         "mVariablePowerConsumptionConstant": "0.000000",
//         "mVariablePowerConsumptionFactor": "1.000000"
//     },

// ## mType
// EST_MAM = Mam Research
// EST_Milestone = Milestone, given by mTechTier
// EST_Tutorial = Pre milestone
// EST_Custom = Starting recipes or other (shop, hidden stuff, etc)

// ## mUnlocks
// contains the recipes and buildings unlocked

//unfortunately, satisfactory has pak files, so we can't just read the files directly. We'll solve the issue of icons later, for now we'll just get the data.
import fs from 'fs';
import {
  CategoryJson,
  Entities,
  FuelJson,
  ItemJson,
  MachineJson,
  ModData,
  ModHash,
  RecipeJson,
  TechnologyJson,
  toEntities,
} from '~/models';
import {
  coerceArray,
  coerceString,
  emptyModHash,
  logTime,
  logWarn,
  round,
} from './helpers';
import { log } from 'console';
import { json } from 'd3';

type SfyData = SfyRecipeData | SfyResearchData;

interface SfyRecipeData {
  NativeClass: "/Script/CoreUObject.Class'/Script/FactoryGame.FGRecipe'";
  Classes: SfyRecipe[];
}
interface SfyResearchData {
  NativeClass: "/Script/CoreUObject.Class'/Script/FactoryGame.FGSchematic'";
  Classes: SfyResearch[];
}

interface SfyRecipe {
  ClassName: string;
  FullName: string;
  mDisplayName: string;
  mIngredients: SfyIngredient[] | '';
  mProduct: SfyIngredient[];
  mManufacturingMenuPriority: string;
  mManufactoringDuration: string;
  mManualManufacturingMultiplier: string;
  mProducedIn: string[] | string;
  mRelevantEvents: string;
  mVariablePowerConsumptionConstant: string;
  mVariablePowerConsumptionFactor: string;
}

interface SfyResearch {
  ClassName: string;
  FullName: string;
  mType: string;
  mDisplayName: string;
  mDescription: string;
  mStatisticGameplayTag: string;
  mSubCategories: string;
  mMenuPriority: string;
  mTechTier: string;
  mCost: { ItemClass: string; Amount: number }[] | '';
  mTimeToComplete: string;
  mRelevantShopSchematics: string;
  mIsPlayerSpecific: string;
  mUnlocks: SfyUnlock[];
  mSchematicIcon: string;
  mSmallSchematicIcon: string;
  mSchematicDependencies: string;
  mDependenciesBlocksSchematicAccess: string;
  mHiddenUntilDependenciesMet: string;
  mRelevantEvents: string;
  mSchematicUnlockTag: string;
  mIncludeInBuilds: string;
}

interface SfyUnlock {
  Class: string;
  mRecipes: string[];
}

interface SfyIngredient {
  ItemClass: string;
  Amount: number;
}

function parseSimpleTupleArray(str: string): string[] {
  const regex = /\("([^"]+)"\)/g;
  const result = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    result.push(match[1]);
  }
  return result;
}

// parse ((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/QuartzCrystal/Desc_QuartzCrystal.Desc_QuartzCrystal_C'\",Amount=10),(ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/Rubber/Desc_Rubber.Desc_Rubber_C'\",Amount=7),(ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/CircuitBoardHighSpeed/Desc_CircuitBoardHighSpeed.Desc_CircuitBoardHighSpeed_C'\",Amount=1))
// into ItemClass= ... and Amount = ...
// should work with any kv
function parseKeyValuePairs(str: string): Record<string, any> {
  const obj: any = {};
  const regex = /(\w+)=("([^"]*)"|'([^']*)'|[^,()]+)/g;
  let match;

  while ((match = regex.exec(str)) !== null) {
    const key = match[1];
    const value = match[3] || match[4] || match[2] || match[5];

    let cleanValue = value.trim();

    // Remove surrounding quotes
    if (
      (cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
      (cleanValue.startsWith("'") && cleanValue.endsWith("'"))
    ) {
      cleanValue = cleanValue.substring(1, cleanValue.length - 1);
    }

    // Convert numeric values
    if (!isNaN(Number(cleanValue)) && cleanValue !== '') {
      obj[key] = Number(cleanValue);
    } else {
      obj[key] = cleanValue;
    }
  }

  return obj;
}

function parseStringTuple(str: string): string[] | string {
  try {
    str = str.trim();

    if (str.startsWith('(') && str.endsWith(')')) {
      str = str.substring(1, str.length - 1);
    } else {
      throw new Error();
    }

    // Match strings enclosed in quotes, handling escaped quotes
    const regex = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^,]+/g;
    const result = [];
    let match;

    while ((match = regex.exec(str)) !== null) {
      let value = match[0].trim();

      // Remove surrounding quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.substring(1, value.length - 1);
      }

      // Unescape any escaped quotes
      value = value.replace(/\\"/g, '"').replace(/\\'/g, "'");

      result.push(value);
    }

    return result;
  } catch (error) {
    console.error('Error parsing string tuple:', str, 'error:', error);
    return str;
  }
}

function parseTupleArray(str: string): any[] | string {
  try {
    str = str.trim();

    // remove outer parentheses
    if (str.startsWith('((') && str.endsWith('))')) {
      str = str.substring(2, str.length - 2);
    } else if (str.startsWith('(') && str.endsWith(')')) {
      str = str.substring(1, str.length - 1);
    } else {
      throw new Error();
    }

    // split the string on '),('
    const items = str.split(/\),\s*\(/);

    const result = items.map((item) => {
      item = item.replace(/^\(+|\)+$/g, '');
      const obj = parseKeyValuePairs(item);
      return obj;
    });

    return result;
  } catch (error) {
    console.error('Error parsing tuple array:', str, 'error:', error);
    return str;
  }
}

function reviver(key: string, value: any) {
  if (typeof value === 'string') {
    // Detect tuple arrays by checking for starting and ending parentheses
    if (/^\s*\(.*\)\s*$/.test(value)) {
      if (value.includes('=')) {
        // It's likely a key-value tuple
        return parseTupleArray(value);
      } else {
        // It's a tuple of strings
        return parseStringTuple(value);
      }
    }
  }
  return value;
}

function filterData<
  K extends SfyData['NativeClass'],
  F extends Extract<SfyData, { NativeClass: K }>['Classes'][number],
>(data: SfyData[], nativeClassFilter: K, innerFilter: (d: F) => boolean): F[] {
  return data
    .filter((d) => d.NativeClass === nativeClassFilter)
    .map((d) => d.Classes)
    .flat()
    .filter(innerFilter as any) as F[];
}

function getId(s: string): string {
  return s.split('.').pop()?.replace("'", '') || '';
}

const denied = [
  "/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Recipes/Buildings",
  "/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Buildable/",
  "/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Prototype/Buildable/",
  "/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Recipes/Vehicle/",
];

const satisfactory_path = process.argv[2];
let mode: 'normal' | 'expensive' = 'normal';
if (!satisfactory_path) {
  throw new Error('Please specify path to satisfactory installation directory');
}
const docs_path = `${satisfactory_path}/CommunityResources/Docs`;
const en_us_path = `${docs_path}/en-US.json`;
let fileContent = fs.readFileSync(en_us_path, 'utf16le');
// Remove BOM if present
if (fileContent.charCodeAt(0) === 0xfeff) {
  fileContent = fileContent.slice(1);
}
// Replace tabs with spaces or just remove them
fileContent = fileContent.replace(/\t/g, ' '); // or replace with ''
const data: SfyData[] = JSON.parse(fileContent, reviver);

const recipes: SfyRecipe[] = filterData(
  data,
  "/Script/CoreUObject.Class'/Script/FactoryGame.FGRecipe'",
  (mRecipe) =>
    typeof mRecipe.mProducedIn !== 'string' &&
    // we don't want buildgun recipes except conveyors and pipes
    (mRecipe.mProducedIn.every(
      (pi) =>
        pi !== '/Game/FactoryGame/Equipment/BuildGun/BP_BuildGun.BP_BuildGun_C',
    ) ||
      mRecipe.mProduct[0].ItemClass.includes('Factory/PipelineMk') ||
      mRecipe.mProduct[0].ItemClass.includes('Factory/ConveyorBelt')) &&
    !mRecipe.mDisplayName.includes('Discontinued'),
);

log(`Found ${recipes.length} recipes`);
log(`first recipe: ${JSON.stringify(recipes[0], null, 2)}`);
//all recipe names
log(`all recipe names: ${recipes.map((r) => r.mDisplayName).join(', ')}`);

const somersloop = [];
const mining = [];

// now, gather all items in the recipes
const items = new Map<string, Partial<ItemJson>>();
for (const mRecipe of recipes) {
  for (const product of mRecipe.mProduct) {
    items.set(product.ItemClass, {
      id: product.ItemClass,
    });
  }
  for (const ingredient of mRecipe.mIngredients) {
    if (typeof ingredient !== 'string') {
      items.set(ingredient.ItemClass, {
        id: ingredient.ItemClass,
      });
    }
  }
}

mining.push(
  ...[...items.keys()].filter((i) => i.includes('RawResource')).map(getId),
);

// now, get all technology unlocks in /Script/CoreUObject.Class'/Script/FactoryGame.FGSchematic
const technology: SfyResearch[] = filterData(
  data,
  "/Script/CoreUObject.Class'/Script/FactoryGame.FGSchematic'",
  (d: SfyResearch) =>
    d.mUnlocks.some(
      (c) =>
        c.Class === 'BP_UnlockRecipe_C' &&
        !c.mRecipes.every((r) => denied.some((d) => r.includes(d))),
    ) &&
    d.mCost ==
      '' /* ||  !d.mCost.some((c) => c.ItemClass.includes('/Events')) */ &&
    !d.mDisplayName.includes('Discontinued'),
);
const modPath = `./src/data/sfy`;
const modDataPath = `${modPath}/data.json`;
const modHashPath = `${modPath}/hash.json`;

const modData: ModData = {
  version: {},
  categories: [],
  icons: [],
  items: [],
  recipes: [],
  limitations: {},
};

// We go through each unlock opportunity, find the recipe it unlocks, find those items.
for (const tech of technology) {
  for (const tech_recipes of tech.mUnlocks.filter(
    (u) => u.Class === 'BP_UnlockRecipe_C',
  )) {
    for (const _mRecipe of tech_recipes.mRecipes) {
      const mRecipe: SfyRecipe | undefined = recipes.find(
        (r) => r.ClassName === getId(_mRecipe),
      );
      if (
        mRecipe === undefined ||
        typeof mRecipe.mProducedIn === 'string' ||
        mRecipe.mProducedIn.every((pi) =>
          pi.includes(
            '/Game/FactoryGame/Equipment/BuildGun/BP_BuildGun.BP_BuildGun_C',
          ),
        )
      ) {
        continue;
      }
      let inp;
      if (mRecipe.mIngredients !== '') {
        inp = Object.fromEntries(
          mRecipe.mIngredients.map((i) => [getId(i.ItemClass), i.Amount]),
        );
      } else {
        inp = {};
      }
      const out = Object.fromEntries(
        mRecipe.mProduct.map((i) => [getId(i.ItemClass), i.Amount]),
      );
      const id = getId(mRecipe.ClassName);
      if (
        mRecipe.mProducedIn.some(
          (pr) =>
            pr.includes('Buildable/Factory/') && !pr.includes('Build_Packager'),
        )
      ) {
        somersloop.push(id);
      }
      const r: RecipeJson = {
        name: mRecipe.mDisplayName,
        category: 'recipe', // TODO: fix
        id,
        time: mRecipe.mManufactoringDuration,
        producers: mRecipe.mProducedIn
          .map((pi) => getId(pi))
          .filter((pi) => pi !== undefined),
        in: inp,
        out,
        row: 0,
        unlockedBy: getId(tech.ClassName),
      };
      if (modData.recipes.some((modR) => modR.id === r.id)) {
        logWarn(`Duplicate recipe id: ${r.id}`);
      } else {
        modData.recipes.push(r);
      }
    }
  }
}

modData.items.push(
  ...technology.flatMap((u) => {
    const row = 0;
    return {
      id: getId(u.ClassName) + '-technology',
      row,
      name: u.mDisplayName,
      category: 'technology',
    } as ItemJson;
  }),
);

modData.icons.push(
  ...[...items].map((i) => {
    return {
      id: `${getId(i[1].id || '')}`,
      position: '-576px -0px',
      color: '#746255',
    };
  }),
);
modData.icons.push(
  ...[...technology].map((i) => {
    return {
      id: `${getId(i.ClassName)}-technology`,
      position: '-576px -0px',
      color: '#746255',
    };
  }),
);
modData.icons.push(
  ...[...modData.recipes].map((i) => {
    return {
      id: `${i.id}`,
      position: '-576px -0px',
      color: '#746255',
    };
  }),
);

const oldData: ModData = JSON.parse(fs.readFileSync(modDataPath, 'utf8'));
const oldHash = JSON.parse(fs.readFileSync(modHashPath, 'utf8'));

modData.defaults = oldData.defaults;

modData.limitations['mining'] = mining;
modData.limitations['somersloop'] = somersloop;

const modHashReport = emptyModHash();
function addIfMissing(hash: ModHash, key: keyof ModHash, id: string): void {
  if (hash[key] == null) hash[key] = [];

  if (hash[key].indexOf(id) === -1) {
    hash[key].push(id);
    modHashReport[key].push(id);
  }
}

modData.items.forEach((i) => {
  addIfMissing(oldHash, 'items', i.id);

  if (i.beacon) addIfMissing(oldHash, 'beacons', i.id);
  if (i.belt) addIfMissing(oldHash, 'belts', i.id);
  if (i.fuel) addIfMissing(oldHash, 'fuels', i.id);
  if (i.cargoWagon || i.fluidWagon) addIfMissing(oldHash, 'wagons', i.id);
  if (i.machine) addIfMissing(oldHash, 'machines', i.id);
  if (i.technology) addIfMissing(oldHash, 'technologies', i.id);
});

modData.recipes.forEach((r) => addIfMissing(oldHash, 'recipes', r.id));

fs.writeFileSync(modHashPath, JSON.stringify(oldHash, null, 4));

fs.writeFileSync(modDataPath, JSON.stringify(modData, null, 4));
