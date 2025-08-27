import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
} from '@angular/core';

import { TranslatePipe } from '~/translate/translate-pipe';

import { LAB_CONTROL } from '../control';

let nextUniqueId = 0;

@Component({
  selector: 'lab-form-field',
  imports: [TranslatePipe],
  templateUrl: './form-field.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.id]': 'id()', class: 'inline-flex flex-col' },
})
export class FormField {
  protected readonly control = contentChild.required(LAB_CONTROL);

  private uniqueId = (nextUniqueId++).toString();
  readonly labelId = `lab-form-field-label-${this.uniqueId}`;

  readonly id = input<string>(`lab-form-field-${this.uniqueId}`);
  readonly label = input.required<string>();
}
