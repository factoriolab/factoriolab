import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListContainerComponent, FlowContainerComponent } from './components';

const routes: Routes = [
  {
    path: 'list',
    component: ListContainerComponent,
  },
  {
    path: 'flow',
    component: FlowContainerComponent,
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
