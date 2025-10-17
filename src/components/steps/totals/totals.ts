import { KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  TemplateRef,
  viewChild,
} from '@angular/core';

import { Icon } from '~/components/icon/icon';
import { Tooltip } from '~/components/tooltip/tooltip';
import { sortByValue } from '~/rational/sort-by-value';
import { ObjectivesStore } from '~/state/objectives/objectives-store';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

import { PowerPipe } from '../pipes/power-pipe';
import { RatePipe } from '../pipes/rate-pipe';
import { TotalCells, TotalCellsContext } from './total-cells';
import { TotalIconTypePipe } from './total-icon-type-pipe';
import { TotalTooltipTypePipe } from './total-tooltip-type-pipe';

@Component({
  selector: 'tfoot[labTotals], tfoot[lab-totals]',
  exportAs: 'labTotals',
  imports: [
    KeyValuePipe,
    NgTemplateOutlet,
    Icon,
    Tooltip,
    TranslatePipe,
    PowerPipe,
    RatePipe,
    TotalCells,
    TotalIconTypePipe,
    TotalTooltipTypePipe,
  ],
  templateUrl: './totals.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Totals {
  private readonly objectivesStore = inject(ObjectivesStore);
  private readonly settingsStore = inject(SettingsStore);

  protected readonly cols = this.settingsStore.columnsState;
  protected readonly data = this.settingsStore.dataset;
  protected readonly powerUnit = this.objectivesStore.effectivePowerUnit;
  protected readonly sortByValue = sortByValue;
  protected readonly totals = this.objectivesStore.totals;

  protected readonly totalCells = viewChild.required<
    TotalCells,
    TemplateRef<TotalCellsContext>
  >(TotalCells, {
    read: TemplateRef,
  });
}
