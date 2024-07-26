import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppSharedModule } from '~/app-shared.module';
import { DataComponent } from './data.component';
import { routes } from './data.routes';

export const DataRoutingModule = RouterModule.forChild(routes);
@NgModule({
  imports: [AppSharedModule, DataRoutingModule],
  declarations: [DataComponent],
})
export class DataModule {}
