import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppSharedModule } from '~/shared';
import { MainSharedModule } from '../../shared/main-shared.module';
import { ListComponent } from './list.component';
import { ListRoutingModule } from './list.routes';
import { pipes } from './pipes';
import { RatePipe } from './pipes/rate.pipe';

@NgModule({
  imports: [CommonModule, AppSharedModule, MainSharedModule, ListRoutingModule],
  declarations: [...pipes, ListComponent],
  providers: [RatePipe],
})
export class ListModule {}
