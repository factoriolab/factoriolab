import { computed, inject, Injectable } from '@angular/core';

import { Dataset } from '~/models/dataset';
import { EnergyType } from '~/models/enum/energy-type';
import { MachineSettings } from '~/models/settings/machine-settings';
import { SettingsComplete } from '~/models/settings/settings-complete';
import { EntityStore } from '~/models/store';
import { Entities } from '~/models/utils';
import { RecipeUtility } from '~/utilities/recipe.utility';

import { SettingsService } from './settings.service';

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

  constructor() {
    super({});
  }

  updateEntity(id: string, partial: Partial<MachineSettings>): void {
    this.reduce((state) => this._updateEntity(state, id, partial));
  }

  static computeMachinesState(
    state: MachinesState,
    settings: SettingsComplete,
    data: Dataset,
  ): MachinesState {
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
  }
}
