import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  faAngleRight,
  faFileArrowDown,
  faRotateLeft,
  faSquareCheck,
  faTableColumns,
} from '@fortawesome/free-solid-svg-icons';

import { RatePipe } from '~/components/steps/rate-pipe';
import { Exporter } from '~/exporter/exporter';
import { rational } from '~/rational/rational';
import { Step } from '~/solver/step';
import { ObjectivesStore } from '~/state/objectives/objectives-store';
import { RecipeState } from '~/state/recipes/recipe-state';
import { RecipesStore } from '~/state/recipes/recipes-store';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';
import { updateSetIds } from '~/utils/set';

import { Button } from '../button/button';
import { Checkbox } from '../checkbox/checkbox';
import { Columns } from '../columns/columns';
import { Icon } from '../icon/icon';
import { Select } from '../select/select';
import { Tooltip } from '../tooltip/tooltip';
import { ExcludeButton } from './exclude-button/exclude-button';
import { RecipesSelect } from './recipes-select/recipes-select';
import { SortColumn } from './sort-column';
import { SortHeader } from './sort-header/sort-header';

@Component({
  selector: 'lab-steps',
  imports: [
    FormsModule,
    Button,
    Checkbox,
    ExcludeButton,
    Icon,
    RatePipe,
    RecipesSelect,
    Select,
    SortHeader,
    Tooltip,
    TranslatePipe,
  ],
  templateUrl: './steps.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-1 sm:gap-2' },
})
export class Steps {
  protected readonly columns = inject(Columns);
  protected readonly exporter = inject(Exporter);
  protected readonly objectivesStore = inject(ObjectivesStore);
  protected readonly recipesStore = inject(RecipesStore);
  protected readonly settingsStore = inject(SettingsStore);

  readonly focus = input(false);

  protected readonly cols = this.settingsStore.columnsState;
  protected readonly data = this.recipesStore.adjustedDataset;
  protected readonly displayRateInfo = this.settingsStore.displayRateInfo;
  protected readonly faAngleRight = faAngleRight;
  protected readonly faFileArrowDown = faFileArrowDown;
  protected readonly faRotateLeft = faRotateLeft;
  protected readonly faSquareCheck = faSquareCheck;
  protected readonly faTableColumns = faTableColumns;
  protected readonly settings = this.settingsStore.settings;
  protected readonly tree = this.objectivesStore.stepTree;

  expandedSteps = signal<Set<string>>(new Set());
  sort = signal<[SortColumn, -1 | 1] | null>(null);

  sortedSteps = computed(() => {
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

  resetMachines(): void {
    const fields: (keyof RecipeState)[] = [
      'machineId',
      'overclock',
      'modules',
      'beacons',
    ];
    this.objectivesStore.resetFields(...fields);
    this.recipesStore.resetFields(...fields);
  }
}
