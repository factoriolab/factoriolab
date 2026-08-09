import { computed, inject, Service, signal } from '@angular/core';
import { map, Observable } from 'rxjs';

import { rational } from '~/rational/rational';
import { ObjectiveBase } from '~/state/objectives/objective';
import { ObjectiveType } from '~/state/objectives/objective-type';
import { ObjectiveUnit } from '~/state/objectives/objective-unit';

import { Picker } from './picker/picker';

@Service()
export class ObjectiveForm {
  protected readonly picker = inject(Picker);

  readonly value = signal(rational.one);
  readonly unit = signal(ObjectiveUnit.Items);
  readonly type = signal(ObjectiveType.Output);
  readonly isRecipe = computed(() => this.unit() === ObjectiveUnit.Machines);

  openPicker(): Observable<ObjectiveBase> {
    const targetId = this.isRecipe()
      ? this.picker.pickRecipe()
      : this.picker.pickItem();
    return targetId.pipe(
      map((targetId) => ({
        targetId,
        value: this.value(),
        unit: this.unit(),
        type: this.type(),
      })),
    );
  }
}
