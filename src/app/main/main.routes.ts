import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'list',
    loadComponent: () => import('./list/list').then((c) => c.List),
  },
  {
    path: 'flow',
    loadComponent: () => import('./flow/flow').then((c) => c.Flow),
  },
  {
    path: 'data',
    loadComponent: () => import('./data/data').then((c) => c.Data),
  },
];
