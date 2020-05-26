import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  ListContainerComponent,
  HierarchyContainerComponent,
} from './components';

const routes: Routes = [
  {
    path: 'list',
    component: ListContainerComponent,
  },
  {
    path: 'hierarchy',
    component: HierarchyContainerComponent,
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
