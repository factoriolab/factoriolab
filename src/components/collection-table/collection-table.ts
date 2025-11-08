import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconType } from '~/data/icon-type';
import { Item } from '~/data/schema/item';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';

import { Icon } from '../icon/icon';
import { PagePipe } from '../paginator/page-pipe';
import { Paginator } from '../paginator/paginator';
import { PagingData } from '../paginator/paging-data';
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
  imports: [RouterLink, Icon, Paginator, PagePipe, TranslatePipe],
  templateUrl: './collection-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionTable {
  protected readonly settingsStore = inject(SettingsStore);

  readonly ids = input.required<string[]>();
  readonly iconType = input.required<IconType>();

  pagingData = signal<PagingData>({ page: 0, rows: 10 });

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
