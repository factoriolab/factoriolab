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
export const selectMachinesState = createSelector(
  machinesState,
  Settings.selectSettings,
  Settings.selectDataset,
  (state, settings, data) => {
    const value: Entities<MachineSettings> = {};
    for (const id of data.machineIds) {
      const s: MachineSettings = { ...state[id] };
      const machine = data.machineEntities[id];

      if (machine.type === EnergyType.Burner) {
        s.fuelOptions = RecipeUtility.fuelOptions(machine, data);
        s.fuelId =
          s.fuelId ??
          RecipeUtility.bestMatch(
            s.fuelOptions.map((o) => o.value),
            settings.fuelRankIds,
          );
      }

      if (machine.modules) {
        s.moduleOptions = RecipeUtility.moduleOptions(machine, data);
        s.modules = RecipeUtility.hydrateModules(
          s.modules,
          s.moduleOptions,
          settings.moduleRankIds,
          machine.modules,
        );
        s.beacons = RecipeUtility.hydrateBeacons(s.beacons, settings.beacons);
      }

      s.overclock = s.overclock ?? settings.overclock;

      value[id] = s;
    }

    return value;
  },
);
