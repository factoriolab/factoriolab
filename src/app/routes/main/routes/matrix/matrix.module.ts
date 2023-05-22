import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppSharedModule } from '~/app-shared.module';
import { MatrixComponent } from './matrix.component';
import { MatrixRoutingModule } from './matrix.routes';

@NgModule({
  imports: [CommonModule, AppSharedModule, MatrixRoutingModule],
  declarations: [MatrixComponent],
})
export class MatrixModule {}
