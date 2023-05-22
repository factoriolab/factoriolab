import { RouterModule, Routes } from '@angular/router';

import { LandingComponent } from './landing.component';
import { LandingGuard } from './landing.guard';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    canActivate: [LandingGuard],
  },
];

export const LandingRoutingModule = RouterModule.forChild(routes);
