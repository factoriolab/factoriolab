import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppSharedModule } from '~/app-shared.module';
import { ListComponent } from './list.component';
import { ListRoutingModule } from './list.routes';

@NgModule({
  imports: [CommonModule, AppSharedModule, ListRoutingModule],
  declarations: [ListComponent],
})
export class ListModule {}
