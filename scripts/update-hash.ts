import fs from 'fs';

import { datasets } from '~/data/datasets';
import { ModData } from '~/data/schema/mod-data';
import { ModHash } from '~/data/schema/mod-hash';
import { emptyModHash, updateHash } from '~/utils/hash';

import { getJsonData, writeJsonData } from './utils/file';

const modId = process.argv[2];

if (!modId) {
  throw new Error(
    'Please specify a mod to process by the folder name, e.g. "1.1" for src/data/1.1',
  );
}

const mod = datasets.mods.find((m) => m.id === modId);
if (!mod)
  throw new Error(
    'Please define this mod set in `src/data/index.ts` before running build.',
  );

const modPath = `./public/data/${modId}`;
const modDataPath = `${modPath}/data.json`;
const modHashPath = `${modPath}/hash.json`;

const modData = getJsonData(modDataPath) as ModData;
const modHash = fs.existsSync(modHashPath)
  ? (getJsonData(modHashPath) as ModHash)
  : emptyModHash();

updateHash(modData, modHash);
writeJsonData(modHashPath, modHash);
