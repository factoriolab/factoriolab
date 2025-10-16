import { Dialog } from '@angular/cdk/dialog';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
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
  faArrowTrendUp,
  faArrowUpRightFromSquare,
  faBoxesStacked,
  faChevronDown,
  faCircleInfo,
  faCopy,
  faEllipsisVertical,
  faFlaskVial,
  faFloppyDisk,
  faGrip,
  faIndustry,
  faInfo,
  faMicrochip,
  faPencil,
  faPlus,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { cva } from 'class-variance-authority';
import { map } from 'rxjs';

import { AccordionModule } from '~/components/accordion/accordion-module';
import { BeaconsSelect } from '~/components/beacons-select/beacons-select';
import { Button } from '~/components/button/button';
import { Checkbox } from '~/components/checkbox/checkbox';
import { FormField } from '~/components/form-field/form-field';
import { Icon } from '~/components/icon/icon';
import { InputNumber } from '~/components/input-number/input-number';
import { ModulesSelect } from '~/components/modules-select/modules-select';
import { Picker } from '~/components/picker/picker';
import { Select } from '~/components/select/select';
import { Tooltip } from '~/components/tooltip/tooltip';
import { Game, gameOptions } from '~/data/game';
import { gameInfo } from '~/data/game-info';
import { FilterOptionsPipe } from '~/option/filter-options-pipe';
import { OptionPipe } from '~/option/option-pipe';
import { rational } from '~/rational/rational';
import { BeaconSettings } from '~/state/beacon-settings';
import { Hydration } from '~/state/hydration';
import { MachinesStore } from '~/state/machines/machines-store';
import { ModuleSettings } from '~/state/module-settings';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { RouterSync } from '~/state/router/router-sync';
import { inserterCapacityOptions } from '~/state/settings/inserter-capacity';
import { inserterTargetOptions } from '~/state/settings/inserter-target';
import { researchBonusOptions } from '~/state/settings/research-bonus';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';
import { WindowClient } from '~/window/window-client';

import { RankSelect } from './rank-select/rank-select';
import { RecipeProductivityDialog } from './recipe-productivity-dialog/recipe-productivity-dialog';
import { TechnologiesDialog } from './technologies-dialog/technologies-dialog';
import { VersionsDialog } from './versions-dialog/versions-dialog';

const host = cva(
  'flex flex-col fixed z-6 top-0 left-0 h-full border-r border-gray-600 w-xs transition-transform bg-gray-950',
  {
    variants: {
      open: { false: '-translate-x-full' },
      xlHidden: { true: 'xl:-translate-x-full', false: 'xl:translate-none' },
    },
  },
);

@Component({
  selector: 'aside[labSettings], aside[lab-settings]',
  exportAs: 'labSettings',
  imports: [
    FormsModule,
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    CdkMenuModule,
    FaIconComponent,
    AccordionModule,
    BeaconsSelect,
    Button,
    Checkbox,
    FilterOptionsPipe,
    FormField,
    Icon,
    InputNumber,
    ModulesSelect,
    OptionPipe,
    RankSelect,
    Select,
    Tooltip,
    TranslatePipe,
  ],
  templateUrl: './settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
})
export class Settings {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);
  private readonly hydration = inject(Hydration);
  protected readonly machinesStore = inject(MachinesStore);
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
  protected readonly faArrowTrendUp = faArrowTrendUp;
  protected readonly faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  protected readonly faBoxesStacked = faBoxesStacked;
  protected readonly faChevronDown = faChevronDown;
  protected readonly faCircleInfo = faCircleInfo;
  protected readonly faCopy = faCopy;
  protected readonly faEllipsisVertical = faEllipsisVertical;
  protected readonly faFlaskVial = faFlaskVial;
  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faGrip = faGrip;
  protected readonly faIndustry = faIndustry;
  protected readonly faInfo = faInfo;
  protected readonly faMicrochip = faMicrochip;
  protected readonly faPencil = faPencil;
  protected readonly faPlus = faPlus;
  protected readonly faTrash = faTrash;
  protected readonly faXmark = faXmark;
  protected readonly gameOptions = gameOptions;
  protected readonly inserterCapacityOptions = inserterCapacityOptions;
  protected readonly inserterTargetOptions = inserterTargetOptions;
  protected readonly options = this.settingsStore.options;
  protected readonly rational = rational;
  protected readonly researchBonusOptions = researchBonusOptions;
  protected readonly settings = this.settingsStore.settings;

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
    this.dialog.open(VersionsDialog, {
      data: { header: 'settings.modVersions' },
    });
  }

  openTechnologies(): void {
    this.dialog.open(TechnologiesDialog, {
      data: { header: 'technologies.header' },
    });
  }

  addMachine(machineId: string): void {
    const settings = this.settings();
    const ids = [...settings.machineRankIds, machineId];
    this.settingsStore.updateField(
      'machineRankIds',
      ids,
      settings.defaultMachineRankIds,
    );
  }

  changeMachine(index: number, value: string): void {
    const settings = this.settings();
    const machineRankIds = [...settings.machineRankIds];
    machineRankIds[index] = value;
    this.settingsStore.updateField(
      'machineRankIds',
      machineRankIds,
      settings.defaultMachineRankIds,
    );
  }

  dropMachine(event: CdkDragDrop<string[]>): void {
    const settings = this.settings();
    const machineRankIds = [...settings.machineRankIds];
    moveItemInArray(machineRankIds, event.previousIndex, event.currentIndex);
    this.settingsStore.updateField(
      'machineRankIds',
      machineRankIds,
      settings.defaultMachineRankIds,
    );
  }

  changeModules(machineId: string, value: ModuleSettings[]): void {
    const modules = this.hydration.dehydrateModules(
      value,
      coalesce(this.machinesStore.settings()[machineId].moduleOptions, []),
      this.settings().moduleRankIds,
      this.data().machineRecord[machineId].modules,
    );
    this.machinesStore.updateRecord(machineId, { modules });
  }

  changeBeacons(machineId: string, value: BeaconSettings[]): void {
    const def = this.settings().beacons;
    const beacons = this.hydration.dehydrateBeacons(value, def);
    this.machinesStore.updateRecord(machineId, { beacons });
  }

  removeMachine(id: string): void {
    const settings = this.settings();
    const ids = settings.machineRankIds.filter((i) => i !== id);
    this.settingsStore.updateField(
      'machineRankIds',
      ids,
      settings.defaultMachineRankIds,
    );
  }

  openRecipeProductivity(): void {
    this.dialog.open(RecipeProductivityDialog, {
      data: { header: 'settings.recipeProductivity' },
    });
  }
}
