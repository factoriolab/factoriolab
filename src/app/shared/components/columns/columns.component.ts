import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import { Column, PrecisionColumns, Rational } from '~/models';
import { TrackService } from '~/services';
import { LabState } from '~/store';
import * as Preferences from '~/store/preferences';
import * as Settings from '~/store/settings';
import { DialogContainerComponent } from '../dialog/dialog-container.component';

@Component({
  selector: 'lab-columns',
  templateUrl: './columns.component.html',
  styleUrls: ['./columns.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnsComponent extends DialogContainerComponent {
  vm$ = combineLatest([
    this.store.select(Settings.getColumnsState),
    this.store.select(Settings.getColumnOptions),
  ]).pipe(map(([columns, columnOptions]) => ({ columns, columnOptions })));

  edited = false;
  editValue: Preferences.ColumnsState = {};

  PrecisionColumns = PrecisionColumns;

  Column = Column;

  constructor(public trackSvc: TrackService, private store: Store<LabState>) {
    super();
  }

  clickOpen(columns: Preferences.ColumnsState): void {
    this.open = true;
    this.edited = false;
    this.editValue = Object.keys(columns).reduce(
      (e: Preferences.ColumnsState, c) => {
        e[c] = { ...columns[c] };
        return e;
      },
      {}
    );
  }

  close(): void {
    if (this.edited) {
      this.store.dispatch(new Preferences.SetColumnsAction(this.editValue));
    }
    this.open = false;
  }

  clickId(id: string): void {
    this.edited = true;
    this.editValue[id].show = !this.editValue[id].show;
  }

  changePrecision(id: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);
    this.edited = true;
    this.editValue[id].precision = value;
  }

  clickFraction(id: string): void {
    this.edited = true;
    if (this.editValue[id].precision == null) {
      this.editValue[id].precision = 1;
    } else {
      this.editValue[id].precision = null;
    }
  }

  example(id: string): string {
    const r = Rational.from(1, 3);
    const p = this.editValue[id].precision;
    return p != null ? r.toPrecision(p).toString() : r.toFraction();
  }
}
