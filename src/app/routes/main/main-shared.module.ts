import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoFocusModule } from 'primeng/autofocus';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';

import { AppSharedModule } from '~/app-shared.module';
import { components } from './components';
import { directives } from './directives';
import { pipes } from './pipes';
import { RatePipe } from './pipes/rate.pipe';

const modules = [
  FormsModule,
  ReactiveFormsModule,
  AutoFocusModule,
  CardModule,
  CheckboxModule,
  ConfirmDialogModule,
  DividerModule,
  DropdownModule,
  InputNumberModule,
  InputTextModule,
  MenuModule,
  MultiSelectModule,
  OverlayPanelModule,
  ProgressSpinnerModule,
  ScrollPanelModule,
  TableModule,
  TabMenuModule,
  TabViewModule,
  TooltipModule,
];

@NgModule({
  imports: [CommonModule, AppSharedModule, ...modules],
  declarations: [...components, ...directives, ...pipes],
  exports: [...modules, ...components, ...directives, ...pipes],
  providers: [RatePipe],
})
export class MainSharedModule {}
