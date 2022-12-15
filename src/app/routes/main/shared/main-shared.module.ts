import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';

import { AppSharedModule } from '~/shared';
import { pipes } from './pipes';

const modules = [InputNumberModule, TableModule, TabMenuModule];

@NgModule({
  imports: [CommonModule, ...modules, AppSharedModule],
  declarations: [...pipes],
  exports: [...pipes, ...modules],
})
export class MainSharedModule {}
