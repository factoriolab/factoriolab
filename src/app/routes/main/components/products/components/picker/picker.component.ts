import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { FilterService, SelectItem } from 'primeng/api';
import { combineLatest } from 'rxjs';

import { Category, Dataset, Entities } from '~/models';
import { LabState } from '~/store';
import * as Recipes from '~/store/recipes';

@UntilDestroy()
@Component({
  selector: 'lab-picker',
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickerComponent implements OnInit {
  @ViewChild('inputFilter') inputFilter:
    | ElementRef<HTMLInputElement>
    | undefined;

  @Output() selectId = new EventEmitter<string>();

  searchCtrl = new FormControl('');

  visible = false;
  selectedId: string | undefined;
  categoryEntities: Entities<Category> = {};
  categoryIds: string[] = [];
  categoryItemRows: Entities<string[][]> = {};
  activeIndex = 0;

  constructor(
    private ref: ChangeDetectorRef,
    private filterService: FilterService,
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

  clickOpen(data: Dataset, selectedId?: string): void {
    this.selectedId = selectedId;
    this.searchCtrl.setValue('');
    setTimeout(() => {
      this.inputFilter?.nativeElement.focus();
    });
    this.categoryEntities = data.categoryEntities;
    this.categoryIds = data.categoryIds;
    this.categoryItemRows = data.categoryItemRows;
    if (this.selectedId) {
      const index = data.categoryIds.indexOf(
        data.itemEntities[this.selectedId].category
      );
      this.activeIndex = index;
    }
    this.visible = true;
    this.ref.markForCheck();
  }

  clickItem(itemId: string): void {
    this.selectId.emit(itemId);
    this.visible = false;
  }

  inputSearch(data: Dataset, search: string | null): void {
    if (!search) {
      this.categoryIds = data.categoryIds;
      this.categoryItemRows = data.categoryItemRows;
      return;
    }

    // Filter for matching item ids
    const selectItems = data.itemIds.map(
      (i): SelectItem => ({ label: data.itemEntities[i].name, value: i })
    );
    const filteredItems = this.filterService.filter(
      selectItems,
      ['label'],
      search,
      'contains'
    );
    const itemIds = filteredItems.map((i) => i.value);

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
