import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ErrorComponent } from './error.component';
import { ErrorModule } from './error.module';

const routes: Routes = [
  {
    path: '',
    component: ErrorComponent,
  },
];

export const ErrorRouting: ModuleWithProviders<ErrorModule> =
  RouterModule.forChild(routes);
