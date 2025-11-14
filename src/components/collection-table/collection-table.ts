import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

import { IconType } from '~/data/icon-type';
import { Item } from '~/data/schema/item';
import { SettingsStore } from '~/state/settings/settings-store';
import { initialTableState, resetTableParams } from '~/state/table/table-state';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';
import { updateApply } from '~/utils/signal';

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
  imports: [
    FormsModule,
    RouterLink,
    FaIconComponent,
    Icon,
    Paginator,
    PaginatorPipe,
    SortHeader,
    TranslatePipe,
  ],
  templateUrl: './collection-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionTable {
  protected readonly settingsStore = inject(SettingsStore);

  readonly ids = input.required<string[]>();
  readonly iconType = input.required<IconType>();
  readonly state = model(initialTableState);

  protected readonly faMagnifyingGlass = faMagnifyingGlass;
  protected readonly resetTableParams = resetTableParams;
  protected readonly updateApply = updateApply;

  protected readonly hasCategory = computed(() => {
    const type = this.iconType();
    return type === 'item' || type === 'recipe';
  });

  protected readonly items = computed(() => {
    const data = this.settingsStore.dataset();
    const key = coalesce(recordKey[this.iconType()], 'itemRecord');
    const record = data[key];
    let result = this.ids()
      .map((i) => record[i])
      .map(
        (r): CollectionItem => ({
          id: r.id,
          name: r.name,
          category: data.categoryRecord[coalesce((r as Item).category, '')],
        }),
      );

    const state = this.state();
    const filter = state.filter?.toLowerCase();
    if (filter)
      result = result.filter((e) => e.name.toLowerCase().includes(filter));

    if (state.sort == null) return result;

    if (state.sort === 'category')
      result.sort((a, b) =>
        coalesce(b.category?.name, '').localeCompare(
          coalesce(a.category?.name, ''),
        ),
      );
    else result.sort((a, b) => b.name.localeCompare(a.name));

    if (state.asc) result.reverse();

    return result;
  });
}
