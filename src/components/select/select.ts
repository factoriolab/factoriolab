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
import { cva } from 'class-variance-authority';

import { IconType } from '~/data/icon-type';
import { Option } from '~/models/option';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Control, LAB_CONTROL } from '../control';
import { FormField } from '../form-field/form-field';
import { Icon } from '../icon/icon';
import { Tooltip } from '../tooltip/tooltip';

let nextUniqueId = 0;
const TOGGLE_KEYS = new Set(['Enter', 'ArrowDown', 'ArrowUp', 'Home', 'End']);

const host = cva(
  'inline-flex overflow-hidden grow cursor-pointer min-h-9 items-center select-none px-1 hover:border-brand-700 hover:z-2 focus-visible:border-brand-700 focus-visible:outline focus:z-2',
  {
    variants: {
      opened: {
        true: 'border-brand-700 outline z-2',
        false: 'border-gray-700',
      },
      rounded: {
        true: 'rounded-xs',
      },
      iconOnly: {
        true: 'min-w-9 justify-center hover:bg-gray-800 outline-brand-700',
        false: 'border outline-brand-700',
      },
    },
  },
);

@Component({
  selector: 'lab-select',
  imports: [
    FormsModule,
    OverlayModule,
    FaIconComponent,
    Icon,
    Tooltip,
    TranslatePipe,
  ],
  templateUrl: './select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'combobox',
    '[class]': 'hostClass()',
    '[attr.id]': 'id()',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.aria-controls]': 'opened() ? id() + "-listbox" : null',
    '[attr.aria-expanded]': 'opened()',
    '[attr.aria-labelledby]': 'formField?.labelId ?? null',
    '(keydown)': 'toggle($event)',
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
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly overlayOrigin = inject(CdkOverlayOrigin);
  readonly formField = inject(FormField, { optional: true });
  readonly injector = inject(Injector);

  readonly overlay = viewChild.required<ElementRef<HTMLDivElement>>('overlay');
  readonly listItems = viewChildren<ElementRef<HTMLLIElement>>('option');

  private uniqueId = (nextUniqueId++).toString();

  readonly id = input(`lab-select-${this.uniqueId}`);
  readonly value = model<T>();
  readonly options = input.required<Option<T>[]>();
  readonly disabled = model(false);
  readonly placeholder = input<string>();
  readonly rounded = input(true);
  readonly type = input<IconType>();
  readonly filter = input<boolean>(false);
  readonly iconOnly = input<boolean>(false);
  readonly iconLocator = input<(value: T) => string>((v) => v as string);

  readonly hostClass = computed(() =>
    host({
      opened: this.opened() && !this.hiding(),
      rounded: this.rounded(),
      iconOnly: this.iconOnly(),
    }),
  );
  readonly opened = signal(false);
  readonly selectedOption = computed(() =>
    this.options()?.find((o) => o.value === this.value()),
  );

  protected readonly faChevronDown = faChevronDown;
  protected readonly faMagnifyingGlass = faMagnifyingGlass;

  hiding = signal(false);
  filterText = signal('');
  filterLower = computed(() => this.filterText().toLowerCase());

  toggle(event?: Event): void {
    if (
      this.disabled() ||
      (event instanceof KeyboardEvent && !TOGGLE_KEYS.has(event.key))
    )
      return;

    if (this.opened()) {
      this.hiding.set(true);
      this.overlay().nativeElement.addEventListener('transitionend', () => {
        this.opened.set(false);
        this.hiding.set(false);
      });
    } else {
      this.opened.set(true);
      this.filterText.set('');
      this.focusAfterOpen(event);
    }

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
    // Don't need to worry about filter, none can be applied yet
    const options = this.options();
    let index = options.findIndex((o) => o.value === this.value());
    if (event instanceof KeyboardEvent) {
      switch (event.key) {
        case 'ArrowUp':
          if (index > 0) index--;
          break;
        case 'ArrowDown':
          if (index !== -1 && index < options.length - 1) index++;
          break;
        case 'Home':
          index = 0;
          break;
        case 'End':
          index = options.length - 1;
          break;
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
