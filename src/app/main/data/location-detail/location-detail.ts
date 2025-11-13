import { ChangeDetectionStrategy, Component, computed } from '@angular/core';

import { Category } from '~/data/schema/category';

import { Detail } from '../detail/detail';
import { DetailBase } from '../detail-base';

@Component({
  selector: 'lab-location-detail',
  imports: [Detail],
  templateUrl: './location-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationDetail extends DetailBase<Category> {
  protected readonly obj = computed(
    (): Category | undefined =>
      this.settingsStore.dataset().locationRecord[this.id()],
  );
}
