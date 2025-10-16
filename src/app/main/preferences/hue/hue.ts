import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Control, LAB_CONTROL } from '~/components/control';

let nextUniqueId = 0;

@Component({
  selector: 'lab-hue',
  imports: [FormsModule],
  templateUrl: './hue.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: Hue,
      multi: true,
    },
    { provide: LAB_CONTROL, useExisting: Hue },
  ],
  host: { class: 'flex items-center gap-2' },
})
export class Hue extends Control<number> {
  private uniqueId = (nextUniqueId++).toString();

  readonly controlId = input(`lab-hue-${this.uniqueId}`);
  readonly value = model<number>();
  readonly disabled = model(false);
  readonly labelledBy = input<string>();
}
