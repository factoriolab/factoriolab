import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainComponent } from './main.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'list',
        loadChildren: () =>
          import('./routes/list/list.module').then((c) => c.ListModule),
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
        redirectTo: '/landing?s=sfy&v=4',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
