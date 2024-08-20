import { Routes } from '@angular/router';

import { canActivateLanding } from './guards';

export const routes: Routes = [
  {
    path: ':id',
    children: [
      {
        path: 'wizard',
        loadComponent: () =>
          import('./routes/wizard/wizard.component').then(
            (c) => c.WizardComponent,
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        canActivate: [canActivateLanding],
        loadComponent: () =>
          import('./routes/landing/landing.component').then(
            (c) => c.LandingComponent,
          ),
      },
      {
        path: '',
        loadChildren: () =>
          import('./routes/main/main.routes').then((m) => m.routes),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '1.1',
  },
];
