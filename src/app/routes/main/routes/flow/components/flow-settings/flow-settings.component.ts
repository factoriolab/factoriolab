import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppSharedModule } from '~/app-shared.module';
import { DialogComponent } from '~/components';
import {
  FlowDiagram,
  flowDiagramOptions,
  FlowSettings,
  sankeyAlignOptions,
} from '~/models';
import { MainSharedModule } from '~/routes/main/main-shared.module';
import { Preferences, Settings } from '~/store';

const initialValue = Preferences.initialState.flowSettings;

@Component({
  selector: 'lab-flow-settings',
  standalone: true,
  imports: [AppSharedModule, MainSharedModule],
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
