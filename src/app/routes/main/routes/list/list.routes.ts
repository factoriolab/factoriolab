import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from './list.component';

const routes: Routes = [
  {
    path: '',
    component: ListComponent,
  },
];

export const ListRoutingModule = RouterModule.forChild(routes);
