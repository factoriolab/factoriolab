import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppSharedModule } from '~/shared';
import { MainSharedModule } from '../../shared/main-shared.module';
import { FlowComponent } from './flow.component';
import { FlowRoutingModule } from './flow.routes';

@NgModule({
  imports: [CommonModule, AppSharedModule, MainSharedModule, FlowRoutingModule],
  declarations: [FlowComponent],
})
export class FlowModule {}
