import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  linkedSignal,
  model,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';

import { rational } from '~/rational/rational';
import { BeaconSettings } from '~/state/beacon-settings';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';
import { spread } from '~/utils/object';

import { Button } from '../button/button';
import { Control } from '../control';
import { Dropdown } from '../dropdown/dropdown';
import { Icon } from '../icon/icon';
import { InputNumber } from '../input-number/input-number';
import { Modules } from '../modules/modules';
import { Rounded } from '../rounding';
import { Select } from '../select/select';
import { Tooltip } from '../tooltip/tooltip';

let nextUniqueId = 0;

@Component({
  selector: 'lab-beacons-select',
  imports: [
    FormsModule,
    Button,
    Dropdown,
    Icon,
    InputNumber,
    Modules,
    Select,
    Tooltip,
    TranslatePipe,
  ],
  templateUrl: './beacons-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: BeaconsSelect,
    },
    { provide: Control, useExisting: BeaconsSelect },
  ],
  host: { class: 'flex' },
})
export class BeaconsSelect extends Control<BeaconSettings[]> {
  protected readonly settingsStore = inject(SettingsStore);

  private readonly uniqueId = (nextUniqueId++).toString();

  readonly controlId = input(`lab-beacons-select-${this.uniqueId}`);
  readonly value = model<BeaconSettings[]>();
  readonly disabled = model(false);
  readonly labelledBy = input<string>();
  readonly border = input(true);
  readonly rounded = input<Rounded>('all');

  protected readonly editValue = linkedSignal(() => coalesce(this.value(), []));

  protected readonly faPlus = faPlus;
  protected readonly faXmark = faXmark;

  open(): void {
    this.editValue.set(coalesce(this.value(), []));
  }

  save(): void {
    this.setValue(this.editValue());
  }

  setField<F extends keyof BeaconSettings>(
    i: number,
    field: F,
    value: BeaconSettings[F],
  ): void {
    this.editValue.update((values) =>
      values.map((v, j) => (j === i ? spread(v, { [field]: value }) : v)),
    );
  }

  removeEntry(i: number): void {
    this.editValue.update((v) => v.filter((_, j) => i !== j));
  }

  addEntry(): void {
    this.editValue.update((v) => {
      v ??= [];
      const id = this.settingsStore.options().beacons[0].value;
      const count = this.settingsStore.dataset().beaconRecord[id].modules;
      const total = this.settingsStore.settings().beaconReceivers;
      return [
        ...v,
        {
          id,
          count: rational.zero,
          total,
          modules: [{ id: '', count }],
        },
      ];
    });
  }
}
