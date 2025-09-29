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
    class:
      'inline-flex shrink-0 relative size-8 text-sm/4 font-bold text-white',
  },
})
export class Icon {
  private readonly settingsStore = inject(SettingsStore);

  readonly value = input.required<string>();
  readonly type = input.required<IconType>();
  readonly text = input<string>();

  readonly icon = computed(
    () => this.settingsStore.dataset().iconRecord[this.type()][this.value()],
  );
}
