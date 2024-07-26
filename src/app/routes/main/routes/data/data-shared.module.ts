import { NgModule } from '@angular/core';

import { AppSharedModule } from '~/app-shared.module';
import { MainSharedModule } from '../../main-shared.module';
import { components } from './components';
import { directives } from './directives';

@NgModule({
  imports: [AppSharedModule, MainSharedModule],
  declarations: [...components, ...directives],
  exports: [...components, ...directives],
})
export class DataSharedModule {}
