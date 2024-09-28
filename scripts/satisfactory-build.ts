/**
 * This script is used to update the Satisfactory (sfy) mod set
 * in %STEAM%\steamapps\common\Satisfactory\CommunityResources\Docs there are localization files also containing recipes and unlocks.
 * We will fill the data from these files into the src/sfy/data.json file.
 */

import fs from 'fs';
import { ItemJson, ModData, ModHash, RecipeJson } from '~/models';
import { emptyModHash, logWarn } from './helpers';
import { log } from 'console';

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

const denied = [
  "/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Recipes/Buildings",
  "/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Buildable/",
  "/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Prototype/Buildable/",
  "/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Recipes/Vehicle/",
];

function parseSimpleTupleArray(str: string): string[] {
  const regex = /\("([^"]+)"\)/g;
  const result = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    result.push(match[1]);
  }
  return result;
}

function parseKeyValuePairs(str: string): Record<string, any> {
  const obj: any = {};
  const regex = /(\w+)=("([^"]*)"|'([^']*)'|[^,()]+)/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    const key = match[1];
    const value = match[3] || match[4] || match[2] || match[5];
    let cleanValue = value.trim();
    if (
      (cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
      (cleanValue.startsWith("'") && cleanValue.endsWith("'"))
    ) {
      cleanValue = cleanValue.substring(1, cleanValue.length - 1);
    }
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
    const regex = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^,]+/g;
    const result = [];
    let match;
    while ((match = regex.exec(str)) !== null) {
      let value = match[0].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.substring(1, value.length - 1);
      }
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
    if (str.startsWith('((') && str.endsWith('))')) {
      str = str.substring(2, str.length - 2);
    } else if (str.startsWith('(') && str.endsWith(')')) {
      str = str.substring(1, str.length - 1);
    } else {
      throw new Error();
    }
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
    if (/^\s*\(.*\)\s*$/.test(value)) {
      if (value.includes('=')) {
        return parseTupleArray(value);
      } else {
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

function readDataFile(filePath: string): SfyData[] {
  let fileContent = fs.readFileSync(filePath, 'utf16le');
  if (fileContent.charCodeAt(0) === 0xfeff) {
    fileContent = fileContent.slice(1);
  }
  fileContent = fileContent.replace(/\t/g, ' ');
  return JSON.parse(fileContent, reviver);
}

function processRecipes(data: SfyData[]): SfyRecipe[] {
  return filterData(
    data,
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGRecipe'",
    (mRecipe) =>
      typeof mRecipe.mProducedIn !== 'string' &&
      (mRecipe.mProducedIn.every(
        (pi) =>
          pi !==
          '/Game/FactoryGame/Equipment/BuildGun/BP_BuildGun.BP_BuildGun_C',
      ) ||
        mRecipe.mProduct[0].ItemClass.includes('Factory/PipelineMk') ||
        mRecipe.mProduct[0].ItemClass.includes('Factory/ConveyorBelt')) &&
      !mRecipe.mDisplayName.includes('Discontinued'),
  );
}

function extractItemsFromRecipes(
  recipes: SfyRecipe[],
): Map<string, Partial<ItemJson>> {
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
  return items;
}

function extractMiningItems(items: Map<string, Partial<ItemJson>>): string[] {
  return [...items.keys()].filter((i) => i.includes('RawResource')).map(getId);
}

function processTechnologies(data: SfyData[]): SfyResearch[] {
  return filterData(
    data,
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGSchematic'",
    (d: SfyResearch) =>
      d.mUnlocks.some(
        (c) =>
          c.Class === 'BP_UnlockRecipe_C' &&
          !c.mRecipes.every((r) => denied.some((d) => r.includes(d))),
      ) &&
      d.mCost == '' &&
      !d.mDisplayName.includes('Discontinued'),
  );
}

function buildModData(
  recipes: SfyRecipe[],
  technologies: SfyResearch[],
  miningItems: string[],
  somersloopRecipes: string[],
  items: Map<string, Partial<ItemJson>>,
): ModData {
  const modData: ModData = {
    version: {},
    categories: [],
    icons: [],
    items: [],
    recipes: [],
    limitations: {},
  };

  const itemMap = items;

  modData.items.push(
    ...technologies.map((tech) => ({
      id: getId(tech.ClassName) + '-technology',
      row: 0,
      name: tech.mDisplayName,
      category: 'technology',
    })),
    ...[...itemMap.values()].map((item) => ({
      id: getId(item.id || ''),
      row: 0,
      name: '',
      category: 'item',
    })),
  );

  for (const tech of technologies) {
    for (const techUnlock of tech.mUnlocks.filter(
      (u) => u.Class === 'BP_UnlockRecipe_C',
    )) {
      for (const recipeClassName of techUnlock.mRecipes) {
        const mRecipe = recipes.find(
          (r) => r.ClassName === getId(recipeClassName),
        );
        if (
          !mRecipe ||
          typeof mRecipe.mProducedIn === 'string' ||
          mRecipe.mProducedIn.every((pi) =>
            pi.includes(
              '/Game/FactoryGame/Equipment/BuildGun/BP_BuildGun.BP_BuildGun_C',
            ),
          )
        ) {
          continue;
        }
        const inputs =
          mRecipe.mIngredients !== ''
            ? Object.fromEntries(
                mRecipe.mIngredients.map((i) => [getId(i.ItemClass), i.Amount]),
              )
            : {};
        const outputs = Object.fromEntries(
          mRecipe.mProduct.map((i) => [getId(i.ItemClass), i.Amount]),
        );
        const id = getId(mRecipe.ClassName);
        if (
          mRecipe.mProducedIn.some(
            (pr) =>
              pr.includes('Buildable/Factory/') &&
              !pr.includes('Build_Packager'),
          )
        ) {
          somersloopRecipes.push(id);
        }
        const recipe: RecipeJson = {
          name: mRecipe.mDisplayName,
          category: 'recipe',
          id,
          time: parseFloat(mRecipe.mManufactoringDuration),
          producers: mRecipe.mProducedIn
            .map((pi) => getId(pi))
            .filter((pi) => pi !== undefined),
          in: inputs,
          out: outputs,
          row: 0,
          unlockedBy: getId(tech.ClassName),
        };
        if (modData.recipes.some((modR) => modR.id === recipe.id)) {
          logWarn(`Duplicate recipe id: ${recipe.id}`);
        } else {
          modData.recipes.push(recipe);
        }
      }
    }
  }

  const itemIcons = [...itemMap.values()].map((item) => ({
    id: getId(item.id || ''),
    position: '-576px -0px',
    color: '#746255',
  }));
  const technologyIcons = technologies.map((tech) => ({
    id: `${getId(tech.ClassName)}-technology`,
    position: '-576px -0px',
    color: '#746255',
  }));
  const recipeIcons = modData.recipes.map((recipe) => ({
    id: recipe.id,
    position: '-576px -0px',
    color: '#746255',
  }));
  modData.icons.push(...itemIcons, ...technologyIcons, ...recipeIcons);

  modData.limitations['mining'] = miningItems;
  modData.limitations['somersloop'] = somersloopRecipes;

  return modData;
}

function updateModHash(modData: ModData, oldHash: ModHash): ModHash {
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
  return oldHash;
}

function main() {
  const satisfactoryPath = process.argv[2];
  if (!satisfactoryPath) {
    throw new Error(
      'Please specify path to satisfactory installation directory',
    );
  }
  const docsPath = `${satisfactoryPath}/CommunityResources/Docs`;
  const enUsPath = `${docsPath}/en-US.json`;
  const data: SfyData[] = readDataFile(enUsPath);

  const recipes = processRecipes(data);
  log(`Found ${recipes.length} recipes`);
  log(`First recipe: ${JSON.stringify(recipes[0], null, 2)}`);
  log(`All recipe names: ${recipes.map((r) => r.mDisplayName).join(', ')}`);

  const items = extractItemsFromRecipes(recipes);
  const miningItems = extractMiningItems(items);
  const somersloopRecipes: string[] = [];

  const technologies = processTechnologies(data);

  const modPath = `./src/data/sfy`;
  const modDataPath = `${modPath}/data.json`;
  const modHashPath = `${modPath}/hash.json`;

  const modData = buildModData(
    recipes,
    technologies,
    miningItems,
    somersloopRecipes,
    items,
  );

  const oldData: ModData = JSON.parse(fs.readFileSync(modDataPath, 'utf8'));
  const oldHash: ModHash = JSON.parse(fs.readFileSync(modHashPath, 'utf8'));

  modData.defaults = oldData.defaults;

  const updatedHash = updateModHash(modData, oldHash);

  fs.writeFileSync(modHashPath, JSON.stringify(updatedHash, null, 4));
  fs.writeFileSync(modDataPath, JSON.stringify(modData, null, 4));
}

main();
