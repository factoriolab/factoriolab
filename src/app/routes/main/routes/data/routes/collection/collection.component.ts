import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { combineLatest, map } from 'rxjs';

import { AppSharedModule } from '~/app-shared.module';
import { Category, Dataset, Entities, Item, Recipe } from '~/models';
import { LabState, Settings } from '~/store';
import { DataRouteService } from '../../data-route.service';
import { Collection } from '../../models';

interface CollectionItem {
  id: string;
  name: string;
  category?: Category;
}

type Entity = Category | Item | Recipe;

@Component({
  standalone: true,
  imports: [CommonModule, AppSharedModule],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionComponent {
  collection$ = this.route.data.pipe(map((data) => data as Collection));
  breadcrumb$ = this.collection$.pipe(
    map((data): MenuItem[] => [
      {
        label: this.translateSvc.instant(data.label),
      },
    ])
  );
  vm$ = combineLatest([
    this.collection$,
    this.breadcrumb$,
    this.dataRouteSvc.home$,
    this.store.select(Settings.getOptions),
    this.store.select(Settings.getDataset),
  ]).pipe(
    map(([collection, breadcrumb, home, options, data]) => ({
      collection,
      breadcrumb,
      value: this.getValue(collection, data),
      home,
      options,
      data,
    }))
  );

  rowsPerPageOptions = [10, 25, 50, 100, 500, 1000];

  constructor(
    private route: ActivatedRoute,
    private translateSvc: TranslateService,
    private store: Store<LabState>,
    private dataRouteSvc: DataRouteService
  ) {}

  getValue(collection: Collection, data: Dataset): CollectionItem[] {
    const ids = data[collection.ids] as string[];
    let entities: Entities<Entity>;
    switch (collection.type) {
      case 'category':
        entities = data.categoryEntities;
        break;
      case 'item':
        entities = data.itemEntities;
        break;
      case 'recipe':
        entities = data.recipeEntities;
    }

    return ids.map((i) => {
      const entity = entities[i];
      const obj: CollectionItem = {
        id: entity.id,
        name: entity.name,
      };

      if (collection.type !== 'category') {
        obj.category =
          data.categoryEntities[(entity as Item | Recipe).category];
      }

      return obj;
    });
  }
}
