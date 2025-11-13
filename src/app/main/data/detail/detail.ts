import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import { Breadcrumb } from '~/components/breadcrumb/breadcrumb';
import { Icon } from '~/components/icon/icon';
import { Category } from '~/data/schema/category';
import { Item } from '~/data/schema/item';
import { Recipe } from '~/data/schema/recipe';
import { LinkOption } from '~/option/link-option';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

import { CategoryDetail } from './category-detail/category-detail';

export type DetailType = 'category' | 'item' | 'location' | 'recipe';
type DetailObject = Category | Item | Recipe;
type DetailRecordKey =
  | 'locationRecord'
  | 'categoryRecord'
  | 'itemRecord'
  | 'recipeRecord';

@Component({
  selector: 'lab-detail',
  imports: [Breadcrumb, Icon, TranslatePipe, CategoryDetail],
  templateUrl: './detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Detail {
  private readonly settingsStore = inject(SettingsStore);

  readonly id = input.required<string>();
  readonly collectionLabel = input.required<string>();
  readonly type = input.required<DetailType>();

  protected readonly recordKey = computed((): DetailRecordKey => {
    switch (this.type()) {
      case 'category':
        return 'categoryRecord';
      case 'location':
        return 'locationRecord';
      case 'recipe':
        return 'recipeRecord';
      default:
        return 'itemRecord';
    }
  });

  protected readonly obj = computed(
    (): DetailObject | undefined =>
      this.settingsStore.dataset()[this.recordKey()][this.id()],
  );
  protected readonly crumbs = computed(() => {
    const result: LinkOption[] = [
      { label: this.collectionLabel(), routerLink: '..' },
    ];
    const label = this.obj()?.name;
    if (label != null) result.push({ label });
    return result;
  });
}
