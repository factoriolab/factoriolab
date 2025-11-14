import { computed, inject, linkedSignal, signal } from '@angular/core';
import { EMPTY, switchMap } from 'rxjs';

import { rational } from '~/rational/rational';
import { ObjectiveBase } from '~/state/objectives/objective';
import { ObjectiveType } from '~/state/objectives/objective-type';
import { ObjectiveUnit } from '~/state/objectives/objective-unit';
import { SettingsStore } from '~/state/settings/settings-store';

import { Picker } from './picker/picker';

export abstract class ObjectiveForm {
  protected readonly settingsStore = inject(SettingsStore);
  protected readonly picker = inject(Picker);

  protected readonly displayRateInfo = this.settingsStore.displayRateInfo;

  readonly value = linkedSignal(() => {
    if (this.unit() !== ObjectiveUnit.Items) return rational.one;
    return this.displayRateInfo().value;
  });
  readonly unit = signal(ObjectiveUnit.Items);
  readonly type = signal(ObjectiveType.Output);
  readonly isRecipe = computed(() => this.unit() === ObjectiveUnit.Machines);
  protected readonly step = computed(() => {
    if (this.unit() !== ObjectiveUnit.Items) return rational.one;
    return this.displayRateInfo().step;
  });

  openPicker(): void {
    const targetId = this.isRecipe()
      ? this.picker.pickRecipe()
      : this.picker.pickItem();
    targetId
      .pipe(
        switchMap((targetId) => {
          const result = this.addObjective({
            targetId,
            value: this.value(),
            unit: this.unit(),
            type: this.type(),
          });
          return result ?? EMPTY;
        }),
      )
      .subscribe();
  }

  abstract addObjective(value: ObjectiveBase): Promise<void> | void;
}
