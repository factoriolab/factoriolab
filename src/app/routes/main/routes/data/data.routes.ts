import { DataRoute } from './models/data-route';

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
      key: 'categoryIds',
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
      key: 'itemIds',
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
      key: 'beaconIds',
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
      key: 'beltIds',
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
      key: 'cargoWagonIds',
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
      key: 'fluidWagonIds',
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
      key: 'fuelIds',
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
      key: 'machineIds',
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
      key: 'moduleIds',
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
      key: 'pipeIds',
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
      key: 'technologyIds',
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
      key: 'recipeIds',
    },
  },
  {
    path: 'locations/:id',
    loadComponent: () =>
      import('./routes/location/location.component').then(
        (c) => c.LocationComponent,
      ),
    data: {
      collectionLabel: 'data.locations',
    },
  },
  {
    path: 'locations',
    loadComponent: () =>
      import('./routes/collection/collection.component').then(
        (c) => c.CollectionComponent,
      ),
    data: {
      label: 'data.locations',
      type: 'location',
      key: 'locationIds',
    },
  },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./data.component').then((c) => c.DataComponent),
  },
];
