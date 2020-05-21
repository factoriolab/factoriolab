import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconComponent } from './icon/icon.component';
import { SelectComponent } from './select/select.component';

@NgModule({
  imports: [CommonModule],
  declarations: [IconComponent, SelectComponent],
  exports: [IconComponent, SelectComponent],
})
export class SharedModule {}
