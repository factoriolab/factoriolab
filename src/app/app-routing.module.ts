import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'list',
    loadChildren: () =>
      import(
        './components/containers/list-container/list-container.module'
      ).then((m) => m.ListContainerModule),
  },
  {
    path: 'hierarchy',
    loadChildren: () =>
      import(
        './components/containers/hierarchy-container/hierarchy-container.module'
      ).then((m) => m.HierarchyContainerModule),
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
