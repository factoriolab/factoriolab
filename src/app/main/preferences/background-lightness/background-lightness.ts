import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Checkbox } from '~/components/checkbox/checkbox';
import { Control } from '~/components/control';
import { FormField } from '~/components/form-field/form-field';

let nextUniqueId = 0;

@Component({
  selector: 'lab-background-lightness',
  imports: [FormsModule, Checkbox],
  templateUrl: './background-lightness.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: BackgroundLightness,
      multi: true,
    },
    { provide: Control, useExisting: BackgroundLightness },
  ],
  host: {
    class: 'flex items-center gap-2',
  },
})
export class BackgroundLightness extends Control<number | undefined> {
  protected readonly formField = inject(FormField, { optional: true });

  private uniqueId = (nextUniqueId++).toString();

  readonly controlId = input(`lab-background-${this.uniqueId}`);
  readonly value = model<number | undefined>();
  readonly disabled = model(false);
  readonly labelledBy = input<string>();
}
