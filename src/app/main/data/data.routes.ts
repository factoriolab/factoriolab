import { Route } from '@angular/router';

export const routes: Route[] = [
  {
    path: 'categories/:id',
    loadComponent: () => import('./category/category').then((c) => c.Category),
    data: {
      collectionLabel: 'data.categories',
    },
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./collection/collection').then((c) => c.Collection),
    data: {
      label: 'data.categories',
      type: 'category',
      key: 'categoryIds',
    },
  },
  {
    path: 'items/:id',
    loadComponent: () => import('./item/item').then((c) => c.Item),
    data: {
      collectionLabel: 'data.items',
    },
  },
  {
    path: 'items',
    loadComponent: () =>
      import('./collection/collection').then((c) => c.Collection),
    data: {
      label: 'data.items',
      type: 'item',
      key: 'itemIds',
    },
  },
  {
    path: 'beacons/:id',
    loadComponent: () => import('./item/item').then((c) => c.Item),
    data: {
      collectionLabel: 'data.beacons',
    },
  },
  {
    path: 'beacons',
    loadComponent: () =>
      import('./collection/collection').then((c) => c.Collection),
    data: {
      label: 'data.beacons',
      type: 'item',
      key: 'beaconIds',
    },
  },
  {
    path: 'belts/:id',
    loadComponent: () => import('./item/item').then((c) => c.Item),
    data: {
      collectionLabel: 'data.belts',
    },
  },
  {
    path: 'belts',
    loadComponent: () =>
      import('./collection/collection').then((c) => c.Collection),
    data: {
      label: 'data.belts',
      type: 'item',
      key: 'beltIds',
    },
  },
  {
    path: 'cargo-wagons/:id',
    loadComponent: () => import('./item/item').then((c) => c.Item),
    data: {
      collectionLabel: 'data.cargoWagons',
    },
  },
  {
    path: 'cargo-wagons',
    loadComponent: () =>
      import('./collection/collection').then((c) => c.Collection),
    data: {
      label: 'data.cargoWagons',
      type: 'item',
      key: 'cargoWagonIds',
    },
  },
  {
    path: 'fluid-wagons/:id',
    loadComponent: () => import('./item/item').then((c) => c.Item),
    data: {
      collectionLabel: 'data.fluidWagons',
    },
  },
  {
    path: 'fluid-wagons',
    loadComponent: () =>
      import('./collection/collection').then((c) => c.Collection),
    data: {
      label: 'data.fluidWagons',
      type: 'item',
      key: 'fluidWagonIds',
    },
  },
  {
    path: 'fuels/:id',
    loadComponent: () => import('./item/item').then((c) => c.Item),
    data: {
      collectionLabel: 'data.fuels',
    },
  },
  {
    path: 'fuels',
    loadComponent: () =>
      import('./collection/collection').then((c) => c.Collection),
    data: {
      label: 'data.fuels',
      type: 'item',
      key: 'fuelIds',
    },
  },
  {
    path: 'machines/:id',
    loadComponent: () => import('./item/item').then((c) => c.Item),
    data: {
      collectionLabel: 'data.machines',
    },
  },
  {
    path: 'machines',
    loadComponent: () =>
      import('./collection/collection').then((c) => c.Collection),
    data: {
      label: 'data.machines',
      type: 'item',
      key: 'machineIds',
    },
  },
  {
    path: 'modules/:id',
    loadComponent: () => import('./item/item').then((c) => c.Item),
    data: {
      collectionLabel: 'data.modules',
    },
  },
  {
    path: 'modules',
    loadComponent: () =>
      import('./collection/collection').then((c) => c.Collection),
    data: {
      label: 'data.modules',
      type: 'item',
      key: 'moduleIds',
    },
  },
  {
    path: 'pumps/:id',
    loadComponent: () => import('./item/item').then((c) => c.Item),
    data: {
      collectionLabel: 'data.pumps',
    },
  },
  {
    path: 'pumps',
    loadComponent: () =>
      import('./collection/collection').then((c) => c.Collection),
    data: {
      label: 'data.pumps',
      type: 'item',
      key: 'pipeIds',
    },
  },
  {
    path: 'technologies/:id',
    loadComponent: () => import('./item/item').then((c) => c.Item),
    data: {
      collectionLabel: 'data.technologies',
    },
  },
  {
    path: 'technologies',
    loadComponent: () =>
      import('./collection/collection').then((c) => c.Collection),
    data: {
      label: 'data.technologies',
      type: 'item',
      key: 'technologyIds',
    },
  },
  {
    path: 'recipes/:id',
    loadComponent: () => import('./recipe/recipe').then((c) => c.Recipe),
    data: {
      collectionLabel: 'data.recipes',
    },
  },
  {
    path: 'recipes',
    loadComponent: () =>
      import('./collection/collection').then((c) => c.Collection),
    data: {
      label: 'data.recipes',
      type: 'recipe',
      key: 'recipeIds',
    },
  },
  {
    path: 'locations/:id',
    loadComponent: () => import('./location/location').then((c) => c.Location),
    data: {
      collectionLabel: 'data.locations',
    },
  },
  {
    path: 'locations',
    loadComponent: () =>
      import('./collection/collection').then((c) => c.Collection),
    data: {
      label: 'data.locations',
      type: 'location',
      key: 'locationIds',
    },
  },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./data').then((c) => c.Data),
  },
];
