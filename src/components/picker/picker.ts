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
    selection?: string | string[] | Set<string>,
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
    selection?: string | string[] | Set<string>,
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
}
