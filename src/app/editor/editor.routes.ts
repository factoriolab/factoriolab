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
    path: '**',
    redirectTo: 'version',
  },
];
