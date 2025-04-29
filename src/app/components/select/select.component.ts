import { CdkOverlayOrigin, OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  ElementRef,
  inject,
  input,
  NgModule,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

import { growVerticalIf } from '~/models/animations';

import { FormComponent } from '../form-component/form-component';
import { OptionComponent, toSelect } from '../option/option.component';

let nextUniqueId = 0;

@Component({
  selector: 'lab-select',
  imports: [PortalModule, OverlayModule, FaIconComponent],
  templateUrl: './select.component.html',
  animations: [growVerticalIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'combobox',
    class:
      'lab-input flex cursor-pointer items-center justify-between gap-2 select-none',
    'aria-haspopup': 'listbox',
    '[attr.id]': 'id()',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-disabled]': 'disabled().toString()',
    '[attr.aria-controls]': 'opened() ? id() + "-listbox" : null',
    '[attr.aria-expanded]': 'opened()',
    '(keydown.enter)': 'toggle()',
    '(click)': 'toggle()',
  },
  hostDirectives: [CdkOverlayOrigin],
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

  elementRef = inject(ElementRef);
  overlayOrigin = inject(CdkOverlayOrigin);

  options = contentChildren<OptionComponent<T>>(OptionComponent);

  id = input(`lab-select-${this.uniqueId}`);

  faChevronDown = faChevronDown;

  opened = signal(false);

  constructor() {
    super();

    toSelect(this.options).subscribe((value) => {
      this.select(value);
    });
  }

  toggle(): void {
    if (this.disabled()) return;
    this.opened.update((o) => !o);
  }

  select(value: T): void {
    this.setValue(value);
    this.opened.set(false);
  }
}

@NgModule({
  imports: [OptionComponent, SelectComponent],
  exports: [OptionComponent, SelectComponent],
})
export class SelectModule {}
