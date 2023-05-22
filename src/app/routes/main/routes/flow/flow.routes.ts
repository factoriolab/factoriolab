import { RouterModule, Routes } from '@angular/router';

import { FlowComponent } from './flow.component';

const routes: Routes = [
  {
    path: '',
    component: FlowComponent,
  },
];

export const FlowRoutingModule = RouterModule.forChild(routes);
