import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AutoFocusModule } from 'primeng/autofocus';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TooltipModule } from 'primeng/tooltip';

const modules = [
  AutoFocusModule,
  CardModule,
  CheckboxModule,
  ConfirmDialogModule,
  DividerModule,
  DropdownModule,
  InputNumberModule,
  InputTextModule,
  MultiSelectModule,
  ProgressSpinnerModule,
  ScrollPanelModule,
  TableModule,
  TabMenuModule,
  TooltipModule,
];

@NgModule({
  imports: [CommonModule, ...modules],
  exports: [...modules],
})
export class VendorModule {}
