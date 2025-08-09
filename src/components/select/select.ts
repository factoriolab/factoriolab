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
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

import { Option } from '~/models/option';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Control } from '../control';

let nextUniqueId = 0;

@Component({
  selector: 'lab-select',
  imports: [OverlayModule, FaIconComponent, TranslatePipe],
  templateUrl: './select.html',
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
    '(keydown.arrowdown)': 'focusDown()',
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
  private listbox = viewChild<ElementRef<HTMLUListElement>>('listbox');

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
  protected hiding = signal(false);

  toggle(): void {
    if (this.disabled()) return;

    const el = this.listbox()?.nativeElement;
    if (el) {
      // If we got the listbox element, transition out
      this.hiding.set(true);
      el.addEventListener('transitionend', () => {
        this.opened.set(false);
        this.hiding.set(false);
      });
    } else {
      // If no listbox (failed or not shown yet) update opened signal
      this.opened.update((o) => !o);
    }

    this.markAsTouched();
  }

  select(value: T): void {
    this.opened.set(false);
    this.setValue(value);
  }

  focusDown(): void {
    console.log('down', document.activeElement);
    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keypress', {
        key: 'Tab',
      }),
    );
  }

  // TODO: Keyboard navigation
  // TODO: Search input?
  // TODO: Icon support
  // TODO: Tooltip support
}
