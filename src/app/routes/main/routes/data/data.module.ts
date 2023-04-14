import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppSharedModule } from '~/app-shared.module';
import { DataComponent } from './data.component';
import { DataRoutingModule } from './data.routes';

@NgModule({
  imports: [CommonModule, AppSharedModule, DataRoutingModule],
  declarations: [DataComponent],
})
export class DataModule {}
