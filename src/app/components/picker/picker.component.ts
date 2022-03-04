import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Dataset, Entities } from '~/models';
import { TrackService } from '~/services';
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
  search: boolean;
  searchValue: string;
  categoryIds: string[];
  categoryItemRows: Entities<string[][]>;

  constructor(public track: TrackService) {
    super();
  }

  clickOpen(): void {
    this.open = true;
    this.search = false;
    this.searchValue = '';
    this.categoryIds = this.data.categoryIds;
    this.categoryItemRows = this.data.categoryItemRows;
  }

  setTab(): void {
    if (this.data) {
      this.tab =
        this.data.itemEntities[this.selected]?.category ||
        this.data.categoryIds[0];
    }
  }

  inputSearch(): void {
    // Filter for matching item ids
    let itemIds = this.data.itemIds;
    for (const term of this.searchValue.split(' ')) {
      const regExp = new RegExp(term, 'i');
      itemIds = itemIds.filter(
        (i) => this.data.itemEntities[i].name.search(regExp) !== -1
      );
    }

    // Filter for matching category ids
    this.categoryIds = this.data.categoryIds.filter((c) =>
      itemIds.some((i) => this.data.itemEntities[i].category === c)
    );

    // Pick new tab if old tab is no longer in filtered results
    if (this.categoryIds.indexOf(this.tab) === -1) {
      this.tab = this.categoryIds[0];
    }

    // Filter category item rows
    this.categoryItemRows = {};
    for (const c of this.categoryIds) {
      // Filter each category item row
      this.categoryItemRows[c] = [];
      for (const r of this.data.categoryItemRows[c]) {
        this.categoryItemRows[c].push(
          r.filter((i) => itemIds.indexOf(i) !== -1)
        );
      }
      // Filter out empty category item rows
      this.categoryItemRows[c] = this.categoryItemRows[c].filter(
        (r) => r.length > 0
      );
    }
  }
}
