import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { tap, withLatestFrom } from 'rxjs';

import {
  ColumnKey,
  ColumnSettings,
  columnsInfo,
  ColumnsState,
  Entities,
  initialColumnsState,
} from '~/models';
import { PrecisionExamplePipe, TranslatePipe } from '~/pipes';
import { ContentService } from '~/services';
import { Preferences, Settings } from '~/store';
import { DialogComponent } from '../modal';

@Component({
  selector: 'lab-columns',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    CheckboxModule,
    DialogModule,
    InputNumberModule,
    TableModule,
    PrecisionExamplePipe,
    TranslatePipe,
  ],
  templateUrl: './columns.component.html',
  styleUrls: ['./columns.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnsComponent extends DialogComponent implements OnInit {
  store = inject(Store);
  contentSvc = inject(ContentService);
  destroyRef = inject(DestroyRef);

  columnOptions = this.store.selectSignal(Settings.selectColumnOptions);

  editValue: Entities<ColumnSettings> = initialColumnsState;
  columnsInf = columnsInfo;

  get modified(): boolean {
    return (Object.keys(this.editValue) as ColumnKey[]).some(
      (k) =>
        this.editValue[k].precision !==
          Preferences.initialState.columns[k].precision ||
        this.editValue[k].show !== Preferences.initialState.columns[k].show,
    );
  }

  ngOnInit(): void {
    this.contentSvc.showColumns$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        withLatestFrom(this.store.select(Settings.selectColumnsState)),
        tap(([_, c]) => {
          this.initEdit(c);
          this.show();
        }),
      )
      .subscribe();
  }

  initEdit(columns: ColumnsState): void {
    this.editValue = (Object.keys(columns) as ColumnKey[])
      .filter((c) => columnsInfo[c] != null) // Filter out any obsolete keys
      .reduce((e: Entities<ColumnSettings>, c) => {
        e[c] = { ...columns[c] };
        return e;
      }, {});
  }

  changeFraction(value: boolean, column: ColumnKey): void {
    this.editValue[column].precision = value ? null : 1;
  }

  reset(): void {
    this.initEdit(Preferences.initialState.columns);
  }

  save(): void {
    const columns = this.editValue as ColumnsState;
    this.store.dispatch(Preferences.setColumns({ columns }));
  }
}
