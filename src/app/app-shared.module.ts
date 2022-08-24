import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SplitButtonModule } from 'primeng/splitbutton';

import { pipes } from './pipes';

const modules = [
  ButtonModule,
  DialogModule,
  ProgressSpinnerModule,
  SplitButtonModule,
  TranslateModule,
];

@NgModule({
  imports: [CommonModule, ...modules],
  declarations: [...pipes],
  exports: [...modules, ...pipes],
})
export class AppSharedModule {}
