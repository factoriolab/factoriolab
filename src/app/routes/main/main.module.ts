import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { SplitButtonModule } from 'primeng/splitbutton';

import { AppSharedModule } from '~/shared';
import { components } from './components';
import { MainComponent } from './main.component';
import { MainRoutingModule } from './main.routes';
import { pipes } from './pipes';
import { MainSharedModule } from './shared/main-shared.module';

@NgModule({
  imports: [
    CommonModule,
    AppSharedModule,
    MainSharedModule,
    CheckboxModule,
    ConfirmDialogModule,
    MenuModule,
    MultiSelectModule,
    SplitButtonModule,
    MainRoutingModule,
  ],
  declarations: [...components, ...pipes, MainComponent],
})
export class MainModule {}
