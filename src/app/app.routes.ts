import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { LandingGuard } from './guards';

export const routes: Routes = [
  {
    path: 'wizard',
    loadComponent: () =>
      import('./routes/wizard/wizard.component').then((c) => c.WizardComponent),
  },
  {
    path: '',
    pathMatch: 'full',
    canActivate: [LandingGuard],
    loadComponent: () =>
      import('./routes/landing/landing.component').then(
        (c) => c.LandingComponent
      ),
  },
  {
    path: '',
    loadChildren: () =>
      import('./routes/main/main.module').then((m) => m.MainModule),
  },
  {
    path: 'factorio',
    redirectTo: '/?s=&v=8',
  },
  {
    path: 'coi',
    redirectTo: '/?s=coi&v=8',
  },
  {
    path: 'dsp',
    redirectTo: '/?s=dsp&v=8',
  },
  {
    path: 'satisfactory',
    redirectTo: '/?s=sfy&v=8',
  },
  {
    path: 'final-factory',
    redirectTo: '/?s=ffy&v=8',
  },
  {
    path: '**',
    redirectTo: '',
  },
];

export const AppRoutingModule = RouterModule.forRoot(routes, {
  preloadingStrategy: PreloadAllModules,
  paramsInheritanceStrategy: 'always',
});
