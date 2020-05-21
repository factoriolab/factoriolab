import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListContainerComponent } from './list-container.component';

const routes: Routes = [
  {
    path: '**',
    component: ListContainerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListRoutingModule {}
