import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faAngleRight,
  faFileArrowDown,
  faSquareCheck,
  faTableColumns,
} from '@fortawesome/free-solid-svg-icons';

import { Exporter } from '~/exporter/exporter';
import { RatePipe } from '~/rational/rate-pipe';
import { Step } from '~/solver/step';
import { ObjectivesStore } from '~/state/objectives/objectives-store';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Button } from '../button/button';
import { Columns } from '../columns/columns';
import { Icon } from '../icon/icon';
import { Tooltip } from '../tooltip/tooltip';

@Component({
  selector: 'lab-steps',
  imports: [FaIconComponent, Button, Icon, RatePipe, Tooltip, TranslatePipe],
  templateUrl: './steps.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-1 sm:gap-2' },
})
export class Steps {
  protected readonly columns = inject(Columns);
  protected readonly exporter = inject(Exporter);
  protected readonly objectivesStore = inject(ObjectivesStore);
  protected readonly settingsStore = inject(SettingsStore);

  protected readonly cols = this.settingsStore.columnsState;

  protected readonly faAngleRight = faAngleRight;
  protected readonly faFileArrowDown = faFileArrowDown;
  protected readonly faSquareCheck = faSquareCheck;
  protected readonly faTableColumns = faTableColumns;

  expandedSteps = signal<Set<string>>(new Set());

  toggleStep(step: Step): void {
    this.expandedSteps.update((s) =>
      s.has(step.id)
        ? new Set(Array.from(s).filter((s) => s !== step.id))
        : new Set([...Array.from(s), step.id]),
    );
  }
}
