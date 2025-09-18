import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowDownWideShort,
  faArrowUpShortWide,
  faUpDown,
} from '@fortawesome/free-solid-svg-icons';

import { TranslatePipe } from '~/translate/translate-pipe';

import { SortColumn } from '../sort-column';
import { Steps } from '../steps';

@Component({
  selector: 'th[lab-sort-header], th[labSortHeader]',
  imports: [FaIconComponent, TranslatePipe],
  templateUrl: './sort-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'cursor-pointer select-none hover:bg-gray-700',
    '[class.text-brand-400]': 'steps.sort()?.[0] === column()',
    '(click)': 'steps.changeSort(column())',
  },
})
export class SortHeader {
  protected readonly steps = inject(Steps);

  readonly text = input.required<string>();
  readonly column = input.required<SortColumn>();

  protected readonly icon = computed(() => {
    const sort = this.steps.sort();
    if (sort == null) return faUpDown;
    const [col, dir] = sort;
    if (col !== this.column()) return faUpDown;
    return dir === 1 ? faArrowDownWideShort : faArrowUpShortWide;
  });
}
