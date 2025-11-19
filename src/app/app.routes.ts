import { Routes } from '@angular/router';

import { errorGuard } from './error/error';
import { idGuard } from './id/id-guard';
import { landingGuard } from './landing/landing-guard';

export const routes: Routes = [
  {
    path: 'error',
    canActivate: [errorGuard],
    loadComponent: () => import('./error/error').then((c) => c.Error),
  },
  {
    path: ':id',
    canActivate: [idGuard],
    loadComponent: () => import('./id/id').then((c) => c.Id),
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [landingGuard],
        loadComponent: () => import('./landing/landing').then((c) => c.Landing),
      },
      {
        path: '',
        loadComponent: () => import('./main/main').then((c) => c.Main),
        loadChildren: () => import('./main/main.routes').then((m) => m.routes),
      },
    ],
  },
  {
    path: '**',
    canActivate: [landingGuard],
    children: [],
  },
];
