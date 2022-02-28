import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  ListContainerComponent,
  FlowComponent,
  MatrixContainerComponent,
} from './components';

const routes: Routes = [
  {
    path: 'list',
    component: ListContainerComponent,
  },
  {
    path: 'flow',
    component: FlowComponent,
  },
  {
    path: 'matrix',
    component: MatrixContainerComponent,
  },
  {
    path: 'factorio',
    redirectTo: '/list?s=&v=1',
  },
  {
    path: 'dsp',
    redirectTo: '/list?s=dsp&v=1',
  },
  {
    path: 'satisfactory',
    redirectTo: '/list?s=sfy&v=1',
  },
  {
    path: '**',
    redirectTo: 'list',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
