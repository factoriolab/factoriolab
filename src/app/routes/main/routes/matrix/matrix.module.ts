import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppSharedModule } from '~/app-shared.module';
import { MatrixRoutingModule } from './matrix-routing.module';
import { MatrixComponent } from './matrix.component';

@NgModule({
  imports: [CommonModule, AppSharedModule, MatrixRoutingModule],
  declarations: [MatrixComponent],
})
export class MatrixModule {}
