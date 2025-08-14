import { DIALOG_DATA } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { Category } from '~/models/data/category';
import { Option } from '~/models/option';
import { SettingsStore } from '~/state/settings/settings-store';
import { coalesce } from '~/utils/nullish';

import { DialogData } from '../dialog/dialog';
import { Icon } from '../icon/icon';

export interface PickerData extends DialogData {
  type: 'item' | 'recipe';
  allIds: string[] | Set<string>;
  selection?: string | string[] | Set<string>;
}

@Component({
  selector: 'lab-picker',
  imports: [Icon],
  templateUrl: './picker.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Picker implements OnInit {
  private readonly settingsStore = inject(SettingsStore);
  dialogData = inject<PickerData>(DIALOG_DATA);

  data = this.settingsStore.dataset;
  defaults = this.settingsStore.defaults;

  search = signal('');
  allSelected = false;
  isMultiselect = false;
  selection: string | string[] | undefined;
  default: string | string[] | undefined;
  categoryRecord: Record<string, Category> = {};
  categoryIds: string[] = [];
  categoryRows: Record<string, string[][]> = {};
  // Preserve state prior to any filtering
  allSelectItems: Option[] = [];
  allCategoryIds: string[] = [];
  allCategoryRows: Record<string, string[][]> = {};
  activeIndex = 0;

  ngOnInit(): void {
    this.setup();
  }

  setup(): void {
    const { type, allIds } = { ...this.dialogData };
    let { selection } = { ...this.dialogData };
    const data = this.data();
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

    this.categoryRecord = data.categoryRecord;
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
        (i): Option => ({ label: data.itemRecord[i].name, value: i }),
      );

      if (Array.isArray(selection)) {
        this.allSelected = selection.length === 0;
      } else if (selection != null) {
        const index = data.categoryIds.indexOf(
          data.itemRecord[selection].category,
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
        (i): Option => ({ label: data.recipeRecord[i].name, value: i }),
      );

      if (Array.isArray(selection)) {
        this.allSelected = selection.length === 0;
        this.default = [...coalesce(this.defaults()?.excludedRecipeIds, [])];
      } else if (selection) {
        const index = data.categoryIds.indexOf(
          data.recipeRecord[selection].category,
        );
        this.activeIndex = index;
      }
    }
    this.categoryIds = data.categoryIds.filter(
      (c) => this.categoryRows[c]?.length,
    );
    this.allCategoryIds = this.categoryIds;
    this.allCategoryRows = this.categoryRows;
    // this.inputSearch();
    // this.show();

    // if (!this.contentSvc.isMobile()) {
    //   setTimeout(() => {
    //     this.filterInput().nativeElement.focus();
    //   }, 10);
    // }
  }
}
