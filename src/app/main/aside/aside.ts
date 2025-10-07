import { Dialog } from '@angular/cdk/dialog';
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
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowUpRightFromSquare,
  faBoxesStacked,
  faCheck,
  faChevronDown,
  faCopy,
  faEllipsisVertical,
  faExclamationTriangle,
  faFlaskVial,
  faFloppyDisk,
  faInfo,
  faMicrochip,
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
import { FormField } from '~/components/form-field/form-field';
import { Icon } from '~/components/icon/icon';
import { Picker } from '~/components/picker/picker';
import { Select } from '~/components/select/select';
import { Tooltip } from '~/components/tooltip/tooltip';
import { Game, gameOptions } from '~/data/game';
import { gameInfo } from '~/data/game-info';
import { OptionPipe } from '~/option/option-pipe';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { RouterSync } from '~/state/router/router-sync';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';
import { WindowClient } from '~/window/window-client';

import { TechnologiesDialog } from './technologies-dialog/technologies-dialog';
import { VersionsDialog } from './versions-dialog/versions-dialog';

const host = cva(
  'flex flex-col fixed z-6 top-0 left-0 h-full border-r border-gray-700 w-xs transition-transform bg-gray-950',
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
    FaIconComponent,
    AccordionModule,
    Button,
    FormField,
    Icon,
    OptionPipe,
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
  private readonly dialog = inject(Dialog);
  private readonly confirm = inject(Confirm);
  protected readonly picker = inject(Picker);
  protected readonly preferencesStore = inject(PreferencesStore);
  protected readonly routerSync = inject(RouterSync);
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

  protected readonly data = this.settingsStore.dataset;
  protected readonly faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  protected readonly faBoxesStacked = faBoxesStacked;
  protected readonly faChevronDown = faChevronDown;
  protected readonly faCopy = faCopy;
  protected readonly faEllipsisVertical = faEllipsisVertical;
  protected readonly faFlaskVial = faFlaskVial;
  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faInfo = faInfo;
  protected readonly faMicrochip = faMicrochip;
  protected readonly faPencil = faPencil;
  protected readonly faPlus = faPlus;
  protected readonly faTrash = faTrash;
  protected readonly faXmark = faXmark;
  protected readonly gameOptions = gameOptions;
  protected readonly settings = this.settingsStore.settings;

  reset(): void {
    this.confirm
      .open({
        header: 'aside.reset',
        message: 'aside.resetWarning',
        icon: faExclamationTriangle,
        actions: [
          { text: 'yes', value: true, icon: faCheck },
          { text: 'cancel', value: false, icon: faXmark },
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
    this.preferencesStore.removeState(this.data().modId, state);
    this.state.set('');
  }

  setGame(game: Game): void {
    this.setMod(gameInfo[game].modId);
  }

  setMod(modId: string): void {
    void this.router.navigate([modId, 'list']);
  }

  openVersions(): void {
    this.dialog.open(VersionsDialog, { data: { header: 'aside.modVersions' } });
  }

  openTechnologies(): void {
    this.dialog.open(TechnologiesDialog, {
      data: { header: 'technologies.header' },
    });
  }
}
