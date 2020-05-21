import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HierarchyContainerComponent } from './hierarchy-container.component';

const routes: Routes = [
  {
    path: '**',
    component: HierarchyContainerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HierarchyRoutingModule {}
