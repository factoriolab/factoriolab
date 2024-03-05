import fs from 'fs';

import { ModData, ModHash } from '~/models';
import { getJsonData } from './helpers';

const mod = process.argv[2];

if (!mod) {
  throw new Error(
    'Please specify a mod to process by the folder name, e.g. "1.1" for src/data/1.1',
  );
}

const modPath = `./src/data/${mod}`;
const modDataPath = `${modPath}/data.json`;
const modHashPath = `${modPath}/hash.json`;

const modData = getJsonData<ModData>(modDataPath);
const modHash = getJsonData<ModHash>(modHashPath);

function addIfMissing(hash: ModHash, key: keyof ModHash, id: string): void {
  if (hash[key] == null) hash[key] = [];

  if (hash[key].indexOf(id) === -1) {
    hash[key].push(id);
  }
}

if (modData.defaults?.excludedRecipes) {
  // Filter excluded recipes for only recipes that exist
  modData.defaults.excludedRecipes = modData.defaults.excludedRecipes.filter(
    (e) => modData.recipes.some((r) => r.id === e),
  );
}

modData.items.forEach((i) => {
  addIfMissing(modHash, 'items', i.id);

  if (i.beacon) addIfMissing(modHash, 'beacons', i.id);
  if (i.belt) addIfMissing(modHash, 'belts', i.id);
  if (i.fuel) addIfMissing(modHash, 'fuels', i.id);
  if (i.cargoWagon || i.fluidWagon) addIfMissing(modHash, 'wagons', i.id);
  if (i.machine) addIfMissing(modHash, 'machines', i.id);
  if (i.module) addIfMissing(modHash, 'modules', i.id);
  if (i.technology) addIfMissing(modHash, 'technologies', i.id);
});

modData.recipes.forEach((r) => addIfMissing(modHash, 'recipes', r.id));

fs.writeFileSync(modHashPath, JSON.stringify(modHash));
fs.writeFileSync(modDataPath, JSON.stringify(modData));
