import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppSharedModule } from '~/app-shared.module';
import { MainComponent } from './main.component';
import { MainRoutingModule } from './main.routes';

@NgModule({
  imports: [CommonModule, AppSharedModule, MainRoutingModule],
  declarations: [MainComponent],
})
export class MainModule {}
