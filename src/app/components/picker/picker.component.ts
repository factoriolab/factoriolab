import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  input,
  Output,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';

import { DropdownBaseDirective } from '~/directives/dropdown-base.directive';
import { TabViewOverrideDirective } from '~/directives/tabview-override.directive';
import { coalesce } from '~/helpers';
import { Category } from '~/models/data/category';
import { Quality, qualityFilterOptions } from '~/models/enum/quality';
import { Entities } from '~/models/utils';
import { IconSmClassPipe } from '~/pipes/icon-class.pipe';
import { TranslatePipe } from '~/pipes/translate.pipe';
import { ContentService } from '~/services/content.service';
import { SettingsService } from '~/store/settings.service';

import { DialogComponent } from '../modal';
import { TooltipComponent } from '../tooltip/tooltip.component';

@Component({
  selector: 'lab-picker',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    CheckboxModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    ScrollPanelModule,
    TooltipModule,
    TabViewModule,
    IconSmClassPipe,
    DropdownBaseDirective,
    TabViewOverrideDirective,
    TooltipComponent,
    TranslatePipe,
  ],
  templateUrl: './picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickerComponent extends DialogComponent {
  filterSvc = inject(FilterService);
  contentSvc = inject(ContentService);
  settingsSvc = inject(SettingsService);

  filterInput = viewChild.required<ElementRef<HTMLInputElement>>('filterInput');

  header = input('');
  @Output() selectId = new EventEmitter<string>();
  @Output() selectIds = new EventEmitter<Set<string>>();

  data = this.settingsSvc.dataset;

  search = '';
  allSelected = false;
  quality = Quality.Normal;

  type: 'item' | 'recipe' = 'item';
  isMultiselect = false;
  selection: string | string[] | undefined;
  default: string | string[] | undefined;
  categoryEntities: Entities<Category> = {};
  categoryIds: string[] = [];
  categoryRows: Entities<string[][]> = {};
  // Preserve state prior to any filtering
  allSelectItems: SelectItem<string>[] = [];
  allCategoryIds: string[] = [];
  allCategoryRows: Entities<string[][]> = {};
  activeIndex = 0;
  qualityOptions = qualityFilterOptions;

  clickOpen(
    type: 'item' | 'recipe',
    allIds: string[] | Set<string>,
    selection?: string | string[] | Set<string>,
  ): void {
    const data = this.data();
    this.type = type;
    const allIdsSet = new Set(allIds);
    const allIdsArr = Array.from(allIds);
    if (selection instanceof Set) selection = Array.from(selection);
    if (Array.isArray(selection)) {
      this.isMultiselect = true;
      this.selection = [...selection];
    } else {
      this.isMultiselect = false;
      this.selection = selection;
    }
    this.search = '';
    this.categoryEntities = data.categoryEntities;
    if (type === 'item') {
      this.categoryRows = {};
      data.categoryIds.forEach((c) => {
        if (data.categoryItemRows[c]) {
          this.categoryRows[c] = [];
          data.categoryItemRows[c].forEach((r) => {
            const row = r.filter((i) => allIdsSet.has(i));
            if (row.length) this.categoryRows[c].push(row);
          });
        }
      });

      this.allSelectItems = allIdsArr.map(
        (i): SelectItem<string> => ({
          label: data.itemEntities[i].name,
          value: i,
          title: data.itemEntities[i].category,
        }),
      );

      if (Array.isArray(selection)) {
        this.allSelected = selection.length === 0;
      } else if (selection != null) {
        const index = data.categoryIds.indexOf(
          data.itemEntities[selection].category,
        );
        this.activeIndex = index;
      }
    } else {
      this.categoryRows = {};
      data.categoryIds.forEach((c) => {
        if (data.categoryRecipeRows[c]) {
          this.categoryRows[c] = [];
          data.categoryRecipeRows[c].forEach((r) => {
            const row = r.filter((i) => allIdsSet.has(i));
            if (row.length) this.categoryRows[c].push(row);
          });
        }
      });

      this.allSelectItems = allIdsArr.map(
        (i): SelectItem<string> => ({
          label: data.recipeEntities[i].name,
          value: i,
          title: data.recipeEntities[i].category,
        }),
      );

      if (Array.isArray(selection)) {
        this.allSelected = selection.length === 0;
        this.default = [...coalesce(data.defaults?.excludedRecipeIds, [])];
      } else if (selection) {
        const index = data.categoryIds.indexOf(
          data.recipeEntities[selection].category,
        );
        this.activeIndex = index;
      }
    }
    this.categoryIds = data.categoryIds.filter(
      (c) => this.categoryRows[c]?.length,
    );
    this.allCategoryIds = this.categoryIds;
    this.allCategoryRows = this.categoryRows;
    this.inputSearch();
    this.show();

    if (!this.contentSvc.isMobile()) {
      setTimeout(() => {
        this.filterInput().nativeElement.focus();
      }, 10);
    }
  }

  selectAll(value: boolean): void {
    if (value) this.selection = [];
    else this.selection = this.allSelectItems.map((i) => i.value);
  }

  toggleCategory(categoryId: string): void {
    const value = new Set(this.selection);
    this.categoryRows[categoryId].forEach((row) => {
      row.forEach((i) => {
        if (value.has(i)) value.delete(i);
        else value.add(i);
      });
    });
    this.selection = Array.from(value);
    this.allSelected = this.selection.length === 0;
  }

  reset(): void {
    this.selection = this.default;
  }

  clickId(id: string): void {
    if (Array.isArray(this.selection)) {
      const index = this.selection.indexOf(id);
      if (index === -1) this.selection.push(id);
      else this.selection.splice(index, 1);
      this.allSelected = this.selection.length === 0;
    } else {
      this.selectId.emit(id);
      this.visible = false;
    }
  }

  save(): void {
    if (Array.isArray(this.selection))
      this.selectIds.emit(new Set(this.selection));
  }

  inputSearch(): void {
    if (!this.search && this.quality === Quality.Any) {
      this.categoryIds = this.allCategoryIds;
      this.categoryRows = this.allCategoryRows;
      return;
    }

    let allItems = this.allSelectItems;

    if (this.quality !== Quality.Any) {
      const check = this.quality === Quality.Normal ? undefined : this.quality;
      if (this.type === 'item') {
        allItems = allItems.filter(
          (i) => this.data().itemEntities[i.value].quality === check,
        );
      } else {
        allItems = allItems.filter(
          (i) => this.data().recipeEntities[i.value].quality === check,
        );
      }
    }

    // Filter for matching item ids
    const filteredItems = this.filterSvc.filter(
      allItems,
      ['label'],
      this.search,
      'contains',
    ) as SelectItem<string>[];

    // Filter for matching category ids
    // (Cache category on the SelectItem `title` field)
    this.categoryIds = this.allCategoryIds.filter((c) =>
      filteredItems.some((i) => i.title === c),
    );

    // Filter category rows
    this.categoryRows = {};
    const ids = filteredItems.map((i) => i.value);
    for (const c of this.categoryIds) {
      // Filter each category row
      this.categoryRows[c] = [];
      for (const r of this.allCategoryRows[c])
        this.categoryRows[c].push(r.filter((i) => ids.includes(i)));

      // Filter out empty category rows
      this.categoryRows[c] = this.categoryRows[c].filter((r) => r.length > 0);
    }

    setTimeout(() => {
      this.ref.markForCheck();
    });
  }
}
