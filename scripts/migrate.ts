import fs from 'fs';

import { datasets } from '~/data/datasets';
import { CUSTOM_MOD } from '~/data/game';
import { BaseCustomJson, DefaultsJson } from '~/data/schema/defaults';
import { ModData } from '~/data/schema/mod-data';

import { getJsonData } from './utils/file';
import { logTime } from './utils/log';

const CURRENT_FACTORIO_MODS = datasets.mods
  .filter((m) => m.id !== CUSTOM_MOD)
  .map((m) => m.id);

// Load mods from arguments
let mods = process.argv.slice(2);

// Fallback to update all mods
if (mods.length === 0) {
  mods = CURRENT_FACTORIO_MODS;
}

function convertCustom(custom: BaseCustomJson): void {
  if (custom.belt) {
    custom.beltRank ??= [];
    custom.beltRank.push(custom.belt);
    delete custom.belt;
  }

  if (custom.pipe) {
    custom.beltRank ??= [];
    custom.beltRank.push(custom.pipe);
    delete custom.pipe;
  }
}

function convertDefaults(defaults: DefaultsJson | undefined): void {
  if (defaults == null) return;
  if ('presets' in defaults) {
    convertCustom(defaults);
    defaults.presets.forEach((p) => {
      convertCustom(p);
    });
  } else {
    if (defaults.minBelt) {
      defaults.minBeltRank ??= [];
      defaults.minBeltRank.push(defaults.minBelt);
      delete defaults.minBelt;
    }

    if (defaults.maxBelt) {
      defaults.maxBeltRank ??= [];
      defaults.maxBeltRank.push(defaults.maxBelt);
      delete defaults.maxBelt;
    }

    if (defaults.minPipe) {
      defaults.minBeltRank ??= [];
      defaults.minBeltRank.push(defaults.minPipe);
      delete defaults.minPipe;
    }

    if (defaults.maxPipe) {
      defaults.maxBeltRank ??= [];
      defaults.maxBeltRank.push(defaults.maxPipe);
      delete defaults.maxPipe;
    }
  }

  if (defaults.cargoWagon) {
    defaults.wagonRank ??= [];
    defaults.wagonRank.push(defaults.cargoWagon);
    delete defaults.cargoWagon;
  }

  if (defaults.fluidWagon) {
    defaults.wagonRank ??= [];
    defaults.wagonRank.push(defaults.fluidWagon);
    delete defaults.fluidWagon;
  }
}

/** Run all scripts required to update an array of Factorio mod sets */
function updateMods(mods: string[]): void {
  for (let i = 0; i < mods.length; i++) {
    const mod = mods[i];
    const modPath = `./public/data/${mod}`;
    const modDataPath = `${modPath}/data.json`;
    const modDefaultsPath = `${modPath}/defaults.json`;
    const modData = getJsonData(modDataPath) as ModData;

    if (fs.existsSync(modDefaultsPath)) {
      const modDefaults = getJsonData(modDefaultsPath) as DefaultsJson;
      convertDefaults(modDefaults);
      fs.writeFileSync(
        modDefaultsPath,
        JSON.stringify(modDefaults, undefined, 2),
      );
      modData.defaults = modDefaults;
      fs.writeFileSync(modDataPath, JSON.stringify(modData));
    } else {
      convertDefaults(modData.defaults);
      fs.writeFileSync(modDataPath, JSON.stringify(modData));
    }

    logTime(
      `Migrated mod '${mod}' (${(i + 1).toString()} of ${mods.length.toString()})`,
    );
  }
}

logTime(
  `Starting migration for ${mods.length.toString()} mod${mods.length > 1 ? 's' : ''}...`,
);

updateMods(mods);
