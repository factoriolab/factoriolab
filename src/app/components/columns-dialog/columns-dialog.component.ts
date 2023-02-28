import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, map, tap } from 'rxjs';

import { Column, precisionColumns } from '~/models';
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
  editValue: Preferences.ColumnsState = {};
  precisionColumns = precisionColumns;

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

  initEdit(columns: Preferences.ColumnsState): void {
    this.editValue = Object.keys(columns).reduce(
      (e: Preferences.ColumnsState, c) => {
        e[c] = { ...columns[c] };
        return e;
      },
      {}
    );
    this.updateUsesFractions();
  }

  changeFraction(value: boolean, column: Column): void {
    this.editValue[column].precision = value ? null : 1;
    this.updateUsesFractions();
  }

  updateUsesFractions(): void {
    this.usesFractions$.next(
      precisionColumns.some((c) => this.editValue[c].precision == null)
    );
  }

  save(): void {
    this.store.dispatch(new Preferences.SetColumnsAction(this.editValue));
  }
}
