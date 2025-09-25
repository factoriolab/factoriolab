import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';

import { Icon } from '~/components/icon/icon';
import { Tooltip } from '~/components/tooltip/tooltip';
import { Step } from '~/solver/step';
import { ObjectivesStore } from '~/state/objectives/objectives-store';

import { ExcludeButton } from '../exclude-button/exclude-button';
import { Steps } from '../steps';

@Component({
  selector: 'td[lab-tree-cell], td[labTreeCell]',
  imports: [ExcludeButton, Icon, Tooltip],
  templateUrl: './tree-cell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'px-0 py-0 sm:px-2' },
})
export class TreeCell {
  protected readonly objectivesStore = inject(ObjectivesStore);
  protected readonly parent = inject(Steps);

  readonly step = input.required<Step>();
}
