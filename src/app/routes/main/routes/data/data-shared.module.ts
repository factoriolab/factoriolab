import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppSharedModule } from '~/app-shared.module';
import { components } from './components';

@NgModule({
  imports: [CommonModule, AppSharedModule],
  declarations: [...components],
  exports: [...components],
})
export class DataSharedModule {}
