import { Routes } from '@angular/router';

import { canActivateId } from './guards/id.guard';
import { canActivateLanding } from './guards/landing.guard';
import { canActivateRatio } from './guards/ratio.guard';

export const routes: Routes = [
  {
    path: ':id',
    canActivate: [canActivateId],
    loadComponent: () =>
      import('./routes/id.component').then((c) => c.IdComponent),
    children: [
      {
        path: 'wizard',
        loadComponent: () =>
          import('./routes/wizard/wizard.component').then(
            (c) => c.WizardComponent,
          ),
      },
      {
        path: 'ratio',
        canActivate: [canActivateRatio],
        children: [],
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
    canActivate: [canActivateLanding],
    children: [],
  },
];
