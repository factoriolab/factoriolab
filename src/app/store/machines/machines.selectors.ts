import { createSelector } from '@ngrx/store';

import { EnergyType, Entities, MachineSettings } from '~/models';
import { RecipeUtility } from '~/utilities';
import { LabState } from '../';
import * as Settings from '../settings';
import { MachinesState } from './machines.reducer';

/* Base selector functions */
export const machinesState = (state: LabState): MachinesState =>
  state.machinesState;

/* Complex selectors */
export const getMachinesState = createSelector(
  machinesState,
  Settings.getDefaults,
  Settings.getDataset,
  (state, defaults, data) => {
    const ids = state.ids ?? defaults?.machineRankIds ?? [];
    const fuelRankIds = state.fuelRankIds ?? defaults?.fuelRankIds ?? [];
    const moduleRankIds = state.moduleRankIds ?? defaults?.moduleRankIds ?? [];
    const beacons = state.beacons ?? defaults?.beacons ?? [];
    const overclock = state.overclock;
    const entities: Entities<MachineSettings> = {};

    for (const id of data.machineIds) {
      const s: MachineSettings = { ...state.entities[id] };
      const machine = data.machineEntities[id];

      if (machine.type === EnergyType.Burner) {
        s.fuelOptions = RecipeUtility.fuelOptions(machine, data);
        s.fuelId =
          s.fuelId ??
          RecipeUtility.bestMatch(
            s.fuelOptions.map((o) => o.value),
            fuelRankIds,
          );
      }

      if (machine.modules) {
        s.moduleOptions = RecipeUtility.moduleOptions(machine, data);
        s.modules =
          s.modules ??
          RecipeUtility.defaultModules(
            s.moduleOptions,
            moduleRankIds,
            machine.modules,
          );
        s.beacons = s.beacons ?? beacons;
      }

      s.overclock = s.overclock ?? overclock;

      entities[id] = s;
    }

    return { ids, fuelRankIds, moduleRankIds, beacons, overclock, entities };
  },
);
