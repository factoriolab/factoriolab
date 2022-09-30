import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppSharedModule } from '~/app-shared.module';
import { ListRoutingModule } from './list-routing.module';
import { ListComponent } from './list.component';

@NgModule({
  imports: [CommonModule, AppSharedModule, ListRoutingModule],
  declarations: [ListComponent],
})
export class ListModule {}
