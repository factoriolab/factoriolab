import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '~/shared/shared.module';
import {
  ColumnsDialogComponent,
  ProductsComponent,
  SettingsComponent,
} from './components';
import { MainComponent } from './main.component';
import { MainRouting } from './main.routes';
import { FlowComponent } from './routes/flow/flow.component';
import { ListComponent } from './routes/list/list.component';
import { MatrixComponent } from './routes/matrix/matrix.component';

@NgModule({
  imports: [CommonModule, SharedModule, MainRouting],
  declarations: [
    MainComponent,
    ProductsComponent,
    SettingsComponent,
    ListComponent,
    FlowComponent,
    MatrixComponent,
    ColumnsDialogComponent,
  ],
})
export class MainModule {}
