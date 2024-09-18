import fs from 'fs';

import { ModData } from '~/models/data/mod-data';

import { ModList } from './factorio-build.models';
import { getJsonData } from './helpers/file.helpers';

/**
 * This script is intended to prep a Factorio dump for a specific mod set by
 * updating the mod-list.json file with the list of mods the existing data set.
 */

const mod = process.argv[2];
if (!mod) {
  throw new Error(
    'Please specify a mod to process by the folder name, e.g. "1.1" for src/data/1.1',
  );
}

// Set up paths
const appDataPath = process.env['AppData'] ?? '';
const factorioPath = `${appDataPath}/Factorio`;
const modsPath = `${factorioPath}/mods`;
const modListPath = `${modsPath}/mod-list.json`;
const modPath = `./src/data/${mod}`;
const modDataPath = `${modPath}/data.json`;
const modSettingsSourcePath = `${modPath}/mod-settings.dat`;
const modSettingsDestPath = `${modsPath}/mod-settings.dat`;

function dumpPrep(): void {
  // Read mod data
  const modList = getJsonData(modListPath) as ModList;
  const data = getJsonData(modDataPath) as ModData;

  Object.keys(data.version).forEach((key) => {
    const mod = modList.mods.find((m) => m.name === key);
    if (mod == null)
      throw new Error(`Mod ${key} not found, may need to be installed`);
  });

  modList.mods.forEach((m) => {
    m.enabled = data.version[m.name] != null;
  });

  fs.writeFileSync(modListPath, JSON.stringify(modList));

  if (fs.existsSync(modSettingsSourcePath)) {
    // Copy settings into mods folder
    fs.copyFileSync(modSettingsSourcePath, modSettingsDestPath);
    console.log('Copied saved `mod-settings.dat` file into mods folder');
  }

  console.log(
    `Enabled mods: ${modList.mods
      .filter((m) => m.enabled)
      .map((m) => m.name)
      .join(', ')}`,
  );
}

dumpPrep();
