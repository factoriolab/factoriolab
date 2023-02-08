import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { components } from './components';
import { directives } from './directives';
import { pipes } from './pipes';
import { RatePipe } from './pipes/rate.pipe';
import { VendorModule } from './vendor.module';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, VendorModule],
  declarations: [...components, ...directives, ...pipes],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    VendorModule,
    ...components,
    ...directives,
    ...pipes,
  ],
  providers: [RatePipe],
})
export class AppSharedModule {}
