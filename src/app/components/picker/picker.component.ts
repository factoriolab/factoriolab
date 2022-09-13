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
import { combineLatest, map } from 'rxjs';

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

  vm$ = this.store
    .select(Recipes.getAdjustedDataset)
    .pipe(map((data) => ({ data })));

  searchCtrl = new FormControl('');

  visible = false;
  type: 'item' | 'recipe' = 'item';
  selectedId: string | undefined;
  categoryEntities: Entities<Category> = {};
  categoryIds: string[] = [];
  categoryRows: Entities<string[][]> = {};
  // Preserve state prior to any filtering
  allSelectItems: SelectItem[] = [];
  allCategoryIds: string[] = [];
  allCategoryRows: Entities<string[][]> = {};
  activeIndex = 0;

  constructor(
    private ref: ChangeDetectorRef,
    private filterService: FilterService,
    private store: Store<LabState>
  ) {}

  ngOnInit(): void {
    this.searchCtrl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(this.inputSearch);
  }

  clickOpen(data: Dataset, type: 'item' | 'recipe', selectedId?: string): void {
    this.type = type;
    this.selectedId = selectedId;
    this.searchCtrl.setValue('');
    // Wait for input field to appear before attempting to focus
    setTimeout(() => {
      this.inputFilter?.nativeElement.focus();
    });
    this.categoryEntities = data.categoryEntities;
    if (type === 'item') {
      this.categoryRows = data.categoryItemRows;
      if (this.selectedId) {
        const index = data.categoryIds.indexOf(
          data.itemEntities[this.selectedId].category
        );
        this.activeIndex = index;
      }
      this.allSelectItems = data.itemIds.map(
        (i): SelectItem => ({
          label: data.itemEntities[i].name,
          value: i,
          title: data.itemEntities[i].category,
        })
      );
    } else {
      this.categoryRows = data.categoryRecipeRows;
      if (this.selectedId) {
        const index = data.categoryIds.indexOf(
          data.recipeEntities[this.selectedId].category
        );
        this.activeIndex = index;
      }
      this.allSelectItems = data.recipeIds.map(
        (i): SelectItem => ({
          label: data.recipeEntities[i].name,
          value: i,
          title: data.recipeEntities[i].category,
        })
      );
    }
    this.categoryIds = data.categoryIds.filter((c) => this.categoryRows[c]);
    this.allCategoryIds = this.categoryIds;
    this.allCategoryRows = this.categoryRows;
    this.visible = true;
    this.ref.markForCheck();
  }

  clickId(id: string): void {
    this.selectId.emit(id);
    this.visible = false;
  }

  inputSearch(search: string | null): void {
    if (!search) {
      this.categoryIds = this.allCategoryIds;
      this.categoryRows = this.allCategoryRows;
      return;
    }

    // Filter for matching item ids
    const filteredItems: SelectItem[] = this.filterService.filter(
      this.allSelectItems,
      ['label'],
      search,
      'contains'
    );

    // Filter for matching category ids
    // (Cache category on the SelectItem `title` field)
    this.categoryIds = this.allCategoryIds.filter((c) =>
      filteredItems.some((i) => i.title === c)
    );

    // Filter category item rows
    this.categoryRows = {};
    const ids = filteredItems.map((i) => i.value);
    for (const c of this.categoryIds) {
      // Filter each category item row
      this.categoryRows[c] = [];
      for (const r of this.allCategoryRows[c]) {
        this.categoryRows[c].push(r.filter((i) => ids.indexOf(i) !== -1));
      }
      // Filter out empty category rows
      this.categoryRows[c] = this.categoryRows[c].filter((r) => r.length > 0);
    }
  }
}
