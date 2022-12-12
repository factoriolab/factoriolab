import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppSharedModule } from '~/app-shared.module';
import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';

@NgModule({
  imports: [CommonModule, AppSharedModule, MainRoutingModule],
  declarations: [MainComponent],
})
export class MainModule {}
