import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Column, ColumnsAsOptions, Entities } from '~/models';
import { DialogContainerComponent } from '../dialog/dialog-container.component';

@Component({
  selector: 'lab-columns',
  templateUrl: './columns.component.html',
  styleUrls: ['./columns.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnsComponent extends DialogContainerComponent {
  @Input() selected: string[];
  @Input() precision: Entities<number>;

  @Output() selectIds = new EventEmitter<string[]>();
  @Output() setPrecision = new EventEmitter<Entities<number>>();

  options = ColumnsAsOptions;
  editedValue = false;
  editValue: string[];
  editedPrecision = false;
  editPrecision: Entities<number>;

  Column = Column;

  constructor() {
    super();
  }

  clickOpen(): void {
    this.open = true;
    this.editedValue = false;
    this.editValue = [...this.selected];
    this.editedPrecision = false;
    this.editPrecision = { ...this.precision };
  }

  close(): void {
    if (this.editedValue) {
      this.selectIds.emit(this.editValue);
    }
    if (this.editedPrecision) {
      this.setPrecision.emit(this.editPrecision);
    }
    this.open = false;
  }

  clickId(id: string, event: MouseEvent): void {
    this.editedValue = true;
    if (this.editValue.indexOf(id) === -1) {
      this.editValue.push(id);
    } else {
      this.editValue = this.editValue.filter((i) => i !== id);
    }
    event.stopPropagation();
  }

  changePrecision(id: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = Number(target?.value);
    if (!isNaN(value)) {
      this.editedPrecision = true;
      this.editPrecision[id] = value;
    }
  }

  clickFraction(id: string) {
    this.editedPrecision = true;
    if (this.editPrecision[id] == null) {
      this.editPrecision[id] = 1;
    } else {
      this.editPrecision[id] = null;
    }
  }
}
