import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectButtonModule } from 'primeng/selectbutton';

const modules = [ButtonModule, ConfirmDialogModule, SelectButtonModule];

@NgModule({
  imports: [CommonModule, TranslateModule, ...modules],
  exports: [TranslateModule, ...modules],
})
export class VendorModule {}
