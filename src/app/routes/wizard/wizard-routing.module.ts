import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WizardComponent } from './wizard.component';

const routes: Routes = [
  {
    path: '',
    component: WizardComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WizardRoutingModule {}
