import { NgModule } from '@angular/core';
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
    redirectTo: '/?s=&v=4',
  },
  {
    path: 'coi',
    redirectTo: '/?s=coi&v=4',
  },
  {
    path: 'dsp',
    redirectTo: '/?s=dsp&v=4',
  },
  {
    path: 'satisfactory',
    redirectTo: '/?s=sfy&v=4',
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      paramsInheritanceStrategy: 'always',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
