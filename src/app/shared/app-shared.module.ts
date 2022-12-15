import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AutoFocusModule } from 'primeng/autofocus';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';

import { components } from './components';
import { directives } from './directives';
import { pipes } from './pipes';

const modules = [
  // primeng
  AutoFocusModule,
  ButtonModule,
  CardModule,
  DialogModule,
  DividerModule,
  DropdownModule,
  InputTextModule,
  ProgressSpinnerModule,
  RippleModule,
  ScrollPanelModule,
  TabViewModule,
  TooltipModule,

  // ngx-translate
  TranslateModule,
];

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ...modules],
  declarations: [...components, ...directives, ...pipes],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    ...modules,
    ...components,
    ...directives,
    ...pipes,
  ],
})
export class AppSharedModule {}
