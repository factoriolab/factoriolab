import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  ListContainerComponent,
  DiagramContainerComponent,
} from './components';

const routes: Routes = [
  {
    path: 'list',
    component: ListContainerComponent,
  },
  {
    path: 'diagram',
    component: DiagramContainerComponent,
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
