import { CdkOverlayOrigin, OverlayModule } from '@angular/cdk/overlay';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

import { IdType } from '~/models/icon-type';
import { Option } from '~/models/option';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Control, LAB_CONTROL } from '../control';
import { FormField } from '../form-field/form-field';
import { Icon } from '../icon/icon';

let nextUniqueId = 0;

@Component({
  selector: 'lab-select',
  imports: [OverlayModule, FaIconComponent, Icon, TranslatePipe],
  templateUrl: './select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'combobox',
    class:
      'flex cursor-pointer min-h-9 items-center select-none bg-gray-950 px-1 border focus-visible:border-brand-500 focus-visible:outline focus-visible:outline-brand-500 text-nowrap',
    '[class.border-gray-700]': '!opened()',
    '[class.border-brand-500]': 'opened()',
    '[attr.id]': 'id()',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.aria-controls]': 'opened() ? id() + "-listbox" : null',
    '[attr.aria-expanded]': 'opened()',
    '[attr.aria-labelledby]': 'formField?.labelId ?? null',
    '(keydown.enter)': 'toggle()',
    '(keydown.arrowdown)': 'toggle($event)',
    '(keydown.arrowup)': 'toggle($event)',
    '(keydown.home)': 'toggle($event)',
    '(keydown.end)': 'toggle($event)',
    '(click)': 'toggle()',
  },
  hostDirectives: [CdkOverlayOrigin],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: Select,
    },
    { provide: LAB_CONTROL, useExisting: Select },
  ],
})
export class Select<T = string> extends Control<T> {
  protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly overlayOrigin = inject(CdkOverlayOrigin);
  protected readonly formField = inject(FormField, { optional: true });
  private readonly injector = inject(Injector);

  private readonly listbox =
    viewChild.required<ElementRef<HTMLUListElement>>('listbox');
  private readonly listItems =
    viewChildren<ElementRef<HTMLLIElement>>('option');

  private uniqueId = (nextUniqueId++).toString();

  readonly id = input(`lab-select-${this.uniqueId}`);
  readonly value = model<T | undefined>();
  readonly disabled = model(false);
  readonly options = input.required<Option<T>[]>();
  readonly type = input<IdType>();

  faChevronDown = faChevronDown;

  opened = signal(false);
  selectedOption = computed(() =>
    this.options()?.find((o) => o.value === this.value()),
  );
  protected hiding = signal(false);

  toggle(event?: Event): void {
    if (this.disabled()) return;

    if (this.opened()) {
      // If we got the listbox element, transition out
      this.hiding.set(true);
      this.listbox().nativeElement.addEventListener('transitionend', () => {
        this.opened.set(false);
        this.hiding.set(false);
      });
    } else {
      this.opened.set(true);
      this.focusAfterOpen();
    }

    this.markAsTouched();
    this.elementRef.nativeElement.focus();
    event?.preventDefault();
  }

  select(value: T): void {
    this.toggle();
    this.setValue(value);
  }

  focusFirst(event: Event): void {
    const el = this.listItems()[0]?.nativeElement;
    if (el == null) return;
    el.focus();
    event.preventDefault();
  }

  focusLast(event: Event): void {
    const items = this.listItems();
    const el = items[items.length - 1]?.nativeElement;
    if (el == null) return;
    el.focus();
    event.preventDefault();
  }

  focusMove(option: HTMLLIElement, dir: -1 | 1, event: Event): void {
    const index = this.listItems().findIndex((i) => i.nativeElement === option);
    const el = this.listItems()[index + dir]?.nativeElement;
    if (el == null) return;
    el.focus();
    event.preventDefault();
  }

  private focusAfterOpen(event?: Event): void {
    // Determine which element to focus, most likely the selected element
    let index = this.options()?.findIndex((o) => o.value === this.value());
    if (event instanceof KeyboardEvent) {
      if (event.key === 'Home') {
        // Select first element
        index = 0;
      } else if (
        event.key === 'End' ||
        (event.key === 'ArrowUp' && index == null)
      ) {
        // Select last element
        index = this.options().length - 1;
      }
    }

    if (index !== -1)
      afterNextRender(
        () => {
          const el = this.listItems().at(index)?.nativeElement;
          if (el == null) return;
          el.scrollIntoView();
          el.focus();
        },
        { injector: this.injector },
      );
  }
}
