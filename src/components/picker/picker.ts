import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { inject, Service } from '@angular/core';
import { filter, map, Observable } from 'rxjs';

import { SettingsStore } from '~/state/settings/settings-store';

import { PickerData } from './picker-data';
import { PickerDialog } from './picker-dialog';

@Service()
export class Picker {
  private readonly dialog = inject(Dialog);
  private readonly settingsStore = inject(SettingsStore);

  pickItem(
    selection?: string,
    allIds?: string[] | Set<string>,
  ): Observable<string> {
    allIds ??= this.settingsStore.settings().availableItemIds;
    const config = new DialogConfig<
      PickerData,
      DialogRef<boolean | string, PickerDialog>
    >();
    config.data = {
      header: 'picker.selectItem',
      type: 'item',
      allIds,
      selection,
    };
    return this.dialog
      .open(PickerDialog, config)
      .closed.pipe(filter((result) => typeof result === 'string'));
  }

  pickRecipe(
    selection?: string,
    allIds?: string[] | Set<string>,
  ): Observable<string> {
    allIds ??= this.settingsStore.settings().availableRecipeIds;
    const config = new DialogConfig<
      PickerData,
      DialogRef<boolean | string, PickerDialog>
    >();
    config.data = {
      header: 'picker.selectRecipe',
      type: 'recipe',
      allIds,
      selection,
    };
    return this.dialog
      .open(PickerDialog, config)
      .closed.pipe(filter((result) => typeof result === 'string'));
  }

  pickExcludedRecipes(): void {
    const data = this.settingsStore.dataset();
    const config = new DialogConfig<
      PickerData,
      DialogRef<boolean | string, PickerDialog>
    >();
    config.data = {
      header: 'picker.includedRecipes',
      type: 'recipe',
      allIds: data.recipeIds,
      selection: this.settingsStore.settings().excludedRecipeIds,
      default: this.settingsStore.defaults()?.excludedRecipeIds,
    };
    const ref = this.dialog.open(PickerDialog, config);
    ref.closed
      .pipe(
        filter((result) => result !== false),
        map(() => ref.componentInstance?.selection()),
      )
      .subscribe((excludedRecipeIds) => {
        this.settingsStore.apply({ excludedRecipeIds });
      });
  }

  pickExcludedItems(): void {
    const data = this.settingsStore.dataset();
    const config = new DialogConfig<
      PickerData,
      DialogRef<boolean | string, PickerDialog>
    >();
    config.data = {
      header: 'picker.includedItems',
      type: 'item',
      allIds: data.itemIds,
      selection: this.settingsStore.settings().excludedItemIds,
    };
    const ref = this.dialog.open(PickerDialog, config);
    ref.closed
      .pipe(
        filter((result) => result !== false),
        map(() => ref.componentInstance?.selection()),
      )
      .subscribe((excludedItemIds) => {
        this.settingsStore.apply({ excludedItemIds });
      });
  }
}
