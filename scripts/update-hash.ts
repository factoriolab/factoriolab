import { datasets } from '~/data/datasets';
import { ModData } from '~/data/schema/mod-data';
import { ModHash } from '~/data/schema/mod-hash';
import { flags } from '~/state/flags';

import { updateHash } from './utils/data';
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
const modHash = getJsonData(modHashPath) as ModHash;
const modFlags = flags[mod.flags];

updateHash(modData, modHash, modFlags);
writeJsonData(modHashPath, modHash);
