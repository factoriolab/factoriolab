import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppSharedModule } from '~/app-shared.module';
import { FlowRoutingModule } from './flow-routing.module';
import { FlowComponent } from './flow.component';

@NgModule({
  imports: [CommonModule, AppSharedModule, FlowRoutingModule],
  declarations: [FlowComponent],
})
export class FlowModule {}
