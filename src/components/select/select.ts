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
  viewChildren,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

import { IdType } from '~/models/icon-type';
import { Option } from '~/models/option';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Control } from '../control';
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
      'flex cursor-pointer min-h-9 items-center px-1 gap-1 select-none bg-gray-950 rounded-sm border border-gray-700 outline-none focus-visible:border-brand-500',
    '[attr.id]': 'id()',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.aria-controls]': 'opened() ? id() + "-listbox" : null',
    '[attr.aria-expanded]': 'opened()',
    '(keydown.enter)': 'toggle()',
    '(keydown.arrowdown)': 'focusFirst()',
    '(keydown.arrowup)': 'focusLast()',
    '(keydown.home)': 'focusFirst()',
    '(keydown.end)': 'focusLast()',
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
  private listItems = viewChildren<ElementRef<HTMLLIElement>>('option');

  private uniqueId = (nextUniqueId++).toString();

  id = input(`lab-select-${this.uniqueId}`);
  value = model<T | undefined>();
  test = model<number>();
  disabled = model(false);
  options = input<Option<T>[]>();
  type = input<IdType>();

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
    this.elementRef.nativeElement.focus();
  }

  select(value: T): void {
    this.toggle();
    this.setValue(value);
  }

  focusFirst(): void {
    this.listItems()[0]?.nativeElement.focus();
  }

  focusLast(): void {
    const items = this.listItems();
    items[items.length - 1].nativeElement.focus();
  }

  focusMove(option: HTMLLIElement, dir: -1 | 1): void {
    const index = this.listItems().findIndex((i) => i.nativeElement === option);
    this.listItems()[index + dir]?.nativeElement.focus();
  }

  // TODO: Search input?
  // TODO: Icon support
  // TODO: Tooltip support
}
