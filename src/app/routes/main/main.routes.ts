import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainComponent } from './main.component';
import { MainModule } from './main.module';
import { FlowComponent } from './routes/flow/flow.component';
import { ListComponent } from './routes/list/list.component';
import { MatrixComponent } from './routes/matrix/matrix.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'list',
        component: ListComponent,
      },
      {
        path: 'flow',
        component: FlowComponent,
      },
      {
        path: 'matrix',
        component: MatrixComponent,
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
    ],
  },
];

export const MainRouting: ModuleWithProviders<MainModule> =
  RouterModule.forChild(routes);
