import { KeyValue, KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Icon } from '~/components/icon/icon';
import { Tooltip } from '~/components/tooltip/tooltip';
import { TotalValue } from '~/state/objectives/total-value';

@Component({
  selector: 'td[labTotalCell], td[lab-total-cell]',
  exportAs: 'labTotalCell',
  imports: [Icon, KeyValuePipe, Tooltip],
  templateUrl: './total-cell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotalCell {
  readonly value = input.required<Record<string, TotalValue>>();

  sortByValue(
    a: KeyValue<string, TotalValue>,
    b: KeyValue<string, TotalValue>,
  ): number {
    return b.value.total.sub(a.value.total).toNumber();
  }
}
