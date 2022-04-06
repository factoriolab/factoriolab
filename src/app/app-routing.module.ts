import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MatrixContainerComponent } from './components';
import { FlowComponent, ListComponent } from './routes';

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
