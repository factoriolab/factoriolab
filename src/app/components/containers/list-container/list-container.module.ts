import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ListComponent } from './list/list.component';
import { ListRoutingModule } from './list-container-routing.module';
import { ListContainerComponent } from './list-container.component';
import { SharedModule } from '~/components/shared';

@NgModule({
  imports: [CommonModule, SharedModule, ListRoutingModule],
  declarations: [ListContainerComponent, ListComponent],
})
export class ListContainerModule {}
