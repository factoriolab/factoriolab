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
  faDollar,
  faFlaskVial,
  faGrip,
  faIndustry,
  faInfo,
  faMicrochip,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { cva } from 'class-variance-authority';
import { filter, map } from 'rxjs';

import { AccordionModule } from '~/components/accordion/accordion-module';
import { BeaconsSelect } from '~/components/beacons-select/beacons-select';
import { Button } from '~/components/button/button';
import { Checkbox } from '~/components/checkbox/checkbox';
import { CustomDataDialog } from '~/components/custom-data-dialog/custom-data-dialog';
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
import { maximizeTypeOptions } from '~/state/settings/maximize-type';
import { researchBonusOptions } from '~/state/settings/research-bonus';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';
import { WindowClient } from '~/window/window-client';

import { CostSettingsDialog } from './cost-settings-dialog/cost-settings-dialog';
import { RankSelect } from './rank-select/rank-select';
import { RecipeProductivityDialog } from './recipe-productivity-dialog/recipe-productivity-dialog';
import { TechnologiesDialog } from './technologies-dialog/technologies-dialog';
import { VersionsDialog } from './versions-dialog/versions-dialog';

const host = cva(
  'fixed top-0 left-0 z-6 flex h-full w-xs flex-col border-r border-gray-600 bg-gray-950 transition-transform',
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
  protected readonly dialog = inject(Dialog);
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
  protected readonly miningSpeed = computed(() =>
    this.settings().miningBonus.add(rational(100n)),
  );
  protected readonly addMachineValue = signal<string | null>(null);

  protected readonly CostSettingsDialog = CostSettingsDialog;
  protected readonly data = this.settingsStore.dataset;
  protected readonly faArrowTrendUp = faArrowTrendUp;
  protected readonly faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  protected readonly faBoxesStacked = faBoxesStacked;
  protected readonly faChevronDown = faChevronDown;
  protected readonly faCircleInfo = faCircleInfo;
  protected readonly faCopy = faCopy;
  protected readonly faDollar = faDollar;
  protected readonly faFlaskVial = faFlaskVial;
  protected readonly faGrip = faGrip;
  protected readonly faIndustry = faIndustry;
  protected readonly faInfo = faInfo;
  protected readonly faMicrochip = faMicrochip;
  protected readonly faXmark = faXmark;
  protected readonly gameOptions = gameOptions;
  protected readonly maximizeTypeOptions = maximizeTypeOptions;
  protected readonly options = this.settingsStore.options;
  protected readonly rational = rational;
  protected readonly researchBonusOptions = researchBonusOptions;
  protected readonly settings = this.settingsStore.settings;
  protected readonly TechnologiesDialog = TechnologiesDialog;
  protected readonly VersionsDialog = VersionsDialog;

  setParams(params: string): void {
    const tree = this.router.parseUrl(this.router.url);
    const urlParams = new URLSearchParams(params);
    urlParams.forEach((value, key) => (tree.queryParams[key] = value));
    void this.router.navigateByUrl(tree);
  }

  setGame(game: Game): void {
    if (game === 'custom' && !this.settingsStore.customData()) {
      this.dialog
        .open<boolean>(CustomDataDialog)
        .closed.pipe(filter((value) => value === true))
        .subscribe(() => {
          this.setMod(gameInfo[game].modId);
        });
    } else this.setMod(gameInfo[game].modId);
  }

  setMod(modId: string): void {
    void this.router.navigate([modId, 'list']);
  }

  addMachine(machineId: string): void {
    const settings = this.settings();
    const ids = [...settings.machineRankIds, machineId];
    this.settingsStore.updateField(
      'machineRankIds',
      ids,
      settings.defaultMachineRankIds,
    );

    // Reset control value
    setTimeout(() => {
      this.addMachineValue.set(null);
    });
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
