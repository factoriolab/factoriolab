import { CdkTableModule } from '@angular/cdk/table';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  faFileArrowDown,
  faTableColumns,
} from '@fortawesome/free-solid-svg-icons';

import { Exporter } from '~/exporter/exporter';
import { RatePipe } from '~/rational/rate-pipe';
import { Step } from '~/solver/step';
import { ObjectivesStore } from '~/state/objectives/objectives-store';
import { SettingsStore } from '~/state/settings/settings-store';

import { Button } from '../button/button';
import { Icon } from '../icon/icon';
import { TypeSafeCdkCellDef } from '../type-safe-cdk-cell-def/type-safe-cell-def';

@Component({
  selector: 'lab-steps',
  imports: [CdkTableModule, Button, Icon, RatePipe, TypeSafeCdkCellDef],
  templateUrl: './steps.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-1 sm:gap-2' },
})
export class Steps {
  protected readonly exporter = inject(Exporter);
  protected readonly objectivesStore = inject(ObjectivesStore);
  protected readonly settingsStore = inject(SettingsStore);

  protected readonly faFileArrowDown = faFileArrowDown;
  protected readonly faTableColumns = faTableColumns;
  protected readonly Step!: Step;
}
