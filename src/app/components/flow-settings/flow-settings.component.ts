import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';

import { DropdownTranslateDirective } from '~/directives/dropdown-translate.directive';
import { spread } from '~/helpers';
import { FlowDiagram, flowDiagramOptions } from '~/models/enum/flow-diagram';
import { sankeyAlignOptions } from '~/models/enum/sankey-align';
import { FlowSettings } from '~/models/settings/flow-settings';
import { TranslatePipe } from '~/pipes/translate.pipe';
import {
  initialPreferencesState,
  PreferencesStore,
} from '~/store/preferences.store';
import { SettingsStore } from '~/store/settings.store';

import { DialogComponent } from '../modal';

const initialValue = initialPreferencesState.flowSettings;

@Component({
  selector: 'lab-flow-settings',
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
  preferencesSvc = inject(PreferencesStore);
  settingsSvc = inject(SettingsStore);

  linkValueOptions = this.settingsSvc.linkValueOptions;

  editValue = spread(initialValue);

  flowDiagramOptions = flowDiagramOptions;
  sankeyAlignOptions = sankeyAlignOptions;

  FlowDiagram = FlowDiagram;

  get modified(): boolean {
    return (Object.keys(this.editValue) as (keyof FlowSettings)[]).some(
      (k) => this.editValue[k] !== initialValue[k],
    );
  }

  initEdit(value: FlowSettings): void {
    this.editValue = spread(value);
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
    this.preferencesSvc.apply({ flowSettings });
  }
}
