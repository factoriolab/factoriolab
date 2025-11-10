import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconType } from '~/data/icon-type';
import { Item } from '~/data/schema/item';
import { SettingsStore } from '~/state/settings/settings-store';
import { TableStore } from '~/state/table/table-store';
import { coalesce } from '~/utils/nullish';

import { Icon } from '../icon/icon';
import { Paginator } from '../paginator/paginator';
import { PaginatorPipe } from '../paginator/paginator-pipe';
import { SortHeader } from '../sort-header/sort-header';
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
  imports: [RouterLink, Icon, Paginator, PaginatorPipe, SortHeader],
  templateUrl: './collection-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionTable implements OnDestroy {
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
    const result = this.ids()
      .map((i) => record[i])
      .map(
        (r): CollectionItem => ({
          id: r.id,
          name: r.name,
          category: data.categoryRecord[coalesce((r as Item).category, '')],
        }),
      );

    const sort = this.tableStore.sort();
    if (sort == null) return result;

    if (sort === 'category')
      result.sort((a, b) =>
        coalesce(b.category?.name, '').localeCompare(
          coalesce(a.category?.name, ''),
        ),
      );
    else result.sort((a, b) => b.name.localeCompare(a.name));

    if (this.tableStore.asc()) result.reverse();

    return result;
  });

  ngOnDestroy(): void {
    this.tableStore.reset();
  }
}
