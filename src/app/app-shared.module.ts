import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { components } from './components';
import { directives } from './directives';
import { pipes } from './pipes';
import { VendorModule } from './vendor.module';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, VendorModule],
  declarations: [...components, ...directives, ...pipes],
  exports: [
    VendorModule,
    FormsModule,
    ReactiveFormsModule,
    ...components,
    ...directives,
    ...pipes,
  ],
})
export class AppSharedModule {}
