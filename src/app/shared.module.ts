import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectButtonModule } from 'primeng/selectbutton';

const modules = [
  FormsModule,
  ReactiveFormsModule,
  ButtonModule,
  DialogModule,
  ProgressSpinnerModule,
  SelectButtonModule,
  TranslateModule,
];

@NgModule({
  exports: [...modules],
  imports: [CommonModule, ...modules],
})
export class SharedModule {}
