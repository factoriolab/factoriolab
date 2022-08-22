import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppSharedModule } from '~/app-shared.module';
import { MainSharedModule } from '../../main-shared.module';
import { MatrixRoutingModule } from './matrix-routing.module';
import { MatrixComponent } from './matrix.component';

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
