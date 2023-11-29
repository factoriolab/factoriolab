import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { components } from './components';
import { directives } from './directives';
import { pipes } from './pipes';
import { VendorModule } from './vendor.module';

@NgModule({
  imports: [CommonModule, FormsModule, VendorModule],
  declarations: [...components, ...directives, ...pipes],
  exports: [FormsModule, VendorModule, ...components, ...directives, ...pipes],
})
export class AppSharedModule {}
