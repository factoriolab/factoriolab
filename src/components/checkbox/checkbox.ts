import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  FaIconComponent,
  IconDefinition,
} from '@fortawesome/angular-fontawesome';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import {
  faSquareCheck,
  faSquareMinus,
} from '@fortawesome/free-solid-svg-icons';
import { cva } from 'class-variance-authority';

import { TranslateParams } from '~/translate/translate';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Control } from '../control';

const check = cva(
  'rounded-xs relative inline-flex items-center justify-center outline-brand-600 transition-all hover:bg-gray-900 has-focus-visible:outline',
  {
    variants: {
      value: {
        true: 'text-brand-600 hover:text-brand-500',
        false: 'text-gray-400 hover:text-brand-500',
        null: 'text-brand-600 hover:text-brand-500',
      },
      disabled: {
        true: 'pointer-events-none opacity-40',
      },
    },
  },
);

let nextUniqueId = 0;

const iconMap = new Map<boolean | null | undefined, IconDefinition>([
  [true, faSquareCheck],
  [false, faSquare],
  [undefined, faSquareMinus],
  [null, faSquareMinus],
]);

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
    { provide: Control, useExisting: Checkbox },
  ],
  host: { class: 'inline-flex items-center' },
})
export class Checkbox extends Control<boolean | undefined> {
  private uniqueId = (nextUniqueId++).toString();

  readonly controlId = input(`lab-checkbox-${this.uniqueId}`);
  readonly value = model<boolean | undefined>();
  readonly disabled = model(false);
  readonly ariaLabel = input<string>();
  readonly labelledBy = input<string>();
  readonly label = input<string>();
  readonly labelParams = input<TranslateParams>();

  readonly checkClass = computed(() =>
    check({ value: this.value() ?? 'null', disabled: this.disabled() }),
  );

  readonly icon = computed(() => iconMap.get(this.value()));
}
