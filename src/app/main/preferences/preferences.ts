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
  faArrowRotateLeft,
  faArrowUpRightFromSquare,
  faCircleInfo,
  faCopy,
  faDiagramProject,
  faEllipsisVertical,
  faExclamationTriangle,
  faFloppyDisk,
  faPencil,
  faPlus,
  faRotateLeft,
  faTableColumns,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { cva } from 'class-variance-authority';
import { map } from 'rxjs';

import { Button } from '~/components/button/button';
import { Checkbox } from '~/components/checkbox/checkbox';
import { ColumnsDialog } from '~/components/columns-dialog/columns-dialog';
import { Confirm } from '~/components/confirm/confirm';
import { FlowSettingsDialog } from '~/components/flow-settings-dialog/flow-settings-dialog';
import { FormField } from '~/components/form-field/form-field';
import { Select } from '~/components/select/select';
import { Tooltip } from '~/components/tooltip/tooltip';
import { powerUnitOptions } from '~/state/preferences/power-unit';
import {
  initialPreferencesState,
  PreferencesState,
} from '~/state/preferences/preferences-state';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { themeOptions } from '~/state/preferences/theme';
import { RouterSync } from '~/state/router/router-sync';
import { SettingsStore } from '~/state/settings/settings-store';
import { languageOptions } from '~/translate/language';
import { TranslatePipe } from '~/translate/translate-pipe';
import { WindowClient } from '~/window/window-client';

import { Hue } from './hue/hue';

const host = cva(
  'flex flex-col fixed z-6 top-0 right-0 h-full border-l border-gray-600 w-xs transition-transform bg-gray-950',
  {
    variants: {
      open: { false: 'translate-x-full' },
    },
  },
);

@Component({
  selector: 'aside[labPreferences], aside[lab-preferences]',
  exportAs: 'labPreferences',
  imports: [
    FormsModule,
    CdkMenuModule,
    FaIconComponent,
    Button,
    Checkbox,
    FormField,
    Hue,
    Select,
    Tooltip,
    TranslatePipe,
  ],
  templateUrl: './preferences.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
})
export class Preferences {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly dialog = inject(Dialog);
  private readonly confirm = inject(Confirm);
  protected readonly preferencesStore = inject(PreferencesStore);
  protected readonly routerSync = inject(RouterSync);
  protected readonly settingsStore = inject(SettingsStore);
  private readonly windowClient = inject(WindowClient);

  readonly open = signal(false);

  readonly hostClass = computed(() => host({ open: this.open() }));
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

  protected readonly apply = this.preferencesStore.apply.bind(
    this.preferencesStore,
  );
  protected readonly ColumnsDialog = ColumnsDialog;
  protected readonly faArrowRotateLeft = faArrowRotateLeft;
  protected readonly faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  protected readonly faCircleInfo = faCircleInfo;
  protected readonly faCopy = faCopy;
  protected readonly faDiagramProject = faDiagramProject;
  protected readonly faEllipsisVertical = faEllipsisVertical;
  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faPencil = faPencil;
  protected readonly faPlus = faPlus;
  protected readonly faTableColumns = faTableColumns;
  protected readonly faTrash = faTrash;
  protected readonly faXmark = faXmark;
  protected readonly FlowSettingsDialog = FlowSettingsDialog;
  protected readonly languageOptions = languageOptions;
  protected readonly powerUnitOptions = powerUnitOptions;
  protected readonly preferences = this.preferencesStore.state;
  protected readonly themeOptions = themeOptions;

  reset(): void {
    this.confirm
      .open({
        header: 'preferences.resetHeader',
        message: 'preferences.resetMessage',
        icon: faExclamationTriangle,
        actions: [
          { text: 'yes', value: 1, icon: faRotateLeft },
          { text: 'no', value: 2, icon: faTrash },
          { text: 'cancel', value: 0, icon: faXmark },
        ],
      })
      .subscribe((res) => {
        if (res === 1) {
          const state = initialPreferencesState as Partial<PreferencesState>;
          delete state.states; // Do not reset saved states
          this.preferencesStore.apply(state);
        } else if (res === 2) {
          this.windowClient.clearLocalStorage();
          this.router
            .navigate([this.settingsStore.modId()])
            .then(
              this.windowClient.reload.bind(this.windowClient),
              this.windowClient.reload.bind(this.windowClient),
            );
        }
      });
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
