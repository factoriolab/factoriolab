import { computed, inject, Injectable } from '@angular/core';

import { EnergyType } from '~/data/schema/energy-type';
import { coalesce } from '~/utils/nullish';
import { spread } from '~/utils/object';

import { Hydration } from '../hydration';
import { Options } from '../options';
import { Dataset } from '../settings/dataset';
import { Settings } from '../settings/settings';
import { SettingsStore } from '../settings/settings-store';
import { RecordStore } from '../store';
import { MachineSettings } from './machine-settings';
import { MachineState } from './machine-state';

@Injectable({ providedIn: 'root' })
export class MachinesStore extends RecordStore<MachineState> {
  private readonly hydration = inject(Hydration);
  private readonly options = inject(Options);
  private readonly settingsStore = inject(SettingsStore);

  settings = computed(() =>
    this.computeMachinesSettings(
      this.state(),
      this.settingsStore.settings(),
      this.settingsStore.dataset(),
    ),
  );

  computeMachinesSettings(
    state: Record<string, MachineState>,
    settings: Settings,
    data: Dataset,
  ): Record<string, MachineSettings> {
    const value: Record<string, MachineSettings> = {};
    for (const id of data.machineIds) {
      const machine = data.machineRecord[id];
      const s: MachineSettings = spread(state[id]);

      if (machine.type === EnergyType.Burner) {
        s.fuelOptions = this.options.fuelOptions(machine, settings, data);
        s.defaultFuelId = this.options.bestMatch(
          s.fuelOptions,
          settings.fuelRankIds,
        );
        s.fuelId = coalesce(s?.fuelId, s.defaultFuelId);
      } else {
        // Machine doesn't support fuel, remove any
        delete s.fuelId;
      }

      if (machine.modules) {
        s.moduleOptions = this.options.moduleOptions(machine, settings, data);
        s.modules = this.hydration.hydrateModules(
          s.modules,
          s.moduleOptions,
          settings.moduleRankIds,
          machine.modules,
        );
        s.beacons = this.hydration.hydrateBeacons(s.beacons, settings.beacons);
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
