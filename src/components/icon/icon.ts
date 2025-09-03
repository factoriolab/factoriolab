import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import { IconType } from '~/data/icon-type';
import { Rational } from '~/rational/rational';
import { RoundPipe } from '~/rational/round-pipe';
import { SettingsStore } from '~/state/settings/settings-store';

@Component({
  selector: 'lab-icon',
  imports: [RoundPipe],
  templateUrl: './icon.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex shrink-0 relative size-8',
  },
})
export class Icon {
  private readonly settingsStore = inject(SettingsStore);

  readonly value = input.required<string>();
  readonly type = input.required<IconType>();
  readonly quantity = input<Rational | string | number>();

  readonly icon = computed(
    () => this.settingsStore.dataset().iconRecord[this.type()][this.value()],
  );
}
