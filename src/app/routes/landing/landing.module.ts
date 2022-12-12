import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DividerModule } from 'primeng/divider';

import { AppSharedModule } from '~/app-shared.module';
import { LandingRoutingModule } from './landing-routing.module';
import { LandingComponent } from './landing.component';

@NgModule({
  imports: [CommonModule, DividerModule, LandingRoutingModule, AppSharedModule],
  declarations: [LandingComponent],
})
export class LandingModule {}
