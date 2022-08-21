import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ErrorRouting } from './error.routes';

@NgModule({
  imports: [CommonModule, ErrorRouting],
})
export class ErrorModule {}
