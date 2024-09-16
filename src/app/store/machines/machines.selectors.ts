import { createSelector } from '@ngrx/store';

import { Entities } from '~/models/entities';
import { EnergyType } from '~/models/enum/energy-type';
import { MachineSettings } from '~/models/settings/machine-settings';
import { RecipeUtility } from '~/utilities/recipe.utility';

import { LabState } from '../';
import { selectDataset, selectSettings } from '../settings/settings.selectors';
import { MachinesState } from './machines.reducer';

/* Base selector functions */
export const machinesState = (state: LabState): MachinesState =>
  state.machinesState;

/* Complex selectors */
export const selectMachinesState = createSelector(
  machinesState,
  selectSettings,
  selectDataset,
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
