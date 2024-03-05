import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppSharedModule } from '~/app-shared.module';
import { components } from './components';
import { directives } from './directives';
import { pipes } from './pipes';

@NgModule({
  imports: [CommonModule, FormsModule, AppSharedModule],
  declarations: [...components, ...directives, ...pipes],
  exports: [FormsModule, ...components, ...directives, ...pipes],
})
export class MainSharedModule {}
