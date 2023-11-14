import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map, ReplaySubject } from 'rxjs';

import { Category, Entities, IdType, Item, RawDataset, Recipe } from '~/models';
import { LabState, Settings } from '~/store';
import { CollectionItem } from '../../models';

type Entity = Category | Item | Recipe;

@Component({
  selector: 'lab-collection-table',
  templateUrl: './collection-table.component.html',
  styleUrls: ['./collection-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionTableComponent {
  store = inject(Store<LabState>);

  @Input() set ids(value: string[]) {
    this.ids$.next(value);
  }
  @Input() set type(value: IdType) {
    this.type$.next(value);
  }
  @Input() useRelativePath = false;

  ids$ = new ReplaySubject<string[]>();
  type$ = new ReplaySubject<IdType>();
  vm$ = combineLatest([
    this.ids$,
    this.type$,
    this.store.select(Settings.getOptions),
    this.store.select(Settings.getDataset),
  ]).pipe(
    map(([ids, type, options, data]) => ({
      type,
      value: this.getValue(ids, type, data),
      route: this.getCollectionRoute(type),
      options,
    })),
  );

  getCollectionRoute(type: IdType): string {
    if (this.useRelativePath) return '';

    switch (type) {
      case 'category':
        return '/data/categories/';
      case 'item':
        return '/data/items/';
      case 'recipe':
        return '/data/recipes/';
    }
  }

  getValue(ids: string[], type: IdType, data: RawDataset): CollectionItem[] {
    if (ids == null) return [];

    let entities: Entities<Entity>;
    switch (type) {
      case 'category':
        entities = data.categoryEntities;
        break;
      case 'item':
        entities = data.itemEntities;
        break;
      case 'recipe':
        entities = data.recipeEntities;
    }

    return ids
      .filter((i) => entities[i])
      .map((i) => {
        const entity = entities[i];
        const obj: CollectionItem = {
          id: entity.id,
          name: entity.name,
        };

        if (type !== 'category') {
          obj.category =
            data.categoryEntities[(entity as Item | Recipe).category];
        }

        return obj;
      });
  }
}
