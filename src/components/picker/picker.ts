import { Dialog } from '@angular/cdk/dialog';
import { inject, Service } from '@angular/core';
import {
  faTriangleExclamation,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { filter, map, Observable, of, switchMap } from 'rxjs';

import { SettingsStore } from '~/state/settings/settings-store';

import { Confirm } from '../confirm/confirm';
import { PickerData } from './picker-data';
import { PickerDialog } from './picker-dialog';

@Service()
export class Picker {
  private readonly dialog = inject(Dialog);
  private readonly confirm = inject(Confirm);
  private readonly settingsStore = inject(SettingsStore);

  pickItem(
    selection?: string,
    allIds?: string[] | Set<string>,
  ): Observable<string> {
    const data = this.settingsStore.dataset();
    // By default, only include items that are "includable" and "available"
    allIds ??= data.includableItemIds.intersection(
      this.settingsStore.settings().availableItemIds,
    );
    allIds ??= this.settingsStore.settings().availableItemIds;
    return this.dialog
      .open<boolean | string, PickerData>(PickerDialog, {
        data: { header: 'picker.selectItem', type: 'item', allIds, selection },
      })
      .closed.pipe(
        filter((result) => typeof result === 'string'),
        switchMap((itemId) => {
          const item = data.itemRecord[itemId];
          if (item.technology == null) return of(itemId);
          const alt = data.itemIds
            .map((i) => data.itemRecord[i])
            .find((i) => i.id !== itemId && i.name === item.name);
          if (alt)
            return this.confirm
              .open({
                header: 'picker.techConfirmHeader',
                message: 'picker.techConfirmMessage',
                icon: faTriangleExclamation,
                actions: [
                  {
                    text: 'picker.techConfirmTech',
                    value: itemId,
                    icon: item.id,
                    iconType: 'item',
                  },
                  {
                    text: 'picker.techConfirmItem',
                    value: alt.id,
                    icon: alt.id,
                    iconType: 'item',
                  },
                  { text: 'cancel', faIcon: faXmark },
                ],
              })
              .pipe(filter((result) => result != null));
          return of(itemId);
        }),
      );
  }

  pickRecipe(
    selection?: string,
    allIds?: string[] | Set<string>,
  ): Observable<string> {
    allIds ??= this.settingsStore.settings().availableRecipeIds;
    return this.dialog
      .open<boolean | string, PickerData>(PickerDialog, {
        data: {
          header: 'picker.selectRecipe',
          type: 'recipe',
          allIds,
          selection,
        },
      })
      .closed.pipe(filter((result) => typeof result === 'string'));
  }

  pickExcludedRecipes(): void {
    const data = this.settingsStore.dataset();
    const ref = this.dialog.open<boolean | string, PickerData, PickerDialog>(
      PickerDialog,
      {
        data: {
          header: 'picker.includedRecipes',
          type: 'recipe',
          allIds: data.recipeIds,
          selection: this.settingsStore.settings().excludedRecipeIds,
          default: this.settingsStore.defaults()?.excludedRecipeIds,
        },
      },
    );
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
    const ref = this.dialog.open<boolean | string, PickerData, PickerDialog>(
      PickerDialog,
      {
        data: {
          header: 'picker.includedItems',
          type: 'item',
          allIds: data.itemIds,
          selection: this.settingsStore.settings().excludedItemIds,
        },
      },
    );
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
