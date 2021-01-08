import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Column, ColumnsAsOptions, PrecisionColumns } from '~/models';
import { ColumnsState } from '~/store/preferences';
import { DialogContainerComponent } from '../dialog/dialog-container.component';

@Component({
  selector: 'lab-columns',
  templateUrl: './columns.component.html',
  styleUrls: ['./columns.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnsComponent extends DialogContainerComponent {
  @Input() columns: ColumnsState;

  @Output() setColumns = new EventEmitter<ColumnsState>();

  ColumnsAsOptions = ColumnsAsOptions;
  PrecisionColumns = PrecisionColumns;
  edited = false;
  editValue: ColumnsState;

  Column = Column;

  constructor() {
    super();
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

  changePrecision(id: string, event: InputEvent): void {
    const target = event.target as HTMLInputElement;
    const value = Number(target?.value);
    if (!isNaN(value)) {
      this.edited = true;
      this.editValue[id].precision = value;
    }
  }

  clickFraction(id: string) {
    this.edited = true;
    if (this.editValue[id].precision == null) {
      this.editValue[id].precision = 1;
    } else {
      this.editValue[id].precision = null;
    }
  }
}
