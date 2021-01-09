import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Dataset } from '~/models';
import { DialogContainerComponent } from '../dialog/dialog-container.component';

@Component({
  selector: 'lab-picker',
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickerComponent extends DialogContainerComponent {
  _data: Dataset;
  get data(): Dataset {
    return this._data;
  }
  @Input() set data(value: Dataset) {
    this._data = value;
    this.setTab();
  }
  _selected: string;
  get selected(): string {
    return this._selected;
  }
  @Input() set selected(value: string) {
    this._selected = value;
    this.setTab();
  }

  @Output() selectId = new EventEmitter<string>();

  tab: string;

  constructor() {
    super();
  }

  setTab(): void {
    if (this.data) {
      if (this.selected) {
        this.tab = this.data.itemEntities[this.selected].category;
      } else {
        this.tab = this.data.categoryIds[0];
      }
    }
  }
}
