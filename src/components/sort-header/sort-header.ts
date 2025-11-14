import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
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
import { TableState } from '~/state/table/table-state';
import { TranslatePipe } from '~/translate/translate-pipe';
import { updateApply } from '~/utils/signal';

@Component({
  selector: 'th[lab-sort-header], th[labSortHeader]',
  exportAs: 'labSortHeader',
  imports: [FaIconComponent, Button, Tooltip, TranslatePipe],
  templateUrl: './sort-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'cursor-pointer overflow-hidden select-none hover:bg-gray-900 has-[button:hover]:bg-transparent',
    '[class.text-brand-400]': 'state().sort === column()',
    '(click)': 'updateApply(state, nextSort())',
  },
  hostDirectives: [Ripple],
})
export class SortHeader {
  readonly text = input.required<string>();
  readonly column = input.required<string>();
  readonly state = model.required<TableState>();
  readonly defaultAscending = input(false);
  readonly showUndo = input<boolean>();
  readonly undoTooltip = input<string>();

  readonly undo = output();

  protected readonly faArrowRotateLeft = faArrowRotateLeft;
  protected readonly updateApply = updateApply;

  protected readonly icon = computed(() => {
    const state = this.state();
    if (state.sort !== this.column()) return faUpDown;

    return state.asc ? faArrowUpShortWide : faArrowDownWideShort;
  });

  protected readonly nextSort = computed((): Partial<TableState> => {
    const state = this.state();
    const column = this.column();
    const defaultAscending = this.defaultAscending();
    if (state.sort === column) {
      if (state.asc !== defaultAscending)
        return { sort: undefined, asc: false };
      return { asc: !defaultAscending };
    }

    return { sort: column, asc: defaultAscending };
  });

  protected undoClicked(event: MouseEvent): void {
    event.stopPropagation();
    this.undo.emit();
  }
}
