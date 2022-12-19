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
import { map } from 'rxjs';

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
  @Output() selectIds = new EventEmitter<string[]>();

  vm$ = this.store
    .select(Recipes.getAdjustedDataset)
    .pipe(map((data) => ({ data })));

  searchCtrl = new FormControl('');
  selectAllCtrl = new FormControl(false);

  visible = false;
  type: 'item' | 'recipe' = 'item';
  isMultiselect = false;
  selection: string | string[] | undefined;
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
      .subscribe((s) => this.inputSearch(s));
  }

  clickOpen(
    data: Dataset,
    type: 'item' | 'recipe',
    selection?: string | string[]
  ): void {
    this.type = type;
    if (Array.isArray(selection)) {
      this.isMultiselect = true;
      this.selection = [...selection];
    } else {
      this.isMultiselect = false;
      this.selection = selection;
    }
    this.searchCtrl.setValue('');
    // Wait for input field to appear before attempting to focus
    setTimeout(() => {
      this.inputFilter?.nativeElement.focus();
    });
    this.categoryEntities = data.categoryEntities;
    if (type === 'item') {
      this.categoryRows = data.categoryItemRows;
      if (selection && !Array.isArray(selection)) {
        const index = data.categoryIds.indexOf(
          data.itemEntities[selection].category
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
      if (Array.isArray(selection)) {
        this.allSelectItems = data.complexRecipeIds.map(
          (i): SelectItem => ({
            label: data.recipeEntities[i].name,
            value: i,
            title: data.recipeEntities[i].category,
          })
        );

        // Find categories that have complex recipes
        const categoryIds = data.categoryIds.filter((c) =>
          this.allSelectItems.some((i) => i.title === c)
        );

        // Filter category rows
        this.categoryRows = {};
        const ids = this.allSelectItems.map((i) => i.value);
        for (const c of categoryIds) {
          // Filter each category row
          this.categoryRows[c] = [];
          for (const r of data.categoryRecipeRows[c]) {
            this.categoryRows[c].push(r.filter((i) => ids.indexOf(i) !== -1));
          }
          // Filter out empty category rows
          this.categoryRows[c] = this.categoryRows[c].filter(
            (r) => r.length > 0
          );
        }

        this.selectAllCtrl.setValue(selection.length === 0);
      } else {
        this.categoryRows = data.categoryRecipeRows;
        if (selection) {
          const index = data.categoryIds.indexOf(
            data.recipeEntities[selection].category
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
    }
    this.categoryIds = data.categoryIds.filter((c) => this.categoryRows[c]);
    this.allCategoryIds = this.categoryIds;
    this.allCategoryRows = this.categoryRows;
    this.visible = true;
    this.ref.markForCheck();
  }

  selectAll(value: boolean): void {
    if (value) {
      this.selection = [];
    } else {
      this.selection = this.allSelectItems.map((i) => i.value);
    }
  }

  clickId(id: string): void {
    if (Array.isArray(this.selection)) {
      const index = this.selection.indexOf(id);
      if (index === -1) {
        this.selection.push(id);
      } else {
        this.selection.splice(index, 1);
      }
      this.selectAllCtrl.setValue(this.selection.length === 0);
    } else {
      this.selectId.emit(id);
      this.visible = false;
    }
  }

  onHide(): void {
    if (Array.isArray(this.selection)) {
      this.selectIds.emit(this.selection);
    }
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

    // Filter category rows
    this.categoryRows = {};
    const ids = filteredItems.map((i) => i.value);
    for (const c of this.categoryIds) {
      // Filter each category row
      this.categoryRows[c] = [];
      for (const r of this.allCategoryRows[c]) {
        this.categoryRows[c].push(r.filter((i) => ids.indexOf(i) !== -1));
      }
      // Filter out empty category rows
      this.categoryRows[c] = this.categoryRows[c].filter((r) => r.length > 0);
    }
  }
}
