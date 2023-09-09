import { RouterModule } from '@angular/router';

import { DataComponent } from './data.component';
import { DataRoute } from './models';

export const routes: DataRoute[] = [
  {
    path: 'categories/:id',
    loadComponent: () =>
      import('./routes/category/category.component').then(
        (c) => c.CategoryComponent,
      ),
    data: {
      collectionLabel: 'data.categories',
    },
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./routes/collection/collection.component').then(
        (c) => c.CollectionComponent,
      ),
    data: {
      label: 'data.categories',
      type: 'category',
      ids: 'categoryIds',
    },
  },
  {
    path: 'items/:id',
    loadComponent: () =>
      import('./routes/item/item.component').then((c) => c.ItemComponent),
    data: {
      collectionLabel: 'data.items',
    },
  },
  {
    path: 'items',
    loadComponent: () =>
      import('./routes/collection/collection.component').then(
        (c) => c.CollectionComponent,
      ),
    data: {
      label: 'data.items',
      type: 'item',
      ids: 'itemIds',
    },
  },
  {
    path: 'beacons/:id',
    loadComponent: () =>
      import('./routes/item/item.component').then((c) => c.ItemComponent),
    data: {
      collectionLabel: 'data.beacons',
    },
  },
  {
    path: 'beacons',
    loadComponent: () =>
      import('./routes/collection/collection.component').then(
        (c) => c.CollectionComponent,
      ),
    data: {
      label: 'data.beacons',
      type: 'item',
      ids: 'beaconIds',
    },
  },
  {
    path: 'belts/:id',
    loadComponent: () =>
      import('./routes/item/item.component').then((c) => c.ItemComponent),
    data: {
      collectionLabel: 'data.belts',
    },
  },
  {
    path: 'belts',
    loadComponent: () =>
      import('./routes/collection/collection.component').then(
        (c) => c.CollectionComponent,
      ),
    data: {
      label: 'data.belts',
      type: 'item',
      ids: 'beltIds',
    },
  },
  {
    path: 'cargo-wagons/:id',
    loadComponent: () =>
      import('./routes/item/item.component').then((c) => c.ItemComponent),
    data: {
      collectionLabel: 'data.cargoWagons',
    },
  },
  {
    path: 'cargo-wagons',
    loadComponent: () =>
      import('./routes/collection/collection.component').then(
        (c) => c.CollectionComponent,
      ),
    data: {
      label: 'data.cargoWagons',
      type: 'item',
      ids: 'cargoWagonIds',
    },
  },
  {
    path: 'fluid-wagons/:id',
    loadComponent: () =>
      import('./routes/item/item.component').then((c) => c.ItemComponent),
    data: {
      collectionLabel: 'data.fluidWagons',
    },
  },
  {
    path: 'fluid-wagons',
    loadComponent: () =>
      import('./routes/collection/collection.component').then(
        (c) => c.CollectionComponent,
      ),
    data: {
      label: 'data.fluidWagons',
      type: 'item',
      ids: 'fluidWagonIds',
    },
  },
  {
    path: 'fuels/:id',
    loadComponent: () =>
      import('./routes/item/item.component').then((c) => c.ItemComponent),
    data: {
      collectionLabel: 'data.fuels',
    },
  },
  {
    path: 'fuels',
    loadComponent: () =>
      import('./routes/collection/collection.component').then(
        (c) => c.CollectionComponent,
      ),
    data: {
      label: 'data.fuels',
      type: 'item',
      ids: 'fuelIds',
    },
  },
  {
    path: 'machines/:id',
    loadComponent: () =>
      import('./routes/item/item.component').then((c) => c.ItemComponent),
    data: {
      collectionLabel: 'data.machines',
    },
  },
  {
    path: 'machines',
    loadComponent: () =>
      import('./routes/collection/collection.component').then(
        (c) => c.CollectionComponent,
      ),
    data: {
      label: 'data.machines',
      type: 'item',
      ids: 'machineIds',
    },
  },
  {
    path: 'modules/:id',
    loadComponent: () =>
      import('./routes/item/item.component').then((c) => c.ItemComponent),
    data: {
      collectionLabel: 'data.modules',
    },
  },
  {
    path: 'modules',
    loadComponent: () =>
      import('./routes/collection/collection.component').then(
        (c) => c.CollectionComponent,
      ),
    data: {
      label: 'data.modules',
      type: 'item',
      ids: 'moduleIds',
    },
  },
  {
    path: 'pipes/:id',
    loadComponent: () =>
      import('./routes/item/item.component').then((c) => c.ItemComponent),
    data: {
      collectionLabel: 'data.pipes',
    },
  },
  {
    path: 'pipes',
    loadComponent: () =>
      import('./routes/collection/collection.component').then(
        (c) => c.CollectionComponent,
      ),
    data: {
      label: 'data.pipes',
      type: 'item',
      ids: 'pipeIds',
    },
  },
  {
    path: 'technologies/:id',
    loadComponent: () =>
      import('./routes/item/item.component').then((c) => c.ItemComponent),
    data: {
      collectionLabel: 'data.technologies',
    },
  },
  {
    path: 'technologies',
    loadComponent: () =>
      import('./routes/collection/collection.component').then(
        (c) => c.CollectionComponent,
      ),
    data: {
      label: 'data.technologies',
      type: 'item',
      ids: 'technologyIds',
    },
  },
  {
    path: 'recipes/:id',
    loadComponent: () =>
      import('./routes/recipe/recipe.component').then((c) => c.RecipeComponent),
    data: {
      collectionLabel: 'data.recipes',
    },
  },
  {
    path: 'recipes',
    loadComponent: () =>
      import('./routes/collection/collection.component').then(
        (c) => c.CollectionComponent,
      ),
    data: {
      label: 'data.recipes',
      type: 'recipe',
      ids: 'recipeIds',
    },
  },
  {
    path: '',
    pathMatch: 'full',
    component: DataComponent,
  },
];

export const DataRoutingModule = RouterModule.forChild(routes);
