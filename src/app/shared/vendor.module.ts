import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SidebarModule } from 'primeng/sidebar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';

const modules = [
  ButtonModule,
  CardModule,
  DialogModule,
  InputNumberModule,
  InputTextModule,
  OverlayPanelModule,
  ProgressSpinnerModule,
  SelectButtonModule,
  SidebarModule,
  SplitButtonModule,
  TabViewModule,
  TooltipModule,
];

@NgModule({
  imports: [CommonModule, ...modules],
  exports: [...modules],
})
export class VendorModule {}
