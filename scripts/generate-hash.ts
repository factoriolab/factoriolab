import fs from 'fs';

import { ModData } from '~/models/data/mod-data';

import { emptyModHash } from './helpers/data.helpers';
import { getJsonData } from './helpers/file.helpers';

const mod = process.argv[2];

if (!mod) {
  throw new Error(
    'Please specify a mod to process by the folder name, e.g. "1.1" for src/data/1.1',
  );
}

const modPath = `./src/data/${mod}`;
const modDataPath = `${modPath}/data.json`;
const modHashPath = `${modPath}/hash.json`;

const modData = getJsonData(modDataPath) as ModData;

const hash = emptyModHash();

modData.items.forEach((i) => {
  hash.items.push(i.id);

  if (i.beacon) hash.beacons.push(i.id);
  if (i.belt) hash.belts.push(i.id);
  if (i.fuel) hash.fuels.push(i.id);
  if (i.cargoWagon || i.fluidWagon) hash.wagons.push(i.id);
  if (i.machine) hash.machines.push(i.id);
  if (i.module) hash.modules.push(i.id);
  if (i.technology) hash.technologies.push(i.id);
});

modData.recipes.forEach((r) => hash.recipes.push(r.id));

fs.writeFileSync(modHashPath, JSON.stringify(hash));
