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
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

import { IconType } from '~/data/icon-type';
import { resetTableParams } from '~/state/table/table-state';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Button } from '../button/button';
import { Control, LAB_CONTROL } from '../control';
import { Icon } from '../icon/icon';
import { Ripple } from '../ripple/ripple';
import { TabData } from './tab-data';

let nextUniqueId = 0;

@Component({
  selector: 'lab-tabs',
  imports: [
    RouterLink,
    RouterLinkActive,
    FaIconComponent,
    Button,
    Icon,
    Ripple,
    TranslatePipe,
  ],
  templateUrl: './tabs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'tablist',
    class:
      'group relative flex shrink-0 items-center overflow-hidden outline-none',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-disabled]': 'disabled() ? true : false',
    '[attr.aria-labelledby]': 'labelledBy() ?? null',
    '(keydown)': 'onKeydown($event)',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: Tabs,
    },
    { provide: LAB_CONTROL, useExisting: Tabs },
  ],
})
export class Tabs<T extends string = string>
  extends Control<T>
  implements AfterViewInit
{
  private readonly ref = inject(ChangeDetectorRef);
  private readonly injector = inject(Injector);
  private readonly tabElements =
    viewChildren<ElementRef<HTMLAnchorElement>>('tab');

  private uniqueId = (nextUniqueId++).toString();

  readonly controlId = input(`lab-tabs-${this.uniqueId}`);
  readonly value = model<T>();
  readonly disabled = model(false);
  readonly labelledBy = input<string>();
  readonly tabs = input.required<TabData<T>[]>();
  readonly type = input<IconType>();

  protected readonly faAngleLeft = faAngleLeft;
  protected readonly faAngleRight = faAngleRight;
  protected readonly resetTableParams = resetTableParams;

  readonly indicatorStyle = computed(() => {
    const tabs = this.tabs();
    const index = tabs.findIndex((o) => o.value === this.value());
    const el = this.tabElements()[index]?.nativeElement;
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
    this.checkAfterRender();
  }

  ngAfterViewInit(): void {
    this.checkAfterRender();
  }

  private checkAfterRender(): void {
    afterNextRender(
      () => {
        this.ref.markForCheck();
      },
      { injector: this.injector },
    );
  }

  select(tab: TabData<T>): void {
    this.setValue(tab.value);
    if (tab.command) tab.command();
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
    const el = this.tabElements()[0]?.nativeElement;
    if (el == null) return;
    el.click();
    el.scrollIntoView({ block: 'nearest' });
    event.preventDefault();
  }

  focusLast(event: KeyboardEvent): void {
    const items = this.tabElements();
    const el = items[items.length - 1]?.nativeElement;
    if (el == null) return;
    el.click();
    el.scrollIntoView({ block: 'nearest' });
    event.preventDefault();
  }

  focusMove(dir: -1 | 1, event: Event): void {
    const index = this.tabs().findIndex((o) => o.value === this.value());
    const el = this.tabElements()[index + dir]?.nativeElement;
    if (el == null) return;
    el.click();
    el.scrollIntoView({ block: 'nearest' });
    event.preventDefault();
  }
}
