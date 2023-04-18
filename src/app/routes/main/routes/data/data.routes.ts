import { RouterModule } from '@angular/router';

import { DataComponent } from './data.component';
import { DataRoute } from './models';

export const routes: DataRoute[] = [
  {
    path: 'categories/:id',
    loadComponent: () =>
      import('./routes/category/category.component').then(
        (c) => c.CategoryComponent
      ),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./routes/collection/collection.component').then(
        (c) => c.CollectionComponent
      ),
    data: {
      label: 'data.categories',
      type: 'category',
      ids: 'categoryIds',
      entities: 'categoryEntities',
    },
  },
  {
    path: 'items/:id',
    loadComponent: () =>
      import('./routes/item/item.component').then((c) => c.ItemComponent),
  },
  {
    path: 'items',
    loadComponent: () =>
      import('./routes/collection/collection.component').then(
        (c) => c.CollectionComponent
      ),
    data: {
      label: 'data.items',
      type: 'item',
      ids: 'itemIds',
      entities: 'itemEntities',
    },
  },
  {
    path: 'recipes/:id',
    loadComponent: () =>
      import('./routes/recipe/recipe.component').then((c) => c.RecipeComponent),
  },
  {
    path: 'recipes',
    loadComponent: () =>
      import('./routes/collection/collection.component').then(
        (c) => c.CollectionComponent
      ),
    data: {
      label: 'data.recipes',
      type: 'recipe',
      ids: 'recipeIds',
      entities: 'recipeEntities',
    },
  },
  {
    path: '',
    pathMatch: 'full',
    component: DataComponent,
  },
];

export const DataRoutingModule = RouterModule.forChild(routes);
