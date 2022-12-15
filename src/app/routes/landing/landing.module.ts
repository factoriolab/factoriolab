import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppSharedModule } from '~/shared';
import { LandingComponent } from './landing.component';
import { LandingRoutingModule } from './landing.routes';

@NgModule({
  imports: [CommonModule, LandingRoutingModule, AppSharedModule],
  declarations: [LandingComponent],
})
export class LandingModule {}
