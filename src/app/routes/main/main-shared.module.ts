import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppSharedModule } from '~/app-shared.module';
import { components } from './components';
import { directives } from './directives';
import { pipes } from './pipes';
import { RatePipe } from './pipes/rate.pipe';

@NgModule({
  imports: [CommonModule, AppSharedModule],
  declarations: [...components, ...directives, ...pipes],
  exports: [...components, ...directives, ...pipes],
  providers: [RatePipe],
})
export class MainSharedModule {}
