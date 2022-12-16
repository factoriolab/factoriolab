import { RouterModule, Routes } from '@angular/router';

import { LandingComponent } from './landing.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
];

export const LandingRoutingModule = RouterModule.forChild(routes);
