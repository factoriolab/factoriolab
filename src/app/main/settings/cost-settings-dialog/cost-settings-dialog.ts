import { DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  faCheck,
  faRotateLeft,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { DialogData } from '~/components/dialog/dialog';
import { FormField } from '~/components/form-field/form-field';
import { InputNumber } from '~/components/input-number/input-number';
import { Tooltip } from '~/components/tooltip/tooltip';
import { Rational, rational } from '~/rational/rational';
import { CostKey } from '~/state/settings/cost-settings';
import { initialSettingsState } from '~/state/settings/settings-state';
import { SettingsStore } from '~/state/settings/settings-store';

@Component({
  selector: 'lab-cost-settings-dialog',
  imports: [FormsModule, Button, FormField, InputNumber, Tooltip],
  templateUrl: './cost-settings-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex flex-col p-3 sm:p-6 pt-0 gap-3 sm:gap-6 sm:pt-0 overflow-hidden max-w-full w-md',
  },
})
export class CostSettingsDialog implements DialogData {
  protected readonly dialogRef = inject(DialogRef);
  private readonly settingsStore = inject(SettingsStore);

  protected readonly editValue = linkedSignal(
    () => this.settingsStore.settings().costs,
  );
  protected readonly modified = computed(() => {
    const edit = this.editValue();
    const init = initialSettingsState.costs;
    const keys = Object.keys(init) as CostKey[];
    return keys.some((k) => init[k] !== edit[k]);
  });

  protected readonly faCheck = faCheck;
  protected readonly faRotateLeft = faRotateLeft;
  protected readonly faXmark = faXmark;
  readonly header = 'costs.header';
  protected readonly rational = rational;

  apply(key: CostKey, value: Rational): void {
    this.editValue.update((e) => ({ ...e, ...{ [key]: value } }));
  }

  reset(): void {
    this.editValue.set(initialSettingsState.costs);
  }

  save(): void {
    const costs = this.editValue();
    this.settingsStore.apply({ costs });
    this.dialogRef.close();
  }
}
