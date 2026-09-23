import fs from 'fs';

import { datasets } from '~/data/datasets';
import { CUSTOM_MOD } from '~/data/game';
import { ModData } from '~/data/schema/mod-data';
import { ModHash } from '~/data/schema/mod-hash';
import { emptyModHash, updateHash } from '~/utils/hash';

import { getJsonData, writeJsonData } from './utils/file';
import { logTime } from './utils/log';

// Load mods from arguments
let mods = process.argv.slice(2);
if (mods.length === 0)
  mods = datasets.mods.filter((m) => m.id !== CUSTOM_MOD).map((m) => m.id);

logTime(
  `Starting hash update for ${mods.length.toString()} mod${mods.length > 1 ? 's' : ''}...`,
);

for (let i = 0; i < mods.length; i++) {
  const mod = mods[i];
  const modPath = `./public/data/${mod}`;
  const modDataPath = `${modPath}/data.json`;
  const modHashPath = `${modPath}/hash.json`;

  const modData = getJsonData(modDataPath) as ModData;
  const modHash = fs.existsSync(modHashPath)
    ? (getJsonData(modHashPath) as ModHash)
    : emptyModHash();

  updateHash(modData, modHash);
  writeJsonData(modHashPath, modHash);

  logTime(
    `Updated mod '${mod}' (${(i + 1).toString()} of ${mods.length.toString()})`,
  );
}
