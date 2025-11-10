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
import { TableStore } from '~/state/table/table-store';
import { TranslatePipe } from '~/translate/translate-pipe';

@Component({
  selector: 'th[lab-sort-header], th[labSortHeader]',
  exportAs: 'labSortHeader',
  imports: [FaIconComponent, Button, Tooltip, TranslatePipe],
  templateUrl: './sort-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'cursor-pointer select-none hover:bg-gray-900 overflow-hidden has-[button:hover]:bg-transparent',
    '[class.text-brand-400]': 'tableStore.sort() === column()',
    '(click)': 'tableStore.setSort(column())',
  },
  hostDirectives: [Ripple],
})
export class SortHeader {
  protected readonly tableStore = inject(TableStore);

  readonly text = input.required<string>();
  readonly column = input.required<string>();
  readonly showUndo = input<boolean>();
  readonly undoTooltip = input<string>();

  readonly undo = output();

  protected readonly icon = computed(() => {
    const sort = this.tableStore.sort();
    if (sort !== this.column()) return faUpDown;

    return this.tableStore.asc() ? faArrowUpShortWide : faArrowDownWideShort;
  });

  protected readonly faArrowRotateLeft = faArrowRotateLeft;

  protected undoClicked(event: MouseEvent): void {
    event.stopPropagation();
    this.undo.emit();
  }
}
