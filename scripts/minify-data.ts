import fs from 'fs';

import { getJsonData } from './helpers/file.helpers';

const mod = process.argv[2];

if (!mod)
  throw new Error(
    'Please specify a mod to process by the folder name, e.g. "1.1" for src/data/1.1',
  );

const modPath = `./src/data/${mod}`;
const modDataPath = `${modPath}/data.json`;
const modHashPath = `${modPath}/hash.json`;

const modData = getJsonData(modDataPath);
const modHash = getJsonData(modHashPath);

fs.writeFileSync(modDataPath, JSON.stringify(modData));
fs.writeFileSync(modHashPath, JSON.stringify(modHash));
