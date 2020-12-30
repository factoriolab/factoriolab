import {
  Component,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Dataset } from '~/models';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'lab-picker',
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickerComponent extends DialogComponent {
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

  @Output() selectItem = new EventEmitter<string>();

  tab: string;

  constructor(element: ElementRef) {
    super(element);
  }

  setTab() {
    if (this.data) {
      if (this.itemId) {
        this.tab = this.data.itemEntities[this.itemId].category;
      } else {
        this.tab = this.data.categoryIds[0];
      }
    }
  }

  clickItem(id: string) {
    this.selectItem.emit(id);
    this.open = false;
  }
}
