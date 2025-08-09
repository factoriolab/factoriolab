import { CdkOverlayOrigin, OverlayModule } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

import { growVertical } from '~/animations/grow-vertical';
import { Option } from '~/models/option';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Control } from '../control';

let nextUniqueId = 0;

@Component({
  selector: 'lab-select',
  imports: [OverlayModule, FaIconComponent, TranslatePipe],
  templateUrl: './select.html',
  animations: [growVertical],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'combobox',
    class:
      'flex cursor-pointer select-none bg-gray-950 py-1 px-2 rounded-lg border border-gray-500',
    '[attr.id]': 'id()',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
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
      useExisting: Select,
    },
  ],
})
export class Select<T = string> extends Control<T> {
  protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly cdkOverlayOrigin = inject(CdkOverlayOrigin);

  private uniqueId = (nextUniqueId++).toString();

  id = input(`lab-select-${this.uniqueId}`);
  value = model<T | undefined>();
  test = model<number>();
  disabled = model(false);
  options = input<Option<T>[]>();

  faChevronDown = faChevronDown;

  opened = signal(false);
  selectedOption = computed(() =>
    this.options()?.find((o) => o.value === this.value()),
  );

  toggle(event?: MouseEvent): void {
    if (this.disabled()) return;

    this.opened.update((o) => !o);
    this.markAsTouched();
    event?.preventDefault();
  }

  select(value: T): void {
    this.opened.set(false);
    this.setValue(value);
  }
}
