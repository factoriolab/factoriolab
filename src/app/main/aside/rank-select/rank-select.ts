import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
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
  faGrip,
  faMagnifyingGlass,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { cva } from 'class-variance-authority';

import { Button } from '~/components/button/button';
import { Checkbox } from '~/components/checkbox/checkbox';
import { Control, LAB_CONTROL } from '~/components/control';
import { FormField } from '~/components/form-field/form-field';
import { Icon } from '~/components/icon/icon';
import { Ripple } from '~/components/ripple/ripple';
import { Rounded, roundedVariants } from '~/components/rounding';
import { Tooltip } from '~/components/tooltip/tooltip';
import { Option } from '~/option/option';
import { TranslatePipe } from '~/translate/translate-pipe';
import { areArraysEqual } from '~/utils/equality';

let nextUniqueId = 0;
const TOGGLE_KEYS = new Set(['Enter', 'ArrowDown', 'ArrowUp', 'Home', 'End']);

const host = cva(
  'inline-flex overflow-hidden grow cursor-pointer min-h-9 items-center select-none hover:border-brand-700 hover:z-2 focus-visible:border-brand-700 focus-visible:outline focus:z-2 group outline-brand-700 px-1',
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
      rounded: roundedVariants,
      disabled: { true: 'pointer-events-none' },
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
  selector: 'lab-rank-select',
  imports: [
    FormsModule,
    OverlayModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    FaIconComponent,
    Button,
    Checkbox,
    Icon,
    Ripple,
    Tooltip,
    TranslatePipe,
  ],
  templateUrl: './rank-select.html',
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
      useExisting: RankSelect,
    },
    { provide: LAB_CONTROL, useExisting: RankSelect },
  ],
})
export class RankSelect extends Control<string[]> {
  protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly overlayOrigin = inject(CdkOverlayOrigin);
  protected readonly formField = inject(FormField, { optional: true });
  private readonly injector = inject(Injector);

  readonly overlay = viewChild.required<ElementRef<HTMLDivElement>>('overlay');
  readonly listItems = viewChildren<ElementRef<HTMLLIElement>>('option');

  private uniqueId = (nextUniqueId++).toString();

  readonly controlId = input(`lab-select-${this.uniqueId}`);
  readonly value = model<string[]>();
  readonly disabled = model(false);
  readonly labelledBy = input<string>();
  readonly options = input.required<Option[]>();
  readonly placeholder = input<string>();
  readonly border = input(true);
  readonly rounded = input<Rounded>('all');

  protected readonly filterText = signal('');
  protected readonly dragging = signal(false);
  readonly opened = signal(false);
  protected readonly editValue = linkedSignal(() => this.value() ?? []);
  protected readonly hostClass = computed(() =>
    host({
      opened: this.opened(),
      border: this.border(),
      rounded: this.rounded(),
      disabled: this.disabled(),
    }),
  );
  protected readonly allSelected = computed(() => {
    if (this.options().length === this.editValue().length) return true;
    if (this.editValue().length === 0) return false;
    return undefined;
  });
  protected readonly sortedOptions = computed(() => {
    const options = [...this.options()];
    const editValue = this.editValue();
    return options.sort(
      (a, b) =>
        this.sortIndex(a.value, editValue) - this.sortIndex(b.value, editValue),
    );
  });
  protected readonly filterLower = computed(() =>
    this.filterText().toLowerCase(),
  );

  protected readonly faChevronDown = faChevronDown;
  protected readonly faGrip = faGrip;
  protected readonly faMagnifyingGlass = faMagnifyingGlass;
  protected readonly faXmark = faXmark;

  toggle(event?: Event): void {
    if (
      this.disabled() ||
      this.dragging() ||
      (event instanceof KeyboardEvent && !TOGGLE_KEYS.has(event.key))
    )
      return;

    if (this.opened()) {
      this.opened.set(false);
      const value = this.value();
      const editValue = this.editValue();
      if (!areArraysEqual(value, editValue)) this.setValue(editValue);
    } else {
      this.opened.set(true);
      this.filterText.set('');
      this.editValue.set(this.value() ?? []);
      this.focusAfterOpen(event);
    }

    event?.preventDefault();
  }

  select(value: string): void {
    this.editValue.update((rank) => {
      if (rank.includes(value)) return rank.filter((r) => r !== value);
      return [...rank, value];
    });
  }

  selectAll(value: boolean | undefined): void {
    if (value) this.editValue.set(this.options().map((o) => o.value));
    else this.editValue.set([]);
  }

  drop(event: CdkDragDrop<string[]>): void {
    this.editValue.update((rank) => {
      rank = [...rank];
      moveItemInArray(rank, event.previousIndex, event.currentIndex);
      return rank;
    });
  }

  focusFirst(event: Event): void {
    const el = this.listItems()[0]?.nativeElement;
    if (el == null) return;
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

  private sortIndex(value: string, rank: string[]): number {
    const index = rank.indexOf(value);
    if (index === -1) return Number.MAX_SAFE_INTEGER;
    return index;
  }

  private focusAfterOpen(event?: Event): void {
    // Determine which element to focus
    // Don't need to worry about filter, none can be applied yet
    const options = this.options();
    let index = 0;
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
