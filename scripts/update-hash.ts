import fs from 'fs';
import { data } from 'src/data';

import { ModData } from '~/models/data/mod-data';
import { ModHash } from '~/models/data/mod-hash';
import { flags } from '~/models/flags';

import { updateHash } from './helpers/data.helpers';
import { getJsonData } from './helpers/file.helpers';

const modId = process.argv[2];

if (!modId) {
  throw new Error(
    'Please specify a mod to process by the folder name, e.g. "1.1" for src/data/1.1',
  );
}

const mod = data.mods.find((m) => m.id === modId);
if (!mod)
  throw new Error(
    'Please define this mod set in `src/data/index.ts` before running build.',
  );

const modPath = `./src/data/${modId}`;
const modDataPath = `${modPath}/data.json`;
const modHashPath = `${modPath}/hash.json`;

const modData = getJsonData(modDataPath) as ModData;
const modHash = getJsonData(modHashPath) as ModHash;
const modFlags = flags[mod.flags];

updateHash(modData, modHash, modFlags);

fs.writeFileSync(modHashPath, JSON.stringify(modHash));
