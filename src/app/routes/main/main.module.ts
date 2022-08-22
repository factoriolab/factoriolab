import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '~/shared.module';
import { components } from './components';
import { directives } from './directives';
import { MainComponent } from './main.component';
import { MainRouting } from './main.routes';
import { pipes } from './pipes';
import { RatePipe } from './pipes/rate.pipe';
import { FlowComponent } from './routes/flow/flow.component';
import { ListComponent } from './routes/list/list.component';
import { MatrixComponent } from './routes/matrix/matrix.component';
import { VendorModule } from './vendor.module';

@NgModule({
  declarations: [
    MainComponent,
    ListComponent,
    FlowComponent,
    MatrixComponent,
    ...components,
    ...directives,
    ...pipes,
  ],
  imports: [CommonModule, VendorModule, SharedModule, MainRouting],
  providers: [RatePipe],
})
export class MainModule {}
