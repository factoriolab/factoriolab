import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { cva } from 'class-variance-authority';

const aside = cva(
  'fixed bg-gray-900 top-0 left-0 h-full border-r border-gray-700 w-80 transition-transform',
  {
    variants: {
      open: {
        false: '-translate-x-full',
      },
      xlHidden: {
        true: 'xl:-translate-x-full',
        false: 'xl:translate-none',
      },
    },
  },
);

@Component({
  selector: 'aside[labAside], aside[lab-aside]',
  exportAs: 'labAside',
  imports: [],
  templateUrl: './aside.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
})
export class Aside {
  readonly open = signal(false);
  readonly xlHidden = signal(false);
  readonly hostClass = computed(() =>
    aside({ open: this.open(), xlHidden: this.xlHidden() }),
  );
}
