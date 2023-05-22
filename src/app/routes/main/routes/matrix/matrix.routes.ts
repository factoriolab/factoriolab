import { RouterModule, Routes } from '@angular/router';

import { MatrixComponent } from './matrix.component';

const routes: Routes = [
  {
    path: '',
    component: MatrixComponent,
  },
];

export const MatrixRoutingModule = RouterModule.forChild(routes);
