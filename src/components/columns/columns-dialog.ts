import { DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  linkedSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  faCheck,
  faRotateLeft,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import {
  ColumnKey,
  columnsInfo,
  copyColumnsState,
  initialColumnsState,
} from '~/state/preferences/columns-state';
import { powerUnitOptions } from '~/state/preferences/power-unit';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Button } from '../button/button';
import { Checkbox } from '../checkbox/checkbox';
import { FormField } from '../form-field/form-field';
import { Select } from '../select/select';
import { PrecisionExamplePipe } from './precision-example-pipe';

@Component({
  selector: 'lab-columns-dialog',
  imports: [
    FormsModule,
    Button,
    Checkbox,
    FormField,
    PrecisionExamplePipe,
    Select,
    TranslatePipe,
  ],
  templateUrl: './columns-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex flex-col p-3 sm:p-6 pt-0 gap-3 sm:gap-6 sm:pt-0 overflow-hidden',
  },
})
export class ColumnsDialog {
  protected readonly ref = inject(ChangeDetectorRef);
  protected readonly dialogRef = inject(DialogRef);
  protected readonly preferencesStore = inject(PreferencesStore);
  protected readonly settingsStore = inject(SettingsStore);

  protected readonly columnsInfo = columnsInfo;
  protected readonly faCheck = faCheck;
  protected readonly faRotateLeft = faRotateLeft;
  protected readonly faXmark = faXmark;
  protected readonly powerUnitOptions = powerUnitOptions;

  protected value = copyColumnsState(this.settingsStore.columnsState());
  protected powerUnit = linkedSignal(
    () => this.preferencesStore.state().powerUnit,
  );

  get modified(): boolean {
    return (Object.keys(this.value) as ColumnKey[]).some(
      (k) =>
        this.value[k].precision !== initialColumnsState[k].precision ||
        this.value[k].show !== initialColumnsState[k].show,
    );
  }

  reset(): void {
    this.value = copyColumnsState(initialColumnsState);
    this.powerUnit.set(this.preferencesStore.state().powerUnit);
  }

  save(): void {
    this.preferencesStore.apply({
      columns: this.value,
      powerUnit: this.powerUnit(),
    });
    this.dialogRef.close();
  }
}
