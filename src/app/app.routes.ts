import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'wizard',
    loadChildren: () =>
      import('./routes/wizard/wizard.module').then((m) => m.WizardModule),
  },
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () =>
      import('./routes/landing/landing.module').then((m) => m.LandingModule),
  },
  {
    path: '',
    loadChildren: () =>
      import('./routes/main/main.module').then((m) => m.MainModule),
  },
  {
    path: 'factorio',
    redirectTo: '/?s=&v=6',
  },
  {
    path: 'coi',
    redirectTo: '/?s=coi&v=6',
  },
  {
    path: 'dsp',
    redirectTo: '/?s=dsp&v=6',
  },
  {
    path: 'satisfactory',
    redirectTo: '/?s=sfy&v=6',
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
