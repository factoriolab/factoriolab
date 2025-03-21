import { OverlayModule } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  input,
  NgModule,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { FormComponent } from '../form-component/form-component';
import { OptionComponent } from '../option/option.component';

let nextUniqueId = 0;

@Component({
  selector: 'lab-select',
  imports: [OverlayModule, FaIconComponent],
  templateUrl: './select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'combobox',
    'aria-haspopup': 'listbox',
    '[attr.id]': 'id()',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-disabled]': 'disabled().toString()',
    '(click)': 'toggle()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: SelectComponent,
    },
  ],
})
export class SelectComponent<T> extends FormComponent<T> {
  private uniqueId = (nextUniqueId++).toString();

  options = contentChildren<OptionComponent<T>>(OptionComponent);

  id = input(`lab-select-${this.uniqueId}`);

  open = signal(false);

  toggle(): void {
    if (this.disabled()) return;

    this.open.update((o) => !o);
  }
}

@NgModule({
  imports: [OptionComponent, SelectComponent],
  exports: [OptionComponent, SelectComponent],
})
export class SelectModule {}
