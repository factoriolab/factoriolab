import { ChangeDetectionStrategy, Component, computed } from '@angular/core';

import { CollectionTable } from '~/components/collection-table/collection-table';
import { Category } from '~/data/schema/category';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Detail } from '../detail/detail';
import { DetailBase } from '../detail-base';

@Component({
  selector: 'lab-category-detail',
  imports: [CollectionTable, TranslatePipe, Detail],
  templateUrl: './category-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryDetail extends DetailBase<Category> {
  protected readonly obj = computed(
    (): Category | undefined =>
      this.settingsStore.dataset().categoryRecord[this.id()],
  );

  protected readonly itemIds = computed(() => {
    const data = this.settingsStore.dataset();
    const id = this.id();
    return data.itemIds.filter((i) => data.itemRecord[i].category === id);
  });

  protected readonly recipeIds = computed(() => {
    const data = this.settingsStore.dataset();
    const id = this.id();
    return data.recipeIds.filter((i) => data.recipeRecord[i].category === id);
  });
}
