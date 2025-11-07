import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('~/components/steps/steps').then((c) => c.Steps),
  },
  {
    path: 'flow',
    loadComponent: () => import('./flow/flow').then((c) => c.Flow),
  },
  {
    path: 'data',
    loadChildren: () => import('./data/data.routes').then((m) => m.routes),
  },
];
