import { Routes } from '@angular/router';

import { idGuard } from './id-guard';
import { landingGuard } from './landing/landing-guard';
import { ratioGuard } from './ratio-guard';

export const routes: Routes = [
  {
    path: ':id',
    canActivate: [idGuard],
    children: [
      {
        path: 'ratio',
        canActivate: [ratioGuard],
        children: [],
      },
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
