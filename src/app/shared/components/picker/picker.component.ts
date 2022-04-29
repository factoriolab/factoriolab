import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { first, map } from 'rxjs';

import { Dataset, Entities } from '~/models';
import { LabState } from '~/store';
import * as Recipes from '~/store/recipes';
import { DialogContainerComponent } from '../dialog/dialog-container.component';

@Component({
  selector: 'lab-picker',
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickerComponent
  extends DialogContainerComponent
  implements OnChanges
{
  @Input() selected: string | undefined;

  @Output() selectId = new EventEmitter<string>();

  vm$ = this.store
    .select(Recipes.getAdjustedDataset)
    .pipe(map((data) => ({ data })));

  categoryIds: string[] = [];
  categoryItemRows: Entities<string[][]> = {};
  search = false;
  searchValue = '';
  tab = '';

  constructor(private store: Store<LabState>) {
    super();
  }

  ngOnChanges(): void {
    this.store
      .select(Recipes.getAdjustedDataset)
      .pipe(first())
      .subscribe((data) => {
        if (this.selected != null) {
          this.tab = data.itemEntities[this.selected].category;
        } else {
          this.tab = data.categoryIds[0];
        }
      });
  }

  clickOpen(data: Dataset): void {
    this.open = true;
    this.search = false;
    this.searchValue = '';
    this.categoryIds = data.categoryIds;
    this.categoryItemRows = data.categoryItemRows;
  }

  inputSearch(data: Dataset): void {
    // Filter for matching item ids
    let itemIds = data.itemIds;
    for (const term of this.searchValue.split(' ')) {
      const regExp = new RegExp(term, 'i');
      itemIds = itemIds.filter(
        (i) => data.itemEntities[i].name.search(regExp) !== -1
      );
    }

    // Filter for matching category ids
    this.categoryIds = data.categoryIds.filter((c) =>
      itemIds.some((i) => data.itemEntities[i].category === c)
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
      for (const r of data.categoryItemRows[c]) {
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
