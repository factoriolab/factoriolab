import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, map, tap } from 'rxjs';

import {
  ColumnKey,
  ColumnSettings,
  columnsInfo,
  ColumnsState,
  Entities,
} from '~/models';
import { ContentService } from '~/services';
import { LabState, Preferences, Settings } from '~/store';

@UntilDestroy()
@Component({
  selector: 'lab-columns-dialog',
  templateUrl: './columns-dialog.component.html',
  styleUrls: ['./columns-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnsDialogComponent implements OnInit {
  usesFractions$ = new BehaviorSubject(false);
  vm$ = combineLatest([
    this.store
      .select(Settings.getColumnsState)
      .pipe(tap((columns) => this.initEdit(columns))),
    this.store.select(Settings.getColumnOptions),
    this.usesFractions$,
  ]).pipe(
    map(([columns, columnOptions, usesFractions]) => ({
      columns,
      columnOptions,
      usesFractions,
    }))
  );

  visible = false;
  editValue: Entities<ColumnSettings> = {};
  columnsInf = columnsInfo;

  constructor(
    private ref: ChangeDetectorRef,
    private store: Store<LabState>,
    private contentSvc: ContentService
  ) {}

  ngOnInit(): void {
    this.contentSvc.showColumns$.pipe(untilDestroyed(this)).subscribe(() => {
      this.visible = true;
      this.ref.markForCheck();
    });
  }

  initEdit(columnsState: ColumnsState): void {
    this.editValue = (Object.keys(columnsState) as ColumnKey[]).reduce(
      (e: Entities<ColumnSettings>, c) => {
        e[c] = { ...columnsState[c] };
        return e;
      },
      {}
    );
    this.updateUsesFractions();
  }

  changeFraction(value: boolean, column: ColumnKey): void {
    this.editValue[column].precision = value ? null : 1;
    this.updateUsesFractions();
  }

  updateUsesFractions(): void {
    this.usesFractions$.next(
      (Object.keys(this.editValue) as ColumnKey[]).some(
        (c) => columnsInfo[c].hasPrecision && this.editValue[c] == null
      )
    );
  }

  save(): void {
    this.store.dispatch(
      new Preferences.SetColumnsAction(this.editValue as ColumnsState)
    );
  }
}
