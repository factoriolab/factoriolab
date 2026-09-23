import fs from 'fs';

import { datasets } from '~/data/datasets';
import { CUSTOM_MOD } from '~/data/game';
import { BeltJson } from '~/data/schema/belt';
import {
  CustomPresetsJson,
  HardCodedPresetsJson,
} from '~/data/schema/defaults';
import { FuelJson } from '~/data/schema/fuel';
import { ItemJson } from '~/data/schema/item';
import { MachineJson } from '~/data/schema/machine';
import { ModData } from '~/data/schema/mod-data';

import { FLUID_TYPE, ITEM_TYPE } from './factorio-build.models';
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
  // const modDefaultsPath = `${modPath}/defaults.json`;

  if (fs.existsSync(modDataPath)) {
    const data = getJsonData(modDataPath) as ModData;

    for (const item of data.items) {
      if (item.technology) continue;

      if (item.stack) {
        item.types = [ITEM_TYPE];
      } else {
        item.types = [FLUID_TYPE];
      }

      if (item.belt) {
        item.belt.itemTypes = [ITEM_TYPE];
      }

      const pipeItem = item as ItemJson & { pipe?: BeltJson };
      if (pipeItem.pipe) {
        pipeItem.pipe.itemTypes = [FLUID_TYPE];
        pipeItem.belt = pipeItem.pipe;
        delete pipeItem.pipe;
      }

      const cargoWagonItem = item as ItemJson & {
        cargoWagon?: { size: number | string };
      };
      if (cargoWagonItem.cargoWagon) {
        cargoWagonItem.wagon = {
          itemTypes: [ITEM_TYPE],
          capacity: cargoWagonItem.cargoWagon.size,
          capacityType: 'stacks',
        };
        delete cargoWagonItem.cargoWagon;
      }

      const fluidWagonItem = item as ItemJson & {
        fluidWagon?: { capacity: number | string };
      };
      if (fluidWagonItem.fluidWagon) {
        fluidWagonItem.wagon = {
          itemTypes: [FLUID_TYPE],
          capacity: fluidWagonItem.fluidWagon.capacity,
        };
        delete fluidWagonItem.fluidWagon;
      }

      if (item.fuel) {
        const fuel = item.fuel as FuelJson & { category?: string };
        if (fuel.category) {
          item.fuel.types = [fuel.category];
          delete fuel.category;
        }
      }

      if (item.machine) {
        const machine = item.machine as MachineJson & {
          fuelCategories?: string[];
        };
        if (machine.fuelCategories) {
          item.machine.fuelTypes = machine.fuelCategories;
          delete machine.fuelCategories;
        }
      }
    }

    if (data.defaults) {
      if ('presets' in data.defaults) {
        const modDefaults = data.defaults as CustomPresetsJson & {
          belt?: string;
          pipe?: string;
          cargoWagon?: string;
          fluidWagon?: string;
        };

        modDefaults.beltRank = [];
        if (modDefaults.belt) {
          modDefaults.beltRank.push(modDefaults.belt);
          delete modDefaults.belt;
        }

        if (modDefaults.pipe) {
          modDefaults.beltRank.push(modDefaults.pipe);
          delete modDefaults.pipe;
        }

        if (!modDefaults.beltRank.length) delete modDefaults.beltRank;

        modDefaults.wagonRank = [];
        if (modDefaults.cargoWagon) {
          modDefaults.wagonRank.push(modDefaults.cargoWagon);
          delete modDefaults.cargoWagon;
        }

        if (modDefaults.fluidWagon) {
          modDefaults.wagonRank.push(modDefaults.fluidWagon);
          delete modDefaults.fluidWagon;
        }

        if (!modDefaults.wagonRank.length) delete modDefaults.wagonRank;
      } else {
        const modDefaults = data.defaults as HardCodedPresetsJson & {
          minBelt?: string;
          maxBelt?: string;
          minPipe?: string;
          maxPipe?: string;
          cargoWagon?: string;
          fluidWagon?: string;
        };

        modDefaults.minBeltRank = [];
        if (modDefaults.minBelt) {
          modDefaults.minBeltRank.push(modDefaults.minBelt);
          delete modDefaults.minBelt;
        }

        if (modDefaults.minPipe) {
          modDefaults.minBeltRank.push(modDefaults.minPipe);
          delete modDefaults.minPipe;
        }

        if (!modDefaults.minBeltRank.length) delete modDefaults.minBeltRank;

        modDefaults.maxBeltRank = [];
        if (modDefaults.maxBelt) {
          modDefaults.maxBeltRank.push(modDefaults.maxBelt);
          delete modDefaults.maxBelt;
        }

        if (modDefaults.maxPipe) {
          modDefaults.maxBeltRank.push(modDefaults.maxPipe);
          delete modDefaults.maxPipe;
        }

        if (!modDefaults.maxBeltRank.length) delete modDefaults.maxBeltRank;

        modDefaults.wagonRank = [];
        if (modDefaults.cargoWagon) {
          modDefaults.wagonRank.push(modDefaults.cargoWagon);
          delete modDefaults.cargoWagon;
        }

        if (modDefaults.fluidWagon) {
          modDefaults.wagonRank.push(modDefaults.fluidWagon);
          delete modDefaults.fluidWagon;
        }

        if (!modDefaults.wagonRank.length) delete modDefaults.wagonRank;
      }
      writeJsonData(modDataPath, data);
    }
  }

  logTime(
    `Updated mod '${mod}' (${(i + 1).toString()} of ${mods.length.toString()})`,
  );
}
