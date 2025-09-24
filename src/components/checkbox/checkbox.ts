import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import {
  faSquareCheck,
  faSquareMinus,
} from '@fortawesome/free-solid-svg-icons';
import { cva } from 'class-variance-authority';

import { Control, LAB_CONTROL } from '../control';

const host = cva(
  'inline-flex transition-all relative justify-center items-center rounded-xs hover:bg-gray-900 has-focus-visible:outline outline-brand-700',
  {
    variants: {
      value: {
        true: 'text-brand-700 hover:text-brand-500',
        false: 'text-gray-400 hover:text-brand-500',
        undefined: 'text-brand-700 hover:text-brand-500',
      },
      disabled: {
        true: 'pointer-events-none',
      },
    },
  },
);

let nextUniqueId = 0;

@Component({
  selector: 'lab-checkbox',
  imports: [FormsModule, FaIconComponent],
  templateUrl: './checkbox.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: Checkbox,
      multi: true,
    },
    { provide: LAB_CONTROL, useExisting: Checkbox },
  ],
  host: { '[class]': 'hostClass()' },
})
export class Checkbox extends Control<boolean | undefined> {
  private uniqueId = (nextUniqueId++).toString();

  readonly controlId = input(`lab-checkbox-${this.uniqueId}`);
  readonly value = model<boolean | undefined>();
  readonly disabled = model(false);
  readonly labelledBy = input<string>();

  readonly hostClass = computed(() =>
    host({ value: this.value(), disabled: this.disabled() }),
  );

  readonly icon = computed(() => {
    const value = this.value();
    if (value === true) return faSquareCheck;
    if (value === false) return faSquare;
    return faSquareMinus;
  });
}
