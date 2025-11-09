import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
} from '@fortawesome/free-solid-svg-icons';

import { Option } from '~/option/option';
import { TableStore } from '~/state/table/table-store';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Button } from '../button/button';
import { Select } from '../select/select';

type PaginatorButton = 'first' | 'previous' | 'next' | 'last';

@Component({
  selector: 'lab-paginator',
  imports: [FormsModule, Button, Select, TranslatePipe],
  templateUrl: './paginator.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-center gap-2 justify-center w-full' },
})
export class Paginator {
  protected readonly tableStore = inject(TableStore);

  readonly total = input.required<number>();

  protected readonly label = computed(() => {
    const page = this.tableStore.page();
    const rows = this.tableStore.rows();
    const total = this.total();

    const first = Math.min(total, page * rows + 1);
    const last = Math.min(total, first + rows - 1);
    return { first, last, total };
  });

  protected readonly nextDisabled = computed(() => {
    const page = this.tableStore.page();
    const rows = this.tableStore.rows();
    const total = this.total();
    return (page + 1) * rows >= total;
  });

  protected readonly pageOptions = computed(() => {
    const page = this.tableStore.page();
    const rows = this.tableStore.rows();
    const total = this.total();
    const last = Math.floor(total / rows);
    const result: number[] = [page];
    for (let i = 1; i < last; i++) {
      if (page - i >= 0) result.unshift(page - i);
      if (page + i <= total) result.push(page + i);
      if (result.length >= 5) break;
    }
    return result;
  });

  protected readonly faAngleLeft = faAngleLeft;
  protected readonly faAnglesLeft = faAnglesLeft;
  protected readonly faAngleRight = faAngleRight;
  protected readonly faAnglesRight = faAnglesRight;
  protected readonly rowsOptions: Option<number>[] = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
  ];

  goToButton(button: PaginatorButton): void {
    const page = this.getPage(
      this.tableStore.page(),
      this.tableStore.rows(),
      this.total(),
      button,
    );
    this.tableStore.apply({ page });
  }

  private getPage(
    page: number,
    rows: number,
    total: number,
    button: PaginatorButton,
  ): number {
    switch (button) {
      case 'first':
        return 0;
      case 'previous':
        return --page;
      case 'next':
        return ++page;
      case 'last':
        return Math.floor(total / rows);
    }
  }
}
