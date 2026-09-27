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
      import('./category-detail/category-detail').then((c) => c.CategoryDetail),
    data: { collectionLabel: 'data.categories' },
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
      import('./item-detail/item-detail').then((c) => c.ItemDetail),
    data: { collectionLabel: 'data.items' },
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
      import('./item-detail/item-detail').then((c) => c.ItemDetail),
    data: { collectionLabel: 'data.beacons' },
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
      import('./item-detail/item-detail').then((c) => c.ItemDetail),
    data: { collectionLabel: 'data.belts' },
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
    path: 'fuels/:id',
    loadComponent: () =>
      import('./item-detail/item-detail').then((c) => c.ItemDetail),
    data: { collectionLabel: 'data.fuels' },
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
      import('./item-detail/item-detail').then((c) => c.ItemDetail),
    data: { collectionLabel: 'data.machines' },
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
      import('./item-detail/item-detail').then((c) => c.ItemDetail),
    data: { collectionLabel: 'data.modules' },
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
    path: 'technologies/:id',
    loadComponent: () =>
      import('./item-detail/item-detail').then((c) => c.ItemDetail),
    data: { collectionLabel: 'data.technologies' },
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
    path: 'inserters/:id',
    loadComponent: () =>
      import('./item-detail/item-detail').then((c) => c.ItemDetail),
    data: { collectionLabel: 'data.inserters' },
  },
  {
    path: 'inserters',
    loadComponent: () =>
      import('./collection/collection').then((c) => c.Collection),
    data: {
      label: 'data.inserters',
      iconType: 'item',
      key: 'inserterIds',
    },
  },
  {
    path: 'recipes/:id',
    loadComponent: () =>
      import('./recipe-detail/recipe-detail').then((c) => c.RecipeDetail),
    data: { collectionLabel: 'data.recipes' },
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
      import('./location-detail/location-detail').then((c) => c.LocationDetail),
    data: { collectionLabel: 'data.locations' },
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
    path: 'wagons/:id',
    loadComponent: () =>
      import('./item-detail/item-detail').then((c) => c.ItemDetail),
    data: { collectionLabel: 'data.wagons' },
  },
  {
    path: 'wagons',
    loadComponent: () =>
      import('./collection/collection').then((c) => c.Collection),
    data: {
      label: 'data.wagons',
      iconType: 'item',
      key: 'wagonIds',
    },
  },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./data').then((c) => c.Data),
  },
];
