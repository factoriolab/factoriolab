import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { cva } from 'class-variance-authority';

import { PreferencesStore } from '~/state/preferences/preferences-store';

const host = cva(
  'flex flex-col fixed z-2 bg-gray-900 top-0 left-0 h-full border-r border-gray-700 w-80 transition-transform',
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
  imports: [FormsModule],
  templateUrl: './aside.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
})
export class Aside {
  readonly preferencesStore = inject(PreferencesStore);

  readonly open = signal(false);
  readonly xlHidden = signal(false);
  readonly hostClass = computed(() =>
    host({ open: this.open(), xlHidden: this.xlHidden() }),
  );
}
