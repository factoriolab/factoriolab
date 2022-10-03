import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DividerModule } from 'primeng/divider';

import { AppSharedModule } from '~/app-shared.module';
import { WizardRoutingModule } from './wizard-routing.module';
import { WizardComponent } from './wizard.component';

@NgModule({
  imports: [CommonModule, DividerModule, WizardRoutingModule, AppSharedModule],
  declarations: [WizardComponent],
})
export class WizardModule {}
