import { CdkOverlayOrigin, OverlayModule } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  linkedSignal,
  model,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { faSimCard } from '@fortawesome/free-solid-svg-icons';

import { Machine } from '~/data/schema/machine';
import { ModuleSettings } from '~/state/module-settings';

import { Control, LAB_CONTROL } from '../control';
import { Dropdown } from '../dropdown/dropdown';
import { Icon } from '../icon/icon';
import { Modules } from '../modules/modules';
import { Rounded } from '../rounding';
import { Tooltip } from '../tooltip/tooltip';

let nextUniqueId = 0;

@Component({
  selector: 'lab-modules-select',
  imports: [OverlayModule, Dropdown, Icon, Modules, Tooltip],
  templateUrl: './modules-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex' },
  hostDirectives: [CdkOverlayOrigin],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: ModulesSelect,
    },
    { provide: LAB_CONTROL, useExisting: ModulesSelect },
  ],
})
export class ModulesSelect extends Control<ModuleSettings[]> {
  private uniqueId = (nextUniqueId++).toString();

  readonly controlId = input(`lab-modules-select-${this.uniqueId}`);
  readonly value = model<ModuleSettings[]>();
  readonly disabled = model(false);
  readonly labelledBy = input<string>();
  readonly border = input(true);
  readonly rounded = input<Rounded>('all');
  readonly machine = input.required<Machine>();
  readonly recipeId = input<string>();

  readonly editValue = linkedSignal(() => this.value() ?? []);

  protected readonly faSimCard = faSimCard;

  open(): void {
    this.editValue.set(this.value() ?? []);
  }

  save(): void {
    let value = this.editValue();
    if (this.machine().modules !== true)
      value = value.filter((e) => e.count?.nonzero());
    this.setValue(value);
  }
}
