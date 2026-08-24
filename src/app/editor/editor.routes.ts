import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'version',
    loadComponent: () => import('./version/version').then((c) => c.Version),
  },
  {
    path: 'flags',
    loadComponent: () => import('./flags/flags').then((c) => c.Flags),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./categories/categories').then((c) => c.Categories),
  },
  {
    path: 'icons',
    loadComponent: () => import('./icons/icons').then((c) => c.Icons),
  },
  {
    path: 'items',
    loadComponent: () => import('./items/items').then((c) => c.Items),
  },
  {
    path: 'recipes',
    loadComponent: () => import('./recipes/recipes').then((c) => c.Recipes),
  },
  {
    path: 'limitations',
    loadComponent: () =>
      import('./limitations/limitations').then((c) => c.Limitations),
  },
  {
    path: 'locations',
    loadComponent: () =>
      import('./locations/locations').then((c) => c.Locations),
  },
  {
    path: 'qualities',
    loadComponent: () =>
      import('./qualities/qualities').then((c) => c.Qualities),
  },
  {
    path: '**',
    redirectTo: 'version',
  },
];
