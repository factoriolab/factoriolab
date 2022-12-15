import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppSharedModule } from '~/shared';
import { MainSharedModule } from '../../shared/main-shared.module';
import { MatrixComponent } from './matrix.component';
import { MatrixRoutingModule } from './matrix.routes';

@NgModule({
  imports: [
    CommonModule,
    AppSharedModule,
    MainSharedModule,
    MatrixRoutingModule,
  ],
  declarations: [MatrixComponent],
})
export class MatrixModule {}
