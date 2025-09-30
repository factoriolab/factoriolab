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
  linkedSignal,
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

import { Option } from '~/option/option';
import { TranslatePipe } from '~/translate/translate-pipe';
import { areArraysEqual } from '~/utils/equality';

import { Checkbox } from '../checkbox/checkbox';
import { Control, LAB_CONTROL } from '../control';
import { FormField } from '../form-field/form-field';
import { Icon } from '../icon/icon';
import { Ripple } from '../ripple/ripple';
import { Tooltip } from '../tooltip/tooltip';

let nextUniqueId = 0;
const TOGGLE_KEYS = new Set(['Enter', 'ArrowDown', 'ArrowUp', 'Home', 'End']);

const host = cva(
  'inline-flex overflow-hidden grow cursor-pointer min-h-9 items-center select-none hover:border-brand-700 hover:z-2 focus-visible:border-brand-700 focus-visible:outline focus:z-2 group',
  {
    variants: {
      opened: {
        true: 'border-brand-700 outline z-2',
        false: 'border-gray-700',
      },
      border: {
        true: 'border',
        false: 'hover:border',
      },
      rounded: {
        true: 'rounded-xs',
      },
      iconOnly: {
        true: 'min-w-9 justify-center hover:bg-gray-800 outline-brand-700 grow-0',
        false: 'outline-brand-700 px-1',
      },
      disabled: {
        true: 'pointer-events-none',
      },
    },
    compoundVariants: [
      {
        border: false,
        opened: true,
        class: 'border',
      },
    ],
  },
);

@Component({
  selector: 'lab-select',
  imports: [
    FormsModule,
    OverlayModule,
    FaIconComponent,
    Checkbox,
    Icon,
    Ripple,
    Tooltip,
    TranslatePipe,
  ],
  templateUrl: './select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'combobox',
    '[class]': 'hostClass()',
    '[attr.id]': 'controlId()',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.aria-controls]': 'opened() ? controlId() + "-listbox" : null',
    '[attr.aria-expanded]': 'opened()',
    '[attr.aria-labelledby]': 'labelledBy() ?? formField?.labelId ?? null',
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
  protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly overlayOrigin = inject(CdkOverlayOrigin);
  protected readonly formField = inject(FormField, { optional: true });
  private readonly injector = inject(Injector);

  readonly overlay = viewChild.required<ElementRef<HTMLDivElement>>('overlay');
  readonly listItems = viewChildren<ElementRef<HTMLLIElement>>('option');

  private uniqueId = (nextUniqueId++).toString();

  readonly controlId = input(`lab-select-${this.uniqueId}`);
  readonly value = model<T>();
  readonly options = input.required<Option<T>[]>();
  readonly disabled = model(false);
  readonly placeholder = input<string>();
  readonly border = input(true);
  readonly rounded = input(true);
  readonly filter = input<boolean>(false);
  readonly iconOnly = input<boolean>(false);
  readonly labelledBy = input<string>();

  readonly filterText = signal('');
  readonly opened = signal(false);

  readonly selection = linkedSignal(() => {
    const value = this.value();
    return new Set(Array.isArray(value) ? value : null);
  });

  readonly hostClass = computed(() =>
    host({
      opened: this.opened(),
      border: this.border(),
      rounded: this.rounded(),
      iconOnly: this.iconOnly(),
      disabled: this.disabled(),
    }),
  );
  readonly multi = computed(() => Array.isArray(this.value()));
  readonly allSelected = computed(() => {
    if (this.options().length === this.selection().size) return true;
    if (this.selection().size === 0) return false;
    return undefined;
  });
  readonly selectedOption = computed(() =>
    this.options()?.find((o) => o.value === this.value()),
  );
  readonly filterLower = computed(() => this.filterText().toLowerCase());

  protected readonly faChevronDown = faChevronDown;
  protected readonly faMagnifyingGlass = faMagnifyingGlass;

  toggle(event?: Event): void {
    if (
      this.disabled() ||
      (event instanceof KeyboardEvent && !TOGGLE_KEYS.has(event.key))
    )
      return;

    if (this.opened()) {
      this.opened.set(false);
      if (this.multi()) {
        const next = Array.from(this.selection());
        if (!areArraysEqual(next, this.value() as unknown[]))
          this.setValue(Array.from(this.selection()) as unknown as T);
      }
    } else {
      this.opened.set(true);
      this.filterText.set('');
      this.focusAfterOpen(event);
    }

    event?.preventDefault();
  }

  select(value: T): void {
    if (this.multi()) {
      this.selection.update((s) => {
        const result = new Set(s);
        if (result.has(value)) result.delete(value);
        else result.add(value);
        return result;
      });
    } else {
      this.toggle();
      this.setValue(value);
    }
  }

  selectAll(value: boolean | undefined): void {
    if (!this.multi() || value == null) return;
    if (value) this.selection.set(new Set(this.options().map((o) => o.value)));
    else this.selection.set(new Set());
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
    if (this.multi()) index = 0;
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
