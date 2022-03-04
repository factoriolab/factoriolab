import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';

import { Column, columnOptions, PrecisionColumns, Rational } from '~/models';
import { TrackService } from '~/services';
import { State } from '~/store';
import {
  ColumnsState,
  getColumnsState,
  SetColumnsAction,
} from '~/store/preferences';
import { getGame } from '~/store/settings';
import { DialogContainerComponent } from '../dialog/dialog-container.component';

@Component({
  selector: 'lab-columns',
  templateUrl: './columns.component.html',
  styleUrls: ['./columns.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnsComponent extends DialogContainerComponent {
  columns$ = this.store.select(getColumnsState);
  options$ = this.store.select(getGame).pipe(map((g) => columnOptions(g)));

  PrecisionColumns = PrecisionColumns;
  edited = false;
  editValue: ColumnsState = {};

  Column = Column;

  constructor(private store: Store<State>, public track: TrackService) {
    super();
  }

  clickOpen(columns: ColumnsState): void {
    this.open = true;
    this.edited = false;
    this.editValue = Object.keys(columns).reduce((e: ColumnsState, c) => {
      e[c] = { ...columns[c] };
      return e;
    }, {});
  }

  close(): void {
    if (this.edited) {
      this.store.dispatch(new SetColumnsAction(this.editValue));
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
