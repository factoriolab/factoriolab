import { Dialog } from '@angular/cdk/dialog';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  faAngleRight,
  faArrowRotateLeft,
  faArrowUpRightFromSquare,
  faFileArrowDown,
  faRotateLeft,
  faSquareCheck,
  faTableColumns,
} from '@fortawesome/free-solid-svg-icons';

import { RatePipe } from '~/components/steps/pipes/rate-pipe';
import { Exporter } from '~/exporter/exporter';
import { rational } from '~/rational/rational';
import { Step } from '~/solver/step';
import { BeaconSettings } from '~/state/beacon-settings';
import { Hydration } from '~/state/hydration';
import { ItemSettings } from '~/state/items/item-settings';
import { ItemsStore } from '~/state/items/items-store';
import { MachinesStore } from '~/state/machines/machines-store';
import { ModuleSettings } from '~/state/module-settings';
import { ObjectivesStore } from '~/state/objectives/objectives-store';
import { RecipeState } from '~/state/recipes/recipe-state';
import { RecipesStore } from '~/state/recipes/recipes-store';
import { RouterSync } from '~/state/router/router-sync';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';
import { updateSetIds } from '~/utils/set';

import { BeaconsSelect } from '../beacons-select/beacons-select';
import { Button } from '../button/button';
import { Checkbox } from '../checkbox/checkbox';
import { ColumnsDialog } from '../columns-dialog/columns-dialog';
import { Icon } from '../icon/icon';
import { InputNumber } from '../input-number/input-number';
import { ModulesSelect } from '../modules-select/modules-select';
import { Select } from '../select/select';
import { Tooltip } from '../tooltip/tooltip';
import { BeltSelect } from './belt-select/belt-select';
import { ExcludeButton } from './exclude-button/exclude-button';
import { PowerPipe } from './pipes/power-pipe';
import { StepHrefPipe } from './pipes/step-href-pipe';
import { RecipesSelect } from './recipes-select/recipes-select';
import { SortColumn } from './sort-column';
import { SortHeader } from './sort-header/sort-header';
import { TotalCell } from './total-cell/total-cell';

@Component({
  selector: 'lab-steps',
  imports: [
    AsyncPipe,
    FormsModule,
    RouterLink,
    BeaconsSelect,
    Button,
    Checkbox,
    Icon,
    InputNumber,
    ModulesSelect,
    Select,
    Tooltip,
    TranslatePipe,
    BeltSelect,
    ExcludeButton,
    PowerPipe,
    RatePipe,
    RecipesSelect,
    SortHeader,
    StepHrefPipe,
    TotalCell,
  ],
  templateUrl: './steps.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-1 sm:gap-2' },
})
export class Steps {
  protected readonly dialog = inject(Dialog);
  protected readonly exporter = inject(Exporter);
  private readonly hydration = inject(Hydration);
  protected readonly itemsStore = inject(ItemsStore);
  private readonly machinesStore = inject(MachinesStore);
  protected readonly objectivesStore = inject(ObjectivesStore);
  protected readonly recipesStore = inject(RecipesStore);
  protected readonly routerSync = inject(RouterSync);
  protected readonly settingsStore = inject(SettingsStore);

  readonly focus = input(false);

  protected readonly cols = this.settingsStore.columnsState;
  protected readonly ColumnsDialog = ColumnsDialog;
  protected readonly data = this.recipesStore.adjustedDataset;
  protected readonly displayRateInfo = this.settingsStore.displayRateInfo;
  protected readonly faAngleRight = faAngleRight;
  protected readonly faArrowRotateLeft = faArrowRotateLeft;
  protected readonly faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  protected readonly faFileArrowDown = faFileArrowDown;
  protected readonly faRotateLeft = faRotateLeft;
  protected readonly faSquareCheck = faSquareCheck;
  protected readonly faTableColumns = faTableColumns;
  protected readonly rational = rational;
  protected readonly settings = this.settingsStore.settings;
  protected readonly totals = this.objectivesStore.totals;

  protected readonly expandedSteps = signal<Set<string>>(new Set());
  readonly sort = signal<[SortColumn, -1 | 1] | null>(null);

