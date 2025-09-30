import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';

import { Quality, qualityOptions } from '~/data/schema/quality';
import { Option } from '~/option/option';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Button } from '../button/button';
import { Select } from '../select/select';
import { TabData } from '../tabs/tab-data';
import { Tabs } from '../tabs/tabs';
import { Tooltip } from '../tooltip/tooltip';
import { PickerData } from './picker-data';

let lastCategory: string | null = null;

@Component({
  selector: 'lab-picker-dialog',
  imports: [
    FormsModule,
    FaIconComponent,
    Button,
    Select,
    Tabs,
    TranslatePipe,
    Tooltip,
  ],
  templateUrl: './picker-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex flex-col gap-2 lg:w-3xl xl:w-[80dvw] 2xl:w-[70dvw] p-2 pt-0 max-h-[50rem] h-[90dvh] sm:h-[80dvh]',
  },
})
export class PickerDialog {
  private readonly settingsStore = inject(SettingsStore);
  protected readonly dialogData = inject<PickerData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef);

  protected readonly data = this.settingsStore.dataset;
  protected readonly defaults = this.settingsStore.defaults;

  protected readonly faMagnifyingGlass = faMagnifyingGlass;
  protected readonly faXmark = faXmark;
  protected readonly qualityOptions = qualityOptions;

  isMultiselect = false;
  readonly filter = signal('');
  readonly quality = signal(Quality.Normal);
  readonly allSelected = signal(false);
  protected rowsKey = `${this.dialogData.type}CategoryRows` as const;
  protected recordKey = `${this.dialogData.type}Record` as const;
  selection: string | string[] | undefined;
  allSelectItems: Option[] = [];
  allCategoryRows: Record<string, string[][]> = {};

  readonly categoryRows = computed(() => {
    const filter = this.filter();
    const quality = this.quality();

    if (!filter && quality === Quality.Any) return this.allCategoryRows;

    let allIds = Array.from(this.dialogData.allIds);

    if (quality !== Quality.Any) {
      const check = quality === Quality.Normal ? undefined : quality;
      allIds = allIds.filter(
        (i) => this.data()[this.recordKey][i].quality === check,
      );
    }

    if (filter) {
      const check = filter.toLocaleLowerCase();
      allIds = allIds.filter((i) =>
        this.data()[this.recordKey][i].name.toLocaleLowerCase().includes(check),
      );
    }

    const result: Record<string, string[][]> = {};
    const keys = Object.keys(this.allCategoryRows);
    for (const c of keys) {
      const rows = [];
      for (const r of this.allCategoryRows[c]) {
        const row = r.filter((i) => allIds.includes(i));
        if (row.length) rows.push(row);
      }

      if (rows.length) result[c] = rows;
    }

    return result;
  });

  readonly categoryTabs = computed(() =>
    Object.keys(this.categoryRows()).map(
      (k): TabData => ({ label: this.data().categoryRecord[k].name, value: k }),
    ),
  );

  readonly selectedCategory = linkedSignal<Record<string, string[][]>, string>({
    source: this.categoryRows,
    computation: (value, previous) => {
      const keys = Object.keys(value);
      if (previous && keys.includes(previous.value)) return previous.value;
      if (lastCategory && keys.includes(lastCategory)) return lastCategory;
      return keys[0];
    },
  });

  constructor() {
    let { selection, allIds } = { ...this.dialogData };
    allIds = Array.from(allIds);
    if (selection instanceof Set) selection = Array.from(selection);
    if (Array.isArray(selection)) {
      this.isMultiselect = true;
      this.selection = [...selection];
    } else {
      this.isMultiselect = false;
      this.selection = selection;
    }
    const data = this.data();
    data.categoryIds.forEach((c) => {
      if (data[this.rowsKey][c]) {
        this.allCategoryRows[c] = [];
        data[this.rowsKey][c].forEach((r) => {
          const row = r.filter((i) => allIds.includes(i));
          if (row.length) this.allCategoryRows[c].push(row);
        });
      }
    });

    this.allSelectItems = Array.from(allIds).map(
      (i): Option => ({ label: data[this.recordKey][i].name, value: i }),
    );

    if (Array.isArray(selection)) this.allSelected.set(selection.length === 0);
    else if (selection != null) {
      this.selectedCategory.set(data[this.recordKey][selection].category);
    }

    effect(() => (lastCategory = this.selectedCategory()));
  }

  selectId(id: string): void {
    if (Array.isArray(this.selection)) {
      // const index = this.selection.indexOf(id);
      // if (index === -1) this.selection.push(id);
      // else this.selection.splice(index, 1);
      // this.allSelected = this.selection.length === 0;
    } else this.dialogRef.close(id);
  }
}
