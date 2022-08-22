import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppSharedModule } from '~/app-shared.module';
import { MainRouting } from './main-routing.module';
import { MainSharedModule } from './main-shared.module';
import { MainComponent } from './main.component';

@NgModule({
  declarations: [MainComponent],
  imports: [CommonModule, AppSharedModule, MainSharedModule, MainRouting],
})
export class MainModule {}
