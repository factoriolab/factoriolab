import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RadioButtonModule } from 'primeng/radiobutton';

import { AppSharedModule } from '~/app-shared.module';
import { WizardRoutingModule } from './wizard-routing.module';
import { WizardComponent } from './wizard.component';

@NgModule({
  imports: [
    CommonModule,
    RadioButtonModule,
    WizardRoutingModule,
    AppSharedModule,
  ],
  declarations: [WizardComponent],
})
export class WizardModule {}
