import {
  afterNextRender,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  viewChildren,
} from '@angular/core';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

import { IconType } from '~/data/icon-type';
import { Option } from '~/models/option';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Button } from '../button/button';
import { Control } from '../control';
import { Icon } from '../icon/icon';

let nextUniqueId = 0;

@Component({
  selector: 'lab-tabs',
  imports: [Button, Icon, TranslatePipe],
  templateUrl: './tabs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'tablist',
    class:
      'flex items-center relative group overflow-hidden outline-none shrink-0',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-disabled]': 'disabled() ? true : false',
    '(keydown)': 'onKeydown($event)',
  },
})
export class Tabs<T> extends Control<T> implements AfterViewInit {
  private readonly ref = inject(ChangeDetectorRef);
  private readonly injector = inject(Injector);
  private readonly tabs = viewChildren<ElementRef<HTMLAnchorElement>>('tab');

  private uniqueId = (nextUniqueId++).toString();

  readonly id = input(`lab-tabs-${this.uniqueId}`);
  readonly value = model<T>();
  readonly options = input.required<Option<T>[]>();
  readonly disabled = model(false);
  readonly type = input<IconType>();
  readonly iconLocator = input<(value: T) => string>((v) => v as string);

  protected readonly faAngleLeft = faAngleLeft;
  protected readonly faAngleRight = faAngleRight;

  indicatorStyle = computed(() => {
    const options = this.options();
    const index = options.findIndex((o) => o.value === this.value());
    const el = this.tabs()[index]?.nativeElement;
    if (el == null) return;
    /**
     * Note: Return this as a function so that the selected element's properties
     * are re-checked during each change detection cycle
     */
    return (): Record<string, string> => ({
      left: `${el.offsetLeft}px`,
      width: `${el.offsetWidth}px`,
    });
  });

  scrollNext(el: HTMLDivElement, dir: -1 | 1): void {
    el.scrollLeft += el.offsetWidth * 0.8 * dir;
  }

  onScrollEnd(): void {
    afterNextRender(
      () => {
        this.ref.markForCheck();
      },
      { injector: this.injector },
    );
  }

  ngAfterViewInit(): void {
    this.ref.markForCheck();
  }

  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        this.focusMove(-1, event);
        break;
      case 'ArrowRight':
        this.focusMove(1, event);
        break;
      case 'Home':
        this.focusFirst(event);
        break;
      case 'End':
        this.focusLast(event);
        break;
    }
  }

  focusFirst(event: KeyboardEvent): void {
    const el = this.tabs()[0]?.nativeElement;
    if (el == null) return;
    el.click();
    el.scrollIntoView({ block: 'nearest' });
    event.preventDefault();
  }

  focusLast(event: KeyboardEvent): void {
    const items = this.tabs();
    const el = items[items.length - 1]?.nativeElement;
    if (el == null) return;
    el.click();
    el.scrollIntoView({ block: 'nearest' });
    event.preventDefault();
  }

  focusMove(dir: -1 | 1, event: Event): void {
    const index = this.options().findIndex((o) => o.value === this.value());
    const el = this.tabs()[index + dir]?.nativeElement;
    if (el == null) return;
    el.click();
    el.scrollIntoView({ block: 'nearest' });
    event.preventDefault();
  }
}
