import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'version',
    loadComponent: () => import('./version/version').then((c) => c.Version),
  },
  {
    path: 'flags',
    loadComponent: () => import('./flags/flags').then((c) => c.FlagsEditor),
  },
  {
    path: '**',
    redirectTo: 'version',
  },
];
