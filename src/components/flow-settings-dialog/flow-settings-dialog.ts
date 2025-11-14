import { DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  faCheck,
  faRotateLeft,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { elkAlgorithmOptions } from '~/state/preferences/elk-algorithm';
import {
  FlowDiagram,
  flowDiagramOptions,
} from '~/state/preferences/flow-diagram';
import { FlowSettings } from '~/state/preferences/flow-settings';
import { initialPreferencesState } from '~/state/preferences/preferences-state';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { sankeyAlignOptions } from '~/state/preferences/sankey-align';
import { SettingsStore } from '~/state/settings/settings-store';

import { Button } from '../button/button';
import { Checkbox } from '../checkbox/checkbox';
import { DialogData } from '../dialog/dialog';
import { FormField } from '../form-field/form-field';
import { Select } from '../select/select';
import { Tooltip } from '../tooltip/tooltip';

@Component({
  selector: 'lab-flow-settings-dialog',
  imports: [FormsModule, Button, Checkbox, FormField, Select, Tooltip],
  templateUrl: './flow-settings-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex w-sm max-w-full flex-col gap-3 overflow-hidden p-3 pt-0 sm:gap-6 sm:p-6 sm:pt-0',
  },
})
export class FlowSettingsDialog implements DialogData {
  protected readonly dialogRef = inject(DialogRef);
  private readonly preferencesStore = inject(PreferencesStore);
  protected readonly settingsStore = inject(SettingsStore);

  protected readonly editValue = linkedSignal(() =>
    this.preferencesStore.flowSettings(),
  );
  protected readonly modified = computed(() => {
    const edit = this.editValue();
    const init = initialPreferencesState.flowSettings;
    const keys = Object.keys(init) as (keyof FlowSettings)[];
    return keys.some((k) => init[k] !== edit[k]);
  });

  protected readonly elkAlgorithmOptions = elkAlgorithmOptions;
  protected readonly faCheck = faCheck;
  protected readonly faRotateLeft = faRotateLeft;
  protected readonly faXmark = faXmark;
  protected readonly FlowDiagram = FlowDiagram;
  protected readonly flowDiagramOptions = flowDiagramOptions;
  readonly header = 'flowSettings.header';
  protected readonly linkValueOptions = this.settingsStore.linkValueOptions;
  protected readonly sankeyAlignOptions = sankeyAlignOptions;

  apply(value: Partial<FlowSettings>): void {
    this.editValue.update((e) => ({ ...e, ...value }));
  }

  reset(): void {
    this.editValue.set(initialPreferencesState.flowSettings);
  }

  save(): void {
    const flowSettings = this.editValue();
    this.preferencesStore.apply({ flowSettings });
    this.dialogRef.close();
  }
}
