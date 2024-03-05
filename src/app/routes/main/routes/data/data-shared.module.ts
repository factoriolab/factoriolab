import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppSharedModule } from '~/app-shared.module';
import { MainSharedModule } from '../../main-shared.module';
import { components } from './components';
import { directives } from './directives';

@NgModule({
  imports: [CommonModule, AppSharedModule, MainSharedModule],
  declarations: [...components, ...directives],
  exports: [...components, ...directives],
})
export class DataSharedModule {}
