import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import { IconType } from '~/data/icon-type';
import { SettingsStore } from '~/state/settings/settings-store';

@Component({
  selector: 'lab-icon',
  templateUrl: './icon.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex size-16 scale-50 -m-4 shrink-0',
    '[style.background-image]': 'icon().file',
    '[style.background-position]': 'icon().position',
  },
})
export class Icon {
  private readonly settingsStore = inject(SettingsStore);

  readonly value = input.required<string>();
  readonly type = input.required<IconType>();

  icon = computed(
    () => this.settingsStore.dataset().iconRecord[this.type()][this.value()],
  );
}
