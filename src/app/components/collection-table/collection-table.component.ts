import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';

import { PagedTableDirective } from '~/directives';
import {
  Category,
  CollectionItem,
  Entities,
  IdType,
  Item,
  RecipeJson,
} from '~/models';
import { IconSmClassPipe, TranslatePipe } from '~/pipes';
import { Settings } from '~/store';

type Entity = Category | Item | RecipeJson;

@Component({
  selector: 'lab-collection-table',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    ButtonModule,
    MultiSelectModule,
    TableModule,
    IconSmClassPipe,
    PagedTableDirective,
    TranslatePipe,
  ],
  templateUrl: './collection-table.component.html',
  styleUrls: ['./collection-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionTableComponent {
  store = inject(Store);

  ids = input.required<string[]>();
  type = input.required<IdType>();
  useRelativePath = input(false);

  options = this.store.selectSignal(Settings.selectOptions);
  data = this.store.selectSignal(Settings.selectDataset);

  route = computed(() => {
    const type = this.type();
    const useRelativePath = this.useRelativePath();

    if (useRelativePath) return '';

    switch (type) {
      case 'category':
        return '/data/categories/';
      case 'item':
        return '/data/items/';
      case 'recipe':
        return '/data/recipes/';
    }
  });

  value = computed((): CollectionItem[] => {
    const ids = this.ids();
    const type = this.type();
    const data = this.data();

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
            data.categoryEntities[(entity as Item | RecipeJson).category];
        }

        return obj;
      });
  });
}
