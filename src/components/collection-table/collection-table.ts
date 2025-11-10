import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconType } from '~/data/icon-type';
import { Item } from '~/data/schema/item';
import { SettingsStore } from '~/state/settings/settings-store';
import { TableStore } from '~/state/table/table-store';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';

import { Icon } from '../icon/icon';
import { Paginator } from '../paginator/paginator';
import { PaginatorPipe } from '../paginator/paginator-pipe';
import { CollectionItem } from './collection-item';

type RecordKey =
  | 'categoryRecord'
  | 'itemRecord'
  | 'recipeRecord'
  | 'locationRecord';

const recordKey: Partial<Record<IconType, RecordKey>> = {
  category: 'categoryRecord',
  recipe: 'recipeRecord',
  location: 'locationRecord',
};

@Component({
  selector: 'lab-collection-table',
  imports: [RouterLink, Icon, Paginator, PaginatorPipe, TranslatePipe],
  templateUrl: './collection-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionTable {
  protected readonly settingsStore = inject(SettingsStore);
  protected readonly tableStore = inject(TableStore);

  readonly ids = input.required<string[]>();
  readonly iconType = input.required<IconType>();

  protected readonly hasCategory = computed(() => {
    const type = this.iconType();
    return type === 'item' || type === 'recipe';
  });

  protected readonly items = computed(() => {
    const data = this.settingsStore.dataset();
    const key = coalesce(recordKey[this.iconType()], 'itemRecord');
    const record = data[key];
    return this.ids()
      .map((i) => record[i])
      .map(
        (r): CollectionItem => ({
          id: r.id,
          name: r.name,
          category: data.categoryRecord[coalesce((r as Item).category, '')],
        }),
      );
  });
}