  protected readonly sortedSteps = computed(() => {
    const sort = this.sort();
    let steps = this.objectivesStore.steps();
    if (sort == null) return steps;

    const [col, dir] = sort;

    steps = [...steps];
    steps.sort(
      (a, b) =>
        coalesce(b[col], rational.zero)
          .sub(coalesce(a[col], rational.zero))
          .toNumber() * dir,
    );
    return steps;
  });

  changeSort(column: SortColumn): void {
    this.sort.update((current) => {
      if (current == null || current[0] !== column) return [column, 1];
      if (current[1] === -1) return null;
      return [column, -1];
    });
  }

  toggleStep(step: Step): void {
    this.expandedSteps.update((s) =>
      s.has(step.id)
        ? new Set(Array.from(s).filter((s) => s !== step.id))
        : new Set([...Array.from(s), step.id]),
    );
  }

  resetStep(step: Step): void {
    if (step.itemId) this.itemsStore.resetId(step.itemId);

    if (step.recipeObjectiveId) {
      this.objectivesStore.updateRecord(step.recipeObjectiveId, {
        machineId: undefined,
        fuelId: undefined,
        modules: undefined,
        beacons: undefined,
        overclock: undefined,
      });
    } else if (step.recipeId) {
      this.recipesStore.resetId(step.recipeId);
    }
  }

  changeModulesBeacons(
    step: Step,
    state: { modules?: ModuleSettings[]; beacons?: BeaconSettings[] },
  ): void {
    const settings = step.recipeSettings;
    if (step.recipeId == null || settings?.machineId == null) return;

    const id = step.recipeObjectiveId ?? step.recipeId;
    const update =
      step.recipeObjectiveId != null
        ? this.objectivesStore.updateRecord.bind(this.objectivesStore)
        : this.recipesStore.updateRecord.bind(this.recipesStore);

    const machine = this.data().machineRecord[settings.machineId];
    const machineSettings = this.machinesStore.settings()[settings.machineId];
    if (state.modules) {
      state.modules = this.hydration.dehydrateModules(
        state.modules,
        coalesce(settings.moduleOptions, []),
        this.settings().moduleRankIds,
        machine.modules,
        machineSettings.modules,
      );
    }

    if (state.beacons) {
      state.beacons = this.hydration.dehydrateBeacons(
        state.beacons,
        machineSettings.beacons,
      );
    }

    update(id, state);
  }

  changeStepChecked(step: Step, value: boolean): void {
    const settings = this.settingsStore.settings();
    // Priority: 1) Item state, 2) Recipe objective state, 3) Recipe state
    if (step.itemId != null) {
      const checkedItemIds = updateSetIds(
        step.itemId,
        value,
        settings.checkedItemIds,
      );
      this.settingsStore.apply({ checkedItemIds });
    } else if (step.recipeObjectiveId != null) {
      const checkedObjectiveIds = updateSetIds(
        step.recipeObjectiveId,
        value,
        settings.checkedObjectiveIds,
      );
      this.settingsStore.apply({ checkedObjectiveIds });
    } else if (step.recipeId != null) {
      const checkedRecipeIds = updateSetIds(
        step.recipeId,
        value,
        settings.checkedRecipeIds,
      );
      this.settingsStore.apply({ checkedRecipeIds });
    }
  }

  resetChecked(): void {
    this.settingsStore.apply({
      checkedItemIds: new Set(),
      checkedObjectiveIds: new Set(),
      checkedRecipeIds: new Set(),
    });
  }

  resetExcludedItems(): void {
    this.settingsStore.apply({ excludedItemIds: new Set() });
  }

  changeBelts(step: Step, state?: ItemSettings): void {
    if (step.itemId == null || state == null) return;
    this.itemsStore.updateRecordField(
      step.itemId,
      'stack',
      state.stack,
      state.defaultStack,
    );
    this.itemsStore.updateRecordField(
      step.itemId,
      'beltId',
      state.beltId,
      state.defaultBeltId,
    );
  }

  resetMachines(): void {
    const fields: (keyof RecipeState)[] = [
      'machineId',
      'fuelId',
      'modules',
      'beacons',
      'overclock',
    ];
    this.objectivesStore.resetFields(...fields);
    this.recipesStore.resetFields(...fields);
  }

  resetBeacons(): void {
    this.objectivesStore.resetFields('beacons');
    this.recipesStore.resetFields('beacons');
  }
}
