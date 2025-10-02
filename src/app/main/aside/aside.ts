import { CdkMenuModule } from '@angular/cdk/menu';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  faArrowUpRightFromSquare,
  faCheck,
  faCopy,
  faEllipsisVertical,
  faExclamationTriangle,
  faFloppyDisk,
  faPencil,
  faPlus,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { cva } from 'class-variance-authority';
import { filter, map, switchMap } from 'rxjs';

import { AccordionModule } from '~/components/accordion/accordion-module';
import { Button } from '~/components/button/button';
import { Confirm } from '~/components/confirm/confirm';
import { Select } from '~/components/select/select';
import { Tooltip } from '~/components/tooltip/tooltip';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { RouterSync } from '~/state/router/router-sync';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';
import { WindowClient } from '~/window/window-client';

const host = cva(
  'flex flex-col fixed z-6 top-0 left-0 h-full border-r border-gray-700 w-xs transition-transform',
  {
    variants: {
      open: { false: '-translate-x-full' },
      xlHidden: { true: 'xl:-translate-x-full', false: 'xl:translate-none' },
    },
  },
);

@Component({
  selector: 'aside[labAside], aside[lab-aside]',
  exportAs: 'labAside',
  imports: [
    FormsModule,
    CdkMenuModule,
    AccordionModule,
    Button,
    Select,
    Tooltip,
    TranslatePipe,
  ],
  templateUrl: './aside.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
})
export class Aside {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirm = inject(Confirm);
  protected readonly preferencesStore = inject(PreferencesStore);
  private readonly routerSync = inject(RouterSync);
  protected readonly settingsStore = inject(SettingsStore);
  protected readonly windowClient = inject(WindowClient);

  readonly open = signal(false);
  readonly xlHidden = signal(false);
  readonly hostClass = computed(() =>
    host({ open: this.open(), xlHidden: this.xlHidden() }),
  );
  readonly params = toSignal(
    this.route.queryParams.pipe(map(() => window.location.search.substring(1))),
  );
  readonly state = linkedSignal(() => {
    const params = this.params();
    const states = this.settingsStore.modStates();
    return Object.keys(states).find((s) => states[s] === params);
  });
  readonly editStatus = signal<'create' | 'edit' | null>(null);
  readonly editValue = signal('');

  protected readonly faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  protected readonly faCopy = faCopy;
  protected readonly faEllipsisVertical = faEllipsisVertical;
  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faPencil = faPencil;
  protected readonly faPlus = faPlus;
  protected readonly faTrash = faTrash;
  protected readonly faXmark = faXmark;

  reset(): void {
    this.confirm
      .show({
        header: 'aside.reset',
        message: 'aside.resetWarning',
        icon: faExclamationTriangle,
        actions: [
          { text: 'cancel', value: false, icon: faXmark },
          { text: 'yes', value: true, icon: faCheck },
        ],
      })
      .pipe(
        filter((result) => !!result),
        switchMap(() => {
          localStorage.clear();
          return this.router.navigate([this.settingsStore.modId()]);
        }),
      )
      .subscribe(() => {
        this.windowClient.reload();
      });
  }

  setParams(params: string): void {
    const tree = this.router.parseUrl(this.router.url);
    const urlParams = new URLSearchParams(params);
    urlParams.forEach((value, key) => (tree.queryParams[key] = value));
    void this.router.navigateByUrl(tree);
  }

  saveState(): void {
    const editValue = this.editValue();
    const editState = this.editStatus();
    const params = this.params();
    if (!editValue || !editState || params == null) return;

    const modId = this.settingsStore.dataset().modId;
    this.preferencesStore.saveState(modId, editValue, params);

    const state = this.state();
    if (editState === 'edit' && state)
      this.preferencesStore.removeState(modId, state);

    this.editStatus.set(null);
    this.state.set(editValue);
  }

  async setState(id: string): Promise<void> {
    const states = this.settingsStore.modStates();
    const query = states[id];
    if (!query) return;
    await this.router.navigate([], {
      queryParams: this.routerSync.toParams(query),
    });
    this.state.set(id);
  }

  createState(): void {
    this.editValue.set('');
    this.editStatus.set('create');
  }

  editState(state: string): void {
    this.editValue.set(state);
    this.editStatus.set('edit');
  }

  deleteState(state: string): void {
    this.preferencesStore.removeState(
      this.settingsStore.dataset().modId,
      state,
    );
    this.state.set('');
  }
}
