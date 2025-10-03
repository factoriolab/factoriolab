import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';

import { Button } from '~/components/button/button';
import { Tooltip } from '~/components/tooltip/tooltip';
import { Color } from '~/state/preferences/color';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

@Component({
  selector: 'lab-technologies-set',
  imports: [Button, TranslatePipe, Tooltip],
  templateUrl: './technologies-set.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-1' },
})
export class TechnologiesSet {
  protected readonly preferencesStore = inject(PreferencesStore);
  protected readonly settingsStore = inject(SettingsStore);

  readonly text = input.required<string>();
  readonly ids = input.required<string[]>();
  readonly color = input<Color>('gray');

  readonly toggleId = output<string>();

  protected readonly data = this.settingsStore.dataset;
}
