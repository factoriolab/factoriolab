import { RouterModule, Routes } from '@angular/router';

import { WizardComponent } from './wizard.component';

const routes: Routes = [
  {
    path: '',
    component: WizardComponent,
  },
];

export const WizardRoutingModule = RouterModule.forChild(routes);
