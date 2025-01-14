import fs from 'fs';
import { data } from 'src/data';

import { DefaultsJson } from '~/models/data/defaults';
import { ModData } from '~/models/data/mod-data';

import { getJsonData } from './helpers/file.helpers';

data.mods.forEach((mod) => {
  const modPath = `./src/data/${mod.id}`;
  const modDataPath = `${modPath}/data.json`;
  const modDefaultsPath = `${modPath}/defaults.json`;
  const modData = getJsonData(modDataPath) as ModData;
  const modDefaults = getJsonData(modDefaultsPath) as DefaultsJson | null;
  if (modDefaults) {
    modData.defaults = modDefaults;
  }
  fs.writeFileSync(modDataPath, JSON.stringify(modData));
});
