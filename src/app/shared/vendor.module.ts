import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AutoFocusModule } from 'primeng/autofocus';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TooltipModule } from 'primeng/tooltip';

const modules = [
  AutoFocusModule,
  ButtonModule,
  CardModule,
  CheckboxModule,
  ConfirmDialogModule,
  DialogModule,
  DividerModule,
  DropdownModule,
  InputNumberModule,
  InputTextModule,
  MultiSelectModule,
  ProgressSpinnerModule,
  ScrollPanelModule,
  SelectButtonModule,
  TableModule,
  TabMenuModule,
  TooltipModule,
];

@NgModule({
  imports: [CommonModule, ...modules],
  exports: [...modules],
})
export class VendorModule {}
