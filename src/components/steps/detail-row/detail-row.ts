import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowRightLong } from '@fortawesome/free-solid-svg-icons';

import { Icon } from '~/components/icon/icon';
import { Tooltip } from '~/components/tooltip/tooltip';
import { Rational, rational } from '~/rational/rational';
import { SettingsStore } from '~/state/settings/settings-store';

import { RatePipe } from '../pipes/rate-pipe';
import { Steps } from '../steps';
import { PercentPadPipe } from './percent-pad-pipe';

@Component({
  selector: 'tr[labDetailRow], tr[lab-detail-row]',
  exportAs: 'labDetailRow',
  imports: [FaIconComponent, Icon, Tooltip, RatePipe, PercentPadPipe],
  templateUrl: './detail-row.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'detail' },
})
export class DetailRow {
  protected readonly settingsStore = inject(SettingsStore);
  protected readonly steps = inject(Steps);

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
  readonly destRecipeObjectiveId = input<string>();
  readonly destType = input<'item' | 'recipe'>('item');
  readonly isInput = input<boolean>();
  readonly isOutput = input<boolean>();

  protected readonly cols = this.settingsStore.columnsState;
  protected readonly data = this.settingsStore.dataset;
  protected readonly faArrowRightLong = faArrowRightLong;
  protected readonly rational = rational;

  protected readonly machineIdSpan = computed(() => {
    const cols = this.cols();
    let colspan = 1;
    if (cols.beacons.show) colspan++;
    if (cols.power.show) colspan++;
    if (cols.pollution.show) colspan++;
    if (cols.link.show) colspan++;
    return colspan;
  });
}
