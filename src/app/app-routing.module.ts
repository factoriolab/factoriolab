import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'list',
    loadChildren: () =>
      import('./routes/list/list.module').then((m) => m.ListModule),
  },
  {
    path: 'flow',
    loadChildren: () =>
      import('./routes/flow/flow.module').then((m) => m.FlowModule),
  },
  {
    path: 'matrix',
    loadChildren: () =>
      import('./routes/matrix/matrix.module').then((m) => m.MatrixModule),
  },
  {
    path: 'factorio',
    redirectTo: '/list?s=&v=4',
  },
  {
    path: 'coi',
    redirectTo: '/list?s=coi&v=4',
  },
  {
    path: 'dsp',
    redirectTo: '/list?s=dsp&v=4',
  },
  {
    path: 'satisfactory',
    redirectTo: '/list?s=sfy&v=4',
  },
  {
    path: '**',
    redirectTo: 'list',
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
