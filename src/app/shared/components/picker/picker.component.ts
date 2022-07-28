import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { OverlayPanel } from 'primeng/overlaypanel';
import { combineLatest, map } from 'rxjs';

import { Breakpoint, Dataset, Entities } from '~/models';
import { ResponsiveService } from '~/services';
import { LabState } from '~/store';
import * as Recipes from '~/store/recipes';

@UntilDestroy()
@Component({
  selector: 'lab-picker',
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickerComponent {
  @Input() selectedId: string | undefined;

  @Output() selectId = new EventEmitter<string>();

  vm$ = combineLatest([
    this.store.select(Recipes.getAdjustedDataset),
    this.responsiveSvc.width$,
  ]).pipe(map(([data, width]) => ({ data, width })));

  searchCtrl = new FormControl('');

  categoryIds: string[] = [];
  categoryItemRows: Entities<string[][]> = {};
  activeIndex = 0;

  Breakpoint = Breakpoint;

  constructor(
    public responsiveSvc: ResponsiveService,
    private store: Store<LabState>
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.store.select(Recipes.getAdjustedDataset),
      this.searchCtrl.valueChanges,
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([data, search]) => {
        this.inputSearch(data, search);
      });
  }

  clickOpen(overlay: OverlayPanel, data: Dataset, event: any): void {
    this.searchCtrl.setValue('');
    this.categoryIds = data.categoryIds;
    this.categoryItemRows = data.categoryItemRows;
    if (this.selectedId) {
      const index = this.categoryIds.indexOf(
        data.itemEntities[this.selectedId].category
      );
      // Must set active index after timeout
      // https://github.com/primefaces/primeng/issues/10587
      setTimeout(() => {
        this.activeIndex = index;
      }, 1);
    }
    overlay.show(event);
  }

  clickItem(overlay: OverlayPanel, itemId: string) {
    this.selectId.emit(itemId);
    overlay.hide();
  }

  inputSearch(data: Dataset, search: string | null): void {
    if (!search) {
      this.categoryIds = data.categoryIds;
      this.categoryItemRows = data.categoryItemRows;
      return;
    }

    // Filter for matching item ids
    let itemIds = data.itemIds;
    for (const term of search.split(' ')) {
      const regExp = new RegExp(term, 'i');
      itemIds = itemIds.filter(
        (i) => data.itemEntities[i].name.search(regExp) !== -1
      );
    }

    // Filter for matching category ids
    this.categoryIds = data.categoryIds.filter((c) =>
      itemIds.some((i) => data.itemEntities[i].category === c)
    );

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
