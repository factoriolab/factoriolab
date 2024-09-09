import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';

import { DropdownTranslateDirective } from '~/directives';
import {
  FlowDiagram,
  flowDiagramOptions,
  FlowSettings,
  sankeyAlignOptions,
} from '~/models';
import { TranslatePipe } from '~/pipes';
import { Preferences, Settings } from '~/store';

import { DialogComponent } from '../modal';

const initialValue = Preferences.initialState.flowSettings;

@Component({
  selector: 'lab-flow-settings',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    CheckboxModule,
    DialogModule,
    DropdownModule,
    TooltipModule,
    DropdownTranslateDirective,
    TranslatePipe,
  ],
  templateUrl: './flow-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowSettingsComponent extends DialogComponent {
  store = inject(Store);

  linkValueOptions = this.store.selectSignal(Settings.selectLinkValueOptions);

  editValue = { ...initialValue };

  flowDiagramOptions = flowDiagramOptions;
  sankeyAlignOptions = sankeyAlignOptions;

  FlowDiagram = FlowDiagram;

  get modified(): boolean {
    return (Object.keys(this.editValue) as (keyof FlowSettings)[]).some(
      (k) => this.editValue[k] !== initialValue[k],
    );
  }

  initEdit(value: FlowSettings): void {
    this.editValue = { ...value };
  }

  open(value: FlowSettings): void {
    this.initEdit(value);
    this.show();
  }

  reset(): void {
    this.initEdit(initialValue);
  }

  save(): void {
    const flowSettings = this.editValue;
    this.store.dispatch(Preferences.setFlowSettings({ flowSettings }));
  }
}
