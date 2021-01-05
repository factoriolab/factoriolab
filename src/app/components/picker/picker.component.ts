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
  get data() {
    return this._data;
  }
  @Input() set data(value: Dataset) {
    this._data = value;
    this.setTab();
  }
  _itemId: string;
  get itemId() {
    return this._itemId;
  }
  @Input() set itemId(value: string) {
    this._itemId = value;
    this.setTab();
  }

  @Output() selectId = new EventEmitter<string>();

  tab: string;

  constructor() {
    super();
  }

  setTab(): void {
    if (this.data) {
      if (this.itemId) {
        this.tab = this.data.itemEntities[this.itemId].category;
      } else {
        this.tab = this.data.categoryIds[0];
      }
    }
  }
}
