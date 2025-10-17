import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  linkedSignal,
  model,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Control, LAB_CONTROL } from '~/components/control';
import { Dropdown } from '~/components/dropdown/dropdown';
import { Icon } from '~/components/icon/icon';
import { InputNumber } from '~/components/input-number/input-number';
import { Select } from '~/components/select/select';
import { Tooltip } from '~/components/tooltip/tooltip';
import { Rational, rational } from '~/rational/rational';
import { ItemSettings } from '~/state/items/item-settings';
import { SettingsStore } from '~/state/settings/settings-store';
import { spread } from '~/utils/object';

let nextUniqueId = 0;

@Component({
  selector: 'lab-belt-select',
  imports: [FormsModule, Dropdown, Icon, InputNumber, Select, Tooltip],
  templateUrl: './belt-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: BeltSelect,
    },
    { provide: LAB_CONTROL, useExisting: BeltSelect },
  ],
})
export class BeltSelect extends Control<ItemSettings> {
  protected readonly settingsStore = inject(SettingsStore);

  private uniqueId = (nextUniqueId++).toString();

  readonly controlId = input(`lab-belt-select-${this.uniqueId}`);
  readonly value = model<ItemSettings>();
  readonly disabled = model(false);
  readonly labelledBy = input<string>();
  readonly stack = input.required<Rational>();

  readonly editValue = linkedSignal(() => this.value());
  protected readonly rational = rational;

  open(): void {
    const value = this.value();
    if (value == null) return;
    this.editValue.set(value);
  }

  save(): void {
    const value = this.editValue();
    if (value == null) return;
    this.setValue(value);
  }

  setStack(stack: Rational): void {
    this.editValue.update((v) => spread(v, { stack }));
  }

  setBelt(beltId: string): void {
    this.editValue.update((v) => spread(v, { beltId }));
  }
}
