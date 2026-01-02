import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowRightLong } from '@fortawesome/free-solid-svg-icons';

import { Icon } from '~/components/icon/icon';
import { Tooltip } from '~/components/tooltip/tooltip';
import { Rational, rational } from '~/rational/rational';
import { StepDetailRow } from '~/state/objectives/step-detail-row';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

import { RatePipe } from '../pipes/rate-pipe';
import { Steps } from '../steps';
import { PercentPadPipe } from './percent-pad-pipe';

@Component({
  selector: 'tr[labDetailRow], tr[lab-detail-row]',
  exportAs: 'labDetailRow',
  imports: [
    FaIconComponent,
    Icon,
    Tooltip,
    TranslatePipe,
    RatePipe,
    PercentPadPipe,
  ],
  templateUrl: './detail-row.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'detail' },
})
export class DetailRow {
  protected readonly settingsStore = inject(SettingsStore);
  protected readonly steps = inject(Steps);

  readonly value = input.required<StepDetailRow>();
  readonly factor = input<Rational>(rational.one);

  protected readonly inserterId = linkedSignal(() => {
    const data = this.data();
    const value = this.value();
    if (data.inserterIds.length === 0 || value.items == null) return undefined;
    const factor = this.factor();
    const items = value.items.div(factor);
    const inserterSpeed = this.settingsStore.inserterSpeed();
    const inserterIds = this.settingsStore.sortedInserterIds();
    let inserterId: string | undefined;
    for (const id of inserterIds) {
      if (data.itemRecord[id].quality) continue;
      inserterId = id;
      const speed = inserterSpeed[inserterId];
      if (speed.gte(items)) return inserterId;
    }

    return inserterId;
  });

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
