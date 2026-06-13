import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowRightLong,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';

import { Icon } from '~/components/icon/icon';
import { Select } from '~/components/select/select';
import { Tooltip } from '~/components/tooltip/tooltip';
import { Rational, rational } from '~/rational/rational';
import { StepDetailRow } from '~/state/objectives/step-detail-row';
import { RecipesStore } from '~/state/recipes/recipes-store';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

import { RatePipe } from '../pipes/rate-pipe';
import { PercentPadPipe } from './percent-pad-pipe';

@Component({
  selector: 'tr[labDetailRow], tr[lab-detail-row]',
  exportAs: 'labDetailRow',
  imports: [
    FormsModule,
    FaIconComponent,
    Icon,
    Select,
    Tooltip,
    TranslatePipe,
    RatePipe,
    PercentPadPipe,
  ],
  templateUrl: './detail-row.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: '*:bg-gray-950/75' },
})
export class DetailRow {
  private readonly recipesStore = inject(RecipesStore);
  protected readonly settingsStore = inject(SettingsStore);

  readonly value = input.required<StepDetailRow>();
  readonly leftSpan = input.required<number>();
  readonly factor = input<Rational>(rational.one);

  protected readonly items = computed(() =>
    this.value().items?.div(this.factor()),
  );

  protected readonly inserterId = linkedSignal(() => {
    const data = this.data();
    const value = this.value();
    const items = this.items();
    /**
     * Verify data includes inserters, step includes items, and item is not a
     * fluid
     */
    if (
      data.inserterIds.length === 0 ||
      items == null ||
      value.itemId == null ||
      data.itemRecord[value.itemId].stack == null
    )
      return undefined;

    const inserterSpeed = this.recipesStore.inserterSpeed();
    let inserterId: string | undefined;
    for (const [id, speed] of Object.entries(inserterSpeed)) {
      if (data.itemRecord[id].quality) continue;
      inserterId = id;
      if (speed.gte(items)) return inserterId;
    }

    return inserterId;
  });

  protected readonly inserterCount = computed(() => {
    const inserterId = this.inserterId();
    const items = this.items();
    if (items == null || inserterId == null) return undefined;

    const inserterSpeed = this.recipesStore.inserterSpeed();
    const speed = inserterSpeed[inserterId];
    return items.div(speed);
  });

  protected readonly cols = this.settingsStore.columnsState;
  protected readonly data = this.settingsStore.dataset;
  protected readonly faArrowRightLong = faArrowRightLong;
  protected readonly faInfoCircle = faInfoCircle;
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
