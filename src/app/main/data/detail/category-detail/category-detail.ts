import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import { CollectionTable } from '~/components/collection-table/collection-table';
import { Category } from '~/data/schema/category';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

@Component({
  selector: 'lab-category-detail',
  imports: [CollectionTable, TranslatePipe],
  templateUrl: './category-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryDetail {
  private readonly settingsStore = inject(SettingsStore);

  readonly obj = input.required<Category>();

  protected readonly itemIds = computed(() => {
    const data = this.settingsStore.dataset();
    const id = this.obj().id;
    return data.itemIds.filter((i) => data.itemRecord[i].category === id);
  });

  protected readonly recipeIds = computed(() => {
    const data = this.settingsStore.dataset();
    const id = this.obj().id;
    return data.recipeIds.filter((i) => data.recipeRecord[i].category === id);
  });
}
