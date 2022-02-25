import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnChanges,
} from '@angular/core';

import {
  Column,
  columnOptions,
  Game,
  IdName,
  PrecisionColumns,
  Rational,
} from '~/models';
import { ColumnsState } from '~/store/preferences';
import { DialogContainerComponent } from '../dialog/dialog-container.component';

@Component({
  selector: 'lab-columns',
  templateUrl: './columns.component.html',
  styleUrls: ['./columns.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnsComponent
  extends DialogContainerComponent
  implements OnChanges
{
  @Input() game = Game.Factorio;
  @Input() columns: ColumnsState = {};

  @Output() setColumns = new EventEmitter<ColumnsState>();

  PrecisionColumns = PrecisionColumns;
  edited = false;
  editValue: ColumnsState = {};
  options: IdName<Column>[] = [];

  Column = Column;

  constructor() {
    super();
  }

  ngOnChanges(): void {
    this.options = columnOptions(this.game);
  }

  clickOpen(): void {
    this.open = true;
    this.edited = false;
    this.editValue = Object.keys(this.columns).reduce((e: ColumnsState, c) => {
      e[c] = { ...this.columns[c] };
      return e;
    }, {});
  }

  close(): void {
    if (this.edited) {
      this.setColumns.emit(this.editValue);
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

  trackBy(i: number, col: IdName<Column>): Column {
    return col.id;
  }
}
