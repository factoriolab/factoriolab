import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { cva } from 'class-variance-authority';

import { Button } from '~/components/button/button';
import { Icon } from '~/components/icon/icon';
import { rational } from '~/rational/rational';
import { MessageData } from '~/state/objectives/message-data';
import { ObjectiveType } from '~/state/objectives/objective-type';
import { ObjectiveUnit } from '~/state/objectives/objective-unit';
import { ObjectivesStore } from '~/state/objectives/objectives-store';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

const host = cva(
  'border rounded-xs py-2 px-3 border-l-8 max-w-3xl bg-brand-950 items-center border-brand-700 gap-3',
  {
    variants: {
      hidden: {
        true: 'hidden',
        false: 'inline-flex',
      },
    },
  },
);

@Component({
  selector: 'lab-message',
  imports: [FaIconComponent, Icon, TranslatePipe, Button],
  templateUrl: './message.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
})
export class Message {
  protected readonly objectivesStore = inject(ObjectivesStore);
  protected readonly settingsStore = inject(SettingsStore);

  readonly message = input<MessageData>();

  readonly hostClass = computed(() => {
    const message = this.message();
    return host({ hidden: !message });
  });

  protected readonly faPlus = faPlus;
  protected readonly ObjectiveType = ObjectiveType;
  protected readonly ObjectiveUnit = ObjectiveUnit;
  protected readonly rational = rational;
}
