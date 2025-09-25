import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowDownWideShort,
  faArrowRotateLeft,
  faArrowUpShortWide,
  faUpDown,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { Ripple } from '~/components/ripple/ripple';
import { Tooltip } from '~/components/tooltip/tooltip';
import { TranslatePipe } from '~/translate/translate-pipe';

import { SortColumn } from '../sort-column';
import { Steps } from '../steps';

@Component({
  selector: 'th[lab-sort-header], th[labSortHeader]',
  exportAs: 'labSortHeader',
  imports: [FaIconComponent, Button, Tooltip, TranslatePipe],
  templateUrl: './sort-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'cursor-pointer select-none hover:bg-gray-900 overflow-hidden has-[button:hover]:bg-transparent',
    '[class.text-brand-400]': 'steps.sort()?.[0] === column()',
    '(click)': 'steps.changeSort(column())',
  },
  hostDirectives: [Ripple],
})
export class SortHeader {
  protected readonly steps = inject(Steps);

  readonly text = input.required<string>();
  readonly column = input.required<SortColumn>();
  readonly showUndo = input<boolean>();
  readonly undoTooltip = input<string>();

  readonly undo = output();

  protected readonly icon = computed(() => {
    const sort = this.steps.sort();
    if (sort == null) return faUpDown;
    const [col, dir] = sort;
    if (col !== this.column()) return faUpDown;
    return dir === 1 ? faArrowDownWideShort : faArrowUpShortWide;
  });

  protected readonly faArrowRotateLeft = faArrowRotateLeft;

  protected undoClicked(event: MouseEvent): void {
    event.stopPropagation();
    this.undo.emit();
  }
}
