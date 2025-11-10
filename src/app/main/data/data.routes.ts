import { Route } from '@angular/router';

import { CollectionOption } from '~/components/collection-table/collection-option';

interface DetailData {
  collectionLabel: string;
}

type DataRoute = Route & { data?: CollectionOption | DetailData };

export const routes: DataRoute[] = [
  {
    path: 'categories/:id',
    loadComponent: () =>
      import('./category-data/category-data').then((c) => c.CategoryData),
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
      iconType: 'category',
      key: 'categoryIds',
    },
  },
  {
    path: 'items/:id',
    loadComponent: () =>
      import('./item-data/item-data').then((c) => c.ItemData),
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
      iconType: 'item',
      key: 'itemIds',
    },
  },
  {
    path: 'beacons/:id',
    loadComponent: () =>
      import('./item-data/item-data').then((c) => c.ItemData),
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
      iconType: 'item',
      key: 'beaconIds',
    },
  },
  {
    path: 'belts/:id',
    loadComponent: () =>
      import('./item-data/item-data').then((c) => c.ItemData),
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
      iconType: 'item',
      key: 'beltIds',
    },
  },
  {
    path: 'cargo-wagons/:id',
    loadComponent: () =>
      import('./item-data/item-data').then((c) => c.ItemData),
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
      iconType: 'item',
      key: 'cargoWagonIds',
    },
  },
  {
    path: 'fluid-wagons/:id',
    loadComponent: () =>
      import('./item-data/item-data').then((c) => c.ItemData),
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
      iconType: 'item',
      key: 'fluidWagonIds',
    },
  },
  {
    path: 'fuels/:id',
    loadComponent: () =>
      import('./item-data/item-data').then((c) => c.ItemData),
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
      iconType: 'item',
      key: 'fuelIds',
    },
  },
  {
    path: 'machines/:id',
    loadComponent: () =>
      import('./item-data/item-data').then((c) => c.ItemData),
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
      iconType: 'item',
      key: 'machineIds',
    },
  },
  {
    path: 'modules/:id',
    loadComponent: () =>
      import('./item-data/item-data').then((c) => c.ItemData),
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
      iconType: 'item',
      key: 'moduleIds',
    },
  },
  {
    path: 'pumps/:id',
    loadComponent: () =>
      import('./item-data/item-data').then((c) => c.ItemData),
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
      iconType: 'item',
      key: 'pipeIds',
    },
  },
  {
    path: 'technologies/:id',
    loadComponent: () =>
      import('./item-data/item-data').then((c) => c.ItemData),
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
      iconType: 'item',
      key: 'technologyIds',
    },
  },
  {
    path: 'recipes/:id',
    loadComponent: () =>
      import('./recipe-data/recipe-data').then((c) => c.RecipeData),
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
      iconType: 'recipe',
      key: 'recipeIds',
    },
  },
  {
    path: 'locations/:id',
    loadComponent: () =>
      import('./location-data/location-data').then((c) => c.LocationData),
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
      iconType: 'location',
      key: 'locationIds',
    },
  },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./data').then((c) => c.Data),
  },
];
