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
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faChevronDown,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';

import { IconType } from '~/models/icon-type';
import { Option } from '~/models/option';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Control, LAB_CONTROL } from '../control';
import { FormField } from '../form-field/form-field';
import { Icon } from '../icon/icon';

let nextUniqueId = 0;

@Component({
  selector: 'lab-select',
  imports: [FormsModule, OverlayModule, FaIconComponent, Icon, TranslatePipe],
  templateUrl: './select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'combobox',
    class:
      'flex grow cursor-pointer min-h-9 items-center select-none bg-gray-950 px-1 border focus-visible:border-brand-700 focus-visible:outline focus-visible:outline-brand-700 text-nowrap hover:border-brand-700',
    '[class]': 'opened() && !hiding() ? "border-brand-700" : "border-gray-700"',
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
export class Select<T = unknown> extends Control<T> {
  protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly overlayOrigin = inject(CdkOverlayOrigin);
  protected readonly formField = inject(FormField, { optional: true });
  private readonly injector = inject(Injector);

  private readonly overlay =
    viewChild.required<ElementRef<HTMLDivElement>>('overlay');
  protected readonly listItems =
    viewChildren<ElementRef<HTMLLIElement>>('option');

  private uniqueId = (nextUniqueId++).toString();

  readonly id = input(`lab-select-${this.uniqueId}`);
  readonly value = model<T>();
  readonly options = input.required<Option<T>[]>();
  readonly disabled = model(false);
  readonly placeholder = input<string>();
  readonly type = input<IconType>();
  readonly filter = input<boolean>();

  opened = signal(false);
  selectedOption = computed(() =>
    this.options()?.find((o) => o.value === this.value()),
  );

  protected faChevronDown = faChevronDown;
  protected faMagnifyingGlass = faMagnifyingGlass;
  protected hiding = signal(false);
  protected filterText = signal('');
  protected filterLower = computed(() => this.filterText().toLowerCase());

  toggle(event?: Event): void {
    if (this.disabled()) return;

    if (this.opened()) {
      this.hiding.set(true);
      this.overlay().nativeElement.addEventListener('transitionend', () => {
        this.opened.set(false);
        this.hiding.set(false);
      });
    } else {
      this.opened.set(true);
      this.filterText.set('');
      this.focusAfterOpen();
    }

    this.elementRef.nativeElement.focus();
    event?.preventDefault();
  }

  select(value: T): void {
    this.toggle();
    this.setValue(value);
  }

  protected focusFirst(event: Event): void {
    const el = this.listItems()[0]?.nativeElement;
    if (el == null) return;
    el.focus();
    event.preventDefault();
  }

  protected focusLast(event: Event): void {
    const items = this.listItems();
    const el = items[items.length - 1]?.nativeElement;
    if (el == null) return;
    el.focus();
    event.preventDefault();
  }

  protected focusMove(option: HTMLLIElement, dir: -1 | 1, event: Event): void {
    const index = this.listItems().findIndex((i) => i.nativeElement === option);
    const el = this.listItems()[index + dir]?.nativeElement;
    if (el == null) return;
    el.focus();
    event.preventDefault();
  }

  private focusAfterOpen(event?: Event): void {
    // Determine which element to focus, most likely the selected element
    // Don't need to worry about filter, none can be applied yet
    let index = this.options().findIndex((o) => o.value === this.value());
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
