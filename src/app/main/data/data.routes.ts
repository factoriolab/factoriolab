import { Route } from '@angular/router';

import { CollectionOption } from '~/components/collection-table/collection-option';

import { DetailType } from './detail/detail';

interface DetailData {
  collectionLabel: string;
  type: DetailType;
}

type DataRoute = Route & { data?: CollectionOption | DetailData };

export const routes: DataRoute[] = [
  {
    path: 'categories/:id',
    loadComponent: () => import('./detail/detail').then((c) => c.Detail),
    data: {
      collectionLabel: 'data.categories',
      type: 'category',
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
    loadComponent: () => import('./detail/detail').then((c) => c.Detail),
    data: {
      collectionLabel: 'data.items',
      type: 'item',
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
    loadComponent: () => import('./detail/detail').then((c) => c.Detail),
    data: {
      collectionLabel: 'data.beacons',
      type: 'item',
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
    loadComponent: () => import('./detail/detail').then((c) => c.Detail),
    data: {
      collectionLabel: 'data.belts',
      type: 'item',
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
    loadComponent: () => import('./detail/detail').then((c) => c.Detail),
    data: {
      collectionLabel: 'data.cargoWagons',
      type: 'item',
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
    loadComponent: () => import('./detail/detail').then((c) => c.Detail),
    data: {
      collectionLabel: 'data.fluidWagons',
      type: 'item',
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
    loadComponent: () => import('./detail/detail').then((c) => c.Detail),
    data: {
      collectionLabel: 'data.fuels',
      type: 'item',
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
    loadComponent: () => import('./detail/detail').then((c) => c.Detail),
    data: {
      collectionLabel: 'data.machines',
      type: 'item',
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
    loadComponent: () => import('./detail/detail').then((c) => c.Detail),
    data: {
      collectionLabel: 'data.modules',
      type: 'item',
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
    loadComponent: () => import('./detail/detail').then((c) => c.Detail),
    data: {
      collectionLabel: 'data.pumps',
      type: 'item',
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
    loadComponent: () => import('./detail/detail').then((c) => c.Detail),
    data: {
      collectionLabel: 'data.technologies',
      type: 'item',
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
    loadComponent: () => import('./detail/detail').then((c) => c.Detail),
    data: {
      collectionLabel: 'data.recipes',
      type: 'recipe',
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
    loadComponent: () => import('./detail/detail').then((c) => c.Detail),
    data: {
      collectionLabel: 'data.locations',
      type: 'location',
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
