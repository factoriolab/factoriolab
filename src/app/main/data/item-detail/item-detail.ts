import { ChangeDetectionStrategy, Component, computed } from '@angular/core';

import { Item } from '~/data/schema/item';

import { Detail } from '../detail/detail';
import { DetailBase } from '../detail-base';

@Component({
  selector: 'lab-item-detail',
  imports: [Detail],
  templateUrl: './item-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemDetail extends DetailBase<Item> {
  protected readonly obj = computed(
    (): Item | undefined => this.settingsStore.dataset().itemRecord[this.id()],
  );
}
