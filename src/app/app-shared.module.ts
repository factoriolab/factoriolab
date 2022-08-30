import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { pipes } from './pipes';
import { VendorModule } from './vendor.module';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, VendorModule],
  declarations: [...pipes],
  exports: [VendorModule, FormsModule, ReactiveFormsModule, ...pipes],
})
export class AppSharedModule {}
