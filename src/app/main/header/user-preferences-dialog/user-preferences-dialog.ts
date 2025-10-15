import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faCheck,
  faCircleInfo,
  faExclamationTriangle,
  faRotateLeft,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { Checkbox } from '~/components/checkbox/checkbox';
import { Confirm } from '~/components/confirm/confirm';
import { FormField } from '~/components/form-field/form-field';
import { Select } from '~/components/select/select';
import { powerUnitOptions } from '~/state/preferences/power-unit';
import {
  initialPreferencesState,
  PreferencesState,
} from '~/state/preferences/preferences-state';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { themeOptions } from '~/state/preferences/theme';
import { SettingsStore } from '~/state/settings/settings-store';
import { languageOptions } from '~/translate/language';
import { TranslatePipe } from '~/translate/translate-pipe';
import { WindowClient } from '~/window/window-client';

import { Hue } from './hue/hue';

@Component({
  selector: 'lab-user-preferences-dialog',
  imports: [
    FormsModule,
    FaIconComponent,
    Button,
    Checkbox,
    FormField,
    Hue,
    Select,
    TranslatePipe,
  ],
  templateUrl: './user-preferences-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex flex-col p-3 pt-px sm:pt-px sm:p-6 gap-3 sm:gap-6 max-w-full w-sm',
  },
})
export class UserPreferencesDialog {
  private readonly router = inject(Router);
  protected readonly dialogRef = inject(DialogRef);
  protected readonly confirm = inject(Confirm);
  protected readonly preferencesStore = inject(PreferencesStore);
  private readonly settingsStore = inject(SettingsStore);
  private readonly windowClient = inject(WindowClient);

  protected readonly apply = this.preferencesStore.apply.bind(
    this.preferencesStore,
  );
  protected readonly faCheck = faCheck;
  protected readonly faCircleInfo = faCircleInfo;
  protected readonly faRotateLeft = faRotateLeft;
  protected readonly languageOptions = languageOptions;
  protected readonly powerUnitOptions = powerUnitOptions;
  protected readonly state = this.preferencesStore.state;
  protected readonly themeOptions = themeOptions;

  reset(): void {
    this.confirm
      .open({
        header: 'userPreferences.resetHeader',
        message: 'userPreferences.resetMessage',
        icon: faExclamationTriangle,
        actions: [
          { text: 'yes', value: 1, icon: faRotateLeft },
          { text: 'no', value: 2, icon: faTrash },
          { text: 'cancel', value: 0, icon: faXmark },
        ],
      })
      .subscribe((res) => {
        if (res === 1) {
          const state = initialPreferencesState as Partial<PreferencesState>;
          delete state.states; // Do not reset saved states
          this.preferencesStore.apply(state);
        } else if (res === 2) {
          this.windowClient.clearLocalStorage();
          this.router
            .navigate([this.settingsStore.modId()])
            .then(
              this.windowClient.reload.bind(this.windowClient),
              this.windowClient.reload.bind(this.windowClient),
            );
        }
      });
  }
}
