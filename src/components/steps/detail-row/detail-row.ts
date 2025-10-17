import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';

import { Icon } from '~/components/icon/icon';
import { Tooltip } from '~/components/tooltip/tooltip';
import { Rational, rational } from '~/rational/rational';
import { SettingsStore } from '~/state/settings/settings-store';

import { RatePipe } from '../pipes/rate-pipe';

@Component({
  selector: 'tr[labDetailRow], tr[lab-detail-row]',
  exportAs: 'labDetailRow',
  imports: [Icon, Tooltip, RatePipe],
  templateUrl: './detail-row.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailRow {
  protected readonly settingsStore = inject(SettingsStore);

  readonly items = input<Rational>();
  readonly itemId = input<string>();
  readonly belts = input<Rational>();
  readonly beltId = input<string>();
  readonly stack = input<Rational>();
  readonly wagons = input<Rational>();
  readonly wagonId = input<string>();
  readonly machines = input<Rational>();
  readonly recipeId = input<string>();
  readonly recipeObjectiveId = input<string>();
  readonly machineId = input<string>();
  readonly percent = input<Rational>();
  readonly percentOnDest = input<boolean>();
  readonly destId = input<string>();
  readonly isInput = input<boolean>();
  readonly isOutput = input<boolean>();

  protected readonly cols = this.settingsStore.columnsState;
  protected readonly data = this.settingsStore.dataset;
  protected readonly rational = rational;
}
