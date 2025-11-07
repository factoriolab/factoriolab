import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import {
  FaIconComponent,
  IconDefinition,
} from '@fortawesome/angular-fontawesome';

import { IconType } from '~/data/icon-type';
import { SettingsStore } from '~/state/settings/settings-store';

import { IsLightPipe } from './is-light-pipe';

@Component({
  selector: 'lab-icon',
  imports: [FaIconComponent, IsLightPipe],
  templateUrl: './icon.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0 relative size-8' },
})
export class Icon {
  private readonly settingsStore = inject(SettingsStore);

  readonly value = input.required<string | IconDefinition>();
  readonly type = input<IconType>();
  readonly text = input<string>();
  readonly alt = input<string>();

  protected readonly icon = computed(() => {
    const value = this.value();
    if (typeof value !== 'string') return undefined;
    const record = this.settingsStore.dataset().iconRecord;
    const type = this.type();
    if (type) return record[type][value];
    return record.game[value] ?? record.system[value];
  });

  protected readonly faIcon = computed(() => {
    const value = this.value();
    if (typeof value === 'string') return undefined;
    return value;
  });
}
