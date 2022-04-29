import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FlowComponent, ListComponent, MatrixComponent } from './routes';

const routes: Routes = [
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
