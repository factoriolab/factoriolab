import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
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

  @Input() header = '';
  @Input() researchedTechnologyIds: string[] | null | undefined;
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
  default: string | string[] | undefined;
  categoryEntities: Entities<Category> = {};
  categoryIds: string[] = [];
  categoryRows: Entities<string[][]> = {};
  // Preserve state prior to any filtering
  allSelectItems: SelectItem[] = [];
  allCategoryIds: string[] = [];
  allCategoryRows: Entities<string[][]> = {};
  activeIndex = 0;
  locked: Entities<boolean> = {};

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
      this.allSelectItems = data.itemIds.map(
        (i): SelectItem => ({
          label: data.itemEntities[i].name,
          value: i,
          title: data.itemEntities[i].category,
        })
      );

      if (Array.isArray(selection)) {
        this.selectAllCtrl.setValue(selection.length === 0);
      } else if (selection != null) {
        const index = data.categoryIds.indexOf(
          data.itemEntities[selection].category
        );
        this.activeIndex = index;
      }
    } else {
      this.categoryRows = data.categoryRecipeRows;
      this.allSelectItems = data.recipeIds.map(
        (i): SelectItem => ({
          label: data.recipeEntities[i].name,
          value: i,
          title: data.recipeEntities[i].category,
        })
      );

      if (Array.isArray(selection)) {
        this.selectAllCtrl.setValue(selection.length === 0);
        this.default = data.defaults?.excludedRecipeIds ?? [];
      } else if (selection) {
        const index = data.categoryIds.indexOf(
          data.recipeEntities[selection].category
        );
        this.activeIndex = index;
      }

      this.locked = data.recipeIds.reduce((e: Entities<boolean>, id) => {
        const recipe = data.recipeEntities[id];
        e[id] =
          recipe.unlockedBy != null &&
          this.researchedTechnologyIds != null &&
          this.researchedTechnologyIds.indexOf(recipe.unlockedBy) === -1;
        return e;
      }, {});
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

  reset(): void {
    this.selection = this.default;
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
