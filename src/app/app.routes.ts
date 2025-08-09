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
        path: 'wizard',
        loadComponent: () => import('./wizard/wizard').then((c) => c.Wizard),
      },
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
        loadComponent: () => import('./main/main').then((m) => m.Main),
      },
    ],
  },
  {
    path: '**',
    canActivate: [landingGuard],
    children: [],
  },
];
