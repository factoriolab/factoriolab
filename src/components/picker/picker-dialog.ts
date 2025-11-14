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
import {
  faCheck,
  faEyeSlash,
  faMagnifyingGlass,
  faRotateLeft,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Quality, qualityOptions } from '~/data/schema/quality';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';
import { areSetsEqual } from '~/utils/equality';

import { Button } from '../button/button';
import { Checkbox } from '../checkbox/checkbox';
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
    Checkbox,
    Select,
    Tabs,
    TranslatePipe,
    Tooltip,
  ],
  templateUrl: './picker-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex h-[90dvh] max-h-[50rem] w-dvw max-w-5xl flex-col gap-2 p-3 pt-0 sm:h-[80dvh] md:w-3xl xl:w-[80dvw] 2xl:w-[70dvw]',
  },
})
export class PickerDialog {
  private readonly settingsStore = inject(SettingsStore);
  protected readonly dialogData = inject<PickerData>(DIALOG_DATA);
  protected readonly dialogRef = inject(DialogRef);

  protected readonly data = this.settingsStore.dataset;

  protected readonly allIds = new Set(this.dialogData.allIds);
  protected readonly multi = this.dialogData.selection instanceof Set;
  protected readonly selectedId?: string;
  protected readonly selection = signal(new Set<string>());
  protected readonly filter = signal('');

  protected readonly allSelected = computed(() => {
    const selection = this.selection();
    if (selection.size === 0) return true;
    if (selection.size === this.allIds.size) return false;
    return undefined;
  });

  protected readonly recyclingSet = computed(() => {
    if (this.dialogData.type === 'item' || !this.multi)
      return new Set<string>();
    const data = this.data();
    const recyclingIds = data.recipeIds.filter((r) =>
      data.recipeRecord[r].flags.has('recycling'),
    );
    return new Set(recyclingIds);
  });

  protected readonly allRecyclingSelected = computed(() => {
    const selection = this.selection();
    const recyclingSet = this.recyclingSet();
    const recyclingSelection = Array.from(recyclingSet).filter((r) =>
      selection.has(r),
    );
    if (recyclingSelection.length === 0) return true;
    if (recyclingSelection.length === recyclingSet.size) return false;
    return undefined;
  });

  protected readonly isDefault = computed(() =>
    areSetsEqual(this.selection(), new Set(this.dialogData.default)),
  );

  protected readonly quality = signal(Quality.Normal);
  protected readonly rowsKey = `${this.dialogData.type}CategoryRows` as const;
  protected readonly recordKey = `${this.dialogData.type}Record` as const;
  private readonly allCategoryRows: Record<string, string[][]> = {};

  protected readonly categoryRows = computed(() => {
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

  protected readonly faCheck = faCheck;
  protected readonly faEyeSlash = faEyeSlash;
  protected readonly faMagnifyingGlass = faMagnifyingGlass;
  protected readonly faRotateLeft = faRotateLeft;
  protected readonly faXmark = faXmark;
  protected readonly qualityOptions = qualityOptions;

  constructor() {
    const { selection } = { ...this.dialogData };
    const data = this.data();
    data.categoryIds.forEach((c) => {
      if (data[this.rowsKey][c]) {
        this.allCategoryRows[c] = [];
        data[this.rowsKey][c].forEach((r) => {
          const row = r.filter((i) => this.allIds.has(i));
          if (row.length) this.allCategoryRows[c].push(row);
        });
      }
    });

    if (selection instanceof Set) this.selection.set(selection);
    else if (selection != null) {
      this.selectedId = selection;
      this.selectedCategory.set(data[this.recordKey][selection].category);
    }

    effect(() => (lastCategory = this.selectedCategory()));
  }

  selectAll(value: boolean): void {
    if (value) this.selection.set(new Set());
    else this.selection.set(new Set(this.allIds));
  }

  selectAllRecycling(value: boolean): void {
    this.selection.update((s) => {
      s = new Set(s);
      for (const recipeId of Array.from(this.recyclingSet())) {
        if (value) s.delete(recipeId);
        else s.add(recipeId);
      }

      return s;
    });
  }

  selectId(id: string): void {
    if (this.multi) {
      this.selection.update((s) => {
        s = new Set(s);
        if (s.has(id)) s.delete(id);
        else s.add(id);
        return s;
      });
    } else this.dialogRef.close(id);
  }

  reset(): void {
    this.selection.set(new Set(this.dialogData.default));
  }
}
