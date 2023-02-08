import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RadioButtonModule } from 'primeng/radiobutton';
import { StepsModule } from 'primeng/steps';

import { AppSharedModule } from '~/app-shared.module';
import { WizardComponent } from './wizard.component';
import { WizardRoutingModule } from './wizard.routes';

@NgModule({
  imports: [
    CommonModule,
    RadioButtonModule,
    StepsModule,
    WizardRoutingModule,
    AppSharedModule,
  ],
  declarations: [WizardComponent],
})
export class WizardModule {}
