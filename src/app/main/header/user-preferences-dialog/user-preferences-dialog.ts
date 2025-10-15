import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheck, faCircleInfo } from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { FormField } from '~/components/form-field/form-field';
import { Select } from '~/components/select/select';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { themeOptions } from '~/state/preferences/theme';
import { languageOptions } from '~/translate/language';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Hue } from './hue/hue';

@Component({
  selector: 'lab-user-preferences-dialog',
  imports: [
    FormsModule,
    FaIconComponent,
    Button,
    FormField,
    Hue,
    Select,
    TranslatePipe,
  ],
  templateUrl: './user-preferences-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex flex-col p-3 pt-px sm:pt-px sm:p-6 gap-3 sm:gap-6 max-w-full w-xl',
  },
})
export class UserPreferencesDialog {
  protected readonly dialogRef = inject(DialogRef);
  protected readonly preferencesStore = inject(PreferencesStore);

  protected readonly faCheck = faCheck;
  protected readonly faCircleInfo = faCircleInfo;
  protected readonly languageOptions = languageOptions;
  protected readonly state = this.preferencesStore.state;
  protected readonly themeOptions = themeOptions;
}
