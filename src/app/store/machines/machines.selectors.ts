import { createSelector } from '@ngrx/store';
import { SelectItem } from 'primeng/api';

import { getIdOptions } from '~/helpers';
import { EnergyType, Entities, Game, MachineSettings } from '~/models';
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
  Settings.getFuelRankIds,
  Settings.getDefaults,
  Settings.getDataset,
  (state, fuelRankIds, defaults, data) => {
    const ids = state.ids ?? defaults?.machineRankIds ?? [];

    const entities: Entities<MachineSettings> = {};
    const def: MachineSettings = { ...state.entities[''] };
    def.moduleRankIds = def.moduleRankIds ?? defaults?.moduleRankIds ?? [];
    def.moduleOptions = getIdOptions(
      data.moduleIds,
      data.itemEntities,
      data.game !== Game.Satisfactory,
    );
    if (data.game === Game.Factorio) {
      def.beaconCount = def.beaconCount ?? defaults?.beaconCount;
    }
    def.beaconId = def.beaconId ?? defaults?.beaconId;
    def.beaconModuleRankIds =
      def.beaconModuleRankIds ?? (defaults ? [defaults.beaconModuleId] : []);
    if (def.beaconId) {
      const beacon = data.beaconEntities[def.beaconId];
      def.beaconModuleOptions = RecipeUtility.moduleOptions(beacon, null, data);
    }

    if (data.game === Game.Satisfactory) {
      // Default = 100%
      def.overclock = def.overclock ?? 100;
    }
    entities[''] = def;

    for (const id of data.machineIds.filter((i) => data.itemEntities[i])) {
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
        s.moduleRankIds = s.moduleRankIds ?? def.moduleRankIds;
        s.moduleOptions = RecipeUtility.moduleOptions(machine, null, data);
        s.beaconCount = s.beaconCount != null ? s.beaconCount : def.beaconCount;
        s.beaconId = s.beaconId ?? def.beaconId;
        s.beaconModuleRankIds =
          s.beaconModuleRankIds ?? def.beaconModuleRankIds;
        if (s.beaconId) {
          const beacon = data.beaconEntities[s.beaconId];
          s.beaconModuleOptions = RecipeUtility.moduleOptions(
            beacon,
            null,
            data,
          );
        }
      }

      s.overclock = s.overclock ?? def.overclock;

      entities[id] = s;
    }

    return { ids, entities };
  },
);

export const getMachineOptions = createSelector(
  getMachinesState,
  Settings.getDataset,
  (machines, data) =>
    data.machineIds.map(
      (f): SelectItem => ({
        label: data.itemEntities[f].name,
        value: f,
        disabled: machines.ids.indexOf(f) !== -1,
      }),
    ),
);
