import { computed, inject, Injectable } from '@angular/core';

import { spread } from '~/helpers';
import { Dataset } from '~/models/dataset';
import { EnergyType } from '~/models/enum/energy-type';
import { MachineSettings } from '~/models/settings/machine-settings';
import { SettingsComplete } from '~/models/settings/settings-complete';
import { Entities } from '~/models/utils';
import { RecipeUtility } from '~/utilities/recipe.utility';

import { SettingsService } from './settings.service';
import { EntityStore } from './store';

export type MachinesState = Entities<MachineSettings>;

@Injectable({
  providedIn: 'root',
})
export class MachinesService extends EntityStore<MachineSettings> {
  settingsSvc = inject(SettingsService);

  machinesState = computed(() =>
    MachinesService.computeMachinesState(
      this.state(),
      this.settingsSvc.settings(),
      this.settingsSvc.dataset(),
    ),
  );

  static computeMachinesState(
    state: MachinesState,
    settings: SettingsComplete,
    data: Dataset,
  ): MachinesState {
    const value: Entities<MachineSettings> = {};
    for (const id of data.machineIds) {
      const s: MachineSettings = spread(state[id]);
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
  }
}
