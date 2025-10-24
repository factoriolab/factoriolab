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

import { TranslatePipe } from '~/translate/translate-pipe';

import { Control, LAB_CONTROL } from '../control';

const check = cva(
  'inline-flex transition-all relative justify-center items-center rounded-xs hover:bg-gray-900 has-focus-visible:outline outline-brand-600',
  {
    variants: {
      value: {
        true: 'text-brand-600 hover:text-brand-500',
        false: 'text-gray-400 hover:text-brand-500',
        null: 'text-brand-600 hover:text-brand-500',
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
  imports: [FormsModule, FaIconComponent, TranslatePipe],
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
  host: { class: 'inline-flex items-center' },
})
export class Checkbox extends Control<boolean | undefined> {
  private uniqueId = (nextUniqueId++).toString();

  readonly controlId = input(`lab-checkbox-${this.uniqueId}`);
  readonly value = model<boolean | undefined>();
  readonly disabled = model(false);
  readonly labelledBy = input<string>();
  readonly label = input<string>();

  readonly checkClass = computed(() =>
    check({ value: this.value() ?? 'null', disabled: this.disabled() }),
  );

  readonly icon = computed(() => {
    const value = this.value();
    if (value === true) return faSquareCheck;
    if (value === false) return faSquare;
    return faSquareMinus;
  });
}
