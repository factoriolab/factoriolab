import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { VendorModule } from '~/shared/vendor.module';
import { pipes } from './pipes';

@NgModule({
  declarations: [...pipes],
  exports: [VendorModule, ...pipes],
  imports: [CommonModule, VendorModule],
})
export class SharedModule {}
