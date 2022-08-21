import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { SelectButtonModule } from 'primeng/selectbutton';

const modules = [
  ButtonModule,
  ConfirmDialogModule,
  DialogModule,
  SelectButtonModule,
];

@NgModule({
  imports: [CommonModule, TranslateModule, ...modules],
  exports: [TranslateModule, ...modules],
})
export class VendorModule {}
