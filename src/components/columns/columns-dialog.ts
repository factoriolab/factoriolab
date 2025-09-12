import { DialogRef } from '@angular/cdk/dialog';
import { CdkTableModule } from '@angular/cdk/table';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  faCheck,
  faRotateLeft,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Option } from '~/models/option';
import {
  ColumnKey,
  columnsInfo,
  copyColumnsState,
  initialColumnsState,
} from '~/state/preferences/columns-state';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Button } from '../button/button';
import { TypeSafeCdkCellDef } from '../type-safe-cdk-cell-def/type-safe-cell-def';
import { PrecisionExamplePipe } from './precision-example-pipe';

@Component({
  selector: 'lab-columns-dialog',
  imports: [
    FormsModule,
    CdkTableModule,
    Button,
    PrecisionExamplePipe,
    TranslatePipe,
    TypeSafeCdkCellDef,
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
  protected readonly OptionColumn!: Option<ColumnKey>;

  value = copyColumnsState(this.settingsStore.columnsState());

  get modified(): boolean {
    return (Object.keys(this.value) as ColumnKey[]).some(
      (k) =>
        this.value[k].precision !== initialColumnsState[k].precision ||
        this.value[k].show !== initialColumnsState[k].show,
    );
  }

  reset(): void {
    this.value = copyColumnsState(initialColumnsState);
  }

  save(): void {
    this.preferencesStore.apply({ columns: this.value });
    this.dialogRef.close();
  }
}
