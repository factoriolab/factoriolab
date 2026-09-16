import {
  CdkDrag,
  CdkDragDrop,
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
} from '@fortawesome/free-solid-svg-icons';
import { cva } from 'class-variance-authority';

import { Checkbox } from '~/components/checkbox/checkbox';
import { Control } from '~/components/control';
import { FormField } from '~/components/form-field/form-field';
import { Icon } from '~/components/icon/icon';
import { Ripple } from '~/components/ripple/ripple';
import { Rounded, roundedVariants } from '~/components/rounding';
import { Tooltip } from '~/components/tooltip/tooltip';
import { Option } from '~/option/option';
import { OptionPipe } from '~/option/option-pipe';
import { Translate } from '~/translate/translate';
import { TranslatePipe } from '~/translate/translate-pipe';
import { areArraysEqual } from '~/utils/equality';

let nextUniqueId = 0;
const TOGGLE_KEYS = new Set(['Enter', 'ArrowDown', 'ArrowUp', 'Home', 'End']);

const host = cva(
  'group min-h-9 px-2 inline-flex grow cursor-pointer items-center overflow-hidden bg-gray-950/75 outline-brand-400 select-none hover:z-2 hover:border-brand-400 focus:z-2 focus-visible:border-brand-400 focus-visible:outline',
  {
    variants: {
      opened: {
        true: 'z-2 border-brand-400 outline',
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
    CdkDrag,
    CdkDropList,
    OverlayModule,
    FaIconComponent,
    Checkbox,
    Icon,
    OptionPipe,
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
    { provide: Control, useExisting: RankSelect },
  ],
})
export class RankSelect extends Control<string[]> {
  protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly overlayOrigin = inject(CdkOverlayOrigin);
  protected readonly formField = inject(FormField, { optional: true });
  private readonly injector = inject(Injector);
  private readonly translate = inject(Translate);

  protected readonly listItems =
    viewChildren<ElementRef<HTMLLIElement>>('option');
  protected readonly filterInput =
    viewChild<ElementRef<HTMLInputElement>>('filterInput');

  private readonly uniqueId = (nextUniqueId++).toString();

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
  protected readonly filterLower = computed(() =>
    this.filterText().toLocaleLowerCase(),
  );
  protected readonly filteredOptions = computed(() => {
    const options = this.options();
    const filterLower = this.filterLower();
    if (!filterLower) return options;
    return options.filter((o) =>
      this.translate.get(o.label).toLocaleLowerCase().includes(filterLower),
    );
  });
  protected readonly allSelected = computed(() => {
    const value = this.editValue();
    const filteredOptions = this.filteredOptions();
    const filteredSelection = filteredOptions.filter((o) =>
      value.includes(o.value),
    );
    if (filteredSelection.length === 0) return false;
    if (filteredSelection.length === filteredOptions.length) return true;
    return undefined;
  });

  protected readonly faChevronDown = faChevronDown;
  protected readonly faGrip = faGrip;
  protected readonly faMagnifyingGlass = faMagnifyingGlass;

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
      this.focusAfterOpen();
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
    if (value) this.editValue.set(this.filteredOptions().map((o) => o.value));
    else this.editValue.set([]);
  }

  keydown(opt: Option, el: HTMLLIElement, event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter': {
        this.select(opt.value);
        break;
      }
      case 'ArrowUp': {
        this.focusMove(el, -1, event);
        break;
      }
      case 'ArrowDown': {
        this.focusMove(el, 1, event);
        break;
      }
      case 'Home': {
        this.focusFirst(event);
        break;
      }
      case 'End': {
        this.focusLast(event);
        break;
      }
      default: {
        this.filterInput()?.nativeElement.focus();
        break;
      }
    }
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

  private focusAfterOpen(): void {
    afterNextRender(
      () => {
        const el = this.listItems()[0]?.nativeElement;
        if (el == null) return;
        el.scrollIntoView();
        el.focus();
      },
      { injector: this.injector },
    );
  }
}
