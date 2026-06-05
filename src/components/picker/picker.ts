import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SettingsStore } from '~/state/settings/settings-store';
import { filterNullish } from '~/utils/nullish';

import { PickerData } from './picker-data';
import { PickerDialog } from './picker-dialog';

@Injectable({ providedIn: 'root' })
export class Picker {
  private readonly dialog = inject(Dialog);
  private readonly settingsStore = inject(SettingsStore);

  pickItem(
    selection?: string,
    allIds?: string[] | Set<string>,
  ): Observable<string> {
    allIds ??= this.settingsStore.settings().availableItemIds;
    return this.dialog
      .open<string, PickerData>(PickerDialog, {
        data: { header: 'picker.selectItem', type: 'item', allIds, selection },
      })
      .closed.pipe(filterNullish());
  }

  pickRecipe(
    selection?: string,
    allIds?: string[] | Set<string>,
  ): Observable<string> {
    allIds ??= this.settingsStore.settings().availableRecipeIds;
    return this.dialog
      .open<string, PickerData>(PickerDialog, {
        data: {
          header: 'picker.selectRecipe',
          type: 'recipe',
          allIds,
          selection,
        },
      })
      .closed.pipe(filterNullish());
  }

  pickExcludedRecipes(): void {
    const data = this.settingsStore.dataset();
    this.dialog
      .open<Set<string>, PickerData>(PickerDialog, {
        data: {
          header: 'picker.includedRecipes',
          type: 'recipe',
          allIds: data.recipeIds,
          selection: this.settingsStore.settings().excludedRecipeIds,
          default: this.settingsStore.defaults()?.excludedRecipeIds,
        },
      })
      .closed.pipe(filterNullish())
      .subscribe((excludedRecipeIds) => {
        this.settingsStore.apply({ excludedRecipeIds });
      });
  }

  pickExcludedItems(): void {
    const data = this.settingsStore.dataset();
    this.dialog
      .open<Set<string>, PickerData>(PickerDialog, {
        data: {
          header: 'picker.includedItems',
          type: 'item',
          allIds: data.itemIds,
          selection: this.settingsStore.settings().excludedItemIds,
        },
      })
      .closed.pipe(filterNullish())
      .subscribe((excludedItemIds) => {
        this.settingsStore.apply({ excludedItemIds });
      });
  }
}
