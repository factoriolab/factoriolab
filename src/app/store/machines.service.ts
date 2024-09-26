import { computed, inject, Injectable } from '@angular/core';

import { coalesce, spread } from '~/helpers';
import { Dataset } from '~/models/dataset';
import { EnergyType } from '~/models/enum/energy-type';
import {
  MachineSettings,
  MachineState,
} from '~/models/settings/machine-settings';
import { Settings } from '~/models/settings/settings';
import { Entities } from '~/models/utils';
import { RecipeUtility } from '~/utilities/recipe.utility';

import { SettingsService } from './settings.service';
import { EntityStore } from './store';

export type MachinesState = Entities<MachineState>;
export type MachinesSettings = Entities<MachineSettings>;

@Injectable({
  providedIn: 'root',
})
export class MachinesService extends EntityStore<MachineState> {
  settingsSvc = inject(SettingsService);

  settings = computed(() =>
    MachinesService.computeMachinesSettings(
      this.state(),
      this.settingsSvc.settings(),
      this.settingsSvc.dataset(),
    ),
  );

  static computeMachinesSettings(
    state: MachinesState,
    settings: Settings,
    data: Dataset,
  ): MachinesSettings {
    const value: MachinesSettings = {};
    for (const id of data.machineIds) {
      const machine = data.machineEntities[id];
      const s: MachineSettings = spread(state[id]);

      if (machine.type === EnergyType.Burner) {
        s.fuelOptions = RecipeUtility.fuelOptions(machine, data);
        s.defaultFuelId = RecipeUtility.bestMatch(
          s.fuelOptions.map((o) => o.value),
          settings.fuelRankIds,
        );
        s.fuelId = coalesce(s?.fuelId, s.defaultFuelId);
      } else {
        // Machine doesn't support fuel, remove any
        delete s.fuelId;
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
      } else {
        // Machine doesn't support modules, remove any
        delete s.modules;
        delete s.beacons;
      }

      s.defaultOverclock = settings.overclock;
      s.overclock = coalesce(s.overclock, s.defaultOverclock);

      value[id] = s;
    }

    return value;
  }
}
