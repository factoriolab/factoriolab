import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppSharedModule } from '~/app-shared.module';
import { FlowComponent } from './flow.component';
import { FlowRoutingModule } from './flow.routes';

@NgModule({
  imports: [CommonModule, AppSharedModule, FlowRoutingModule],
  declarations: [FlowComponent],
})
export class FlowModule {}
