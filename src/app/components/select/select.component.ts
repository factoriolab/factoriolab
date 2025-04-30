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

import { fadeIf } from '~/models/animations';

import { FormComponent } from '../form-component/form-component';
import { OptionComponent } from '../option/option.component';

let nextUniqueId = 0;

@Component({
  selector: 'lab-select',
  imports: [PortalModule, OverlayModule, FaIconComponent],
  templateUrl: './select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'combobox',
    class:
      'lab-input flex cursor-pointer items-center justify-between gap-2 select-none w-full',
    'aria-haspopup': 'listbox',
    '[attr.id]': 'id()',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-disabled]': 'disabled().toString()',
    '[attr.aria-controls]': 'opened() ? id() + "-listbox" : null',
    '[attr.aria-expanded]': 'opened()',
    '(keydown.enter)': 'toggle()',
    '(keydown.arrowdown)': 'toggle()',
    '(click)': 'toggle()',
  },
  hostDirectives: [CdkOverlayOrigin],
  animations: [fadeIf],
  providers: [
    { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: SelectComponent },
    { provide: FormComponent, useExisting: SelectComponent },
  ],
})
export class SelectComponent<T> extends FormComponent<T> {
  private uniqueId = (nextUniqueId++).toString();

  elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  overlayOrigin = inject(CdkOverlayOrigin);
  options = contentChildren(OptionComponent);

  id = input(`lab-select-${this.uniqueId}`);

  faChevronDown = faChevronDown;

  opened = signal(false);

  toggle(): void {
    if (this.disabled()) return;
    this.opened.update((o) => !o);
    if (this.opened()) {
      const options = this.options();
      const focus =
        options.find((o) => o.value() === this.value()) ?? options[0];
      if (focus) {
        setTimeout(() => {
          focus.elementRef.nativeElement.focus();
        }, 1);
      }
    }
  }

  override setValue(value: T): void {
    super.setValue(value);
    this.opened.set(false);
    this.elementRef.nativeElement.focus();
  }
}

@NgModule({
  imports: [OptionComponent, SelectComponent],
  exports: [OptionComponent, SelectComponent],
})
export class SelectModule {}
