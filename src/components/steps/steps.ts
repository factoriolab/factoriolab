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
import { RecipesStore } from '~/state/recipes/recipes-store';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';

import { Button } from '../button/button';
import { Columns } from '../columns/columns';
import { Icon } from '../icon/icon';
import { Tooltip } from '../tooltip/tooltip';
import { CheckboxCell } from './checkbox-cell/checkbox-cell';
import { ExcludeButton } from './exclude-button/exclude-button';
import { SortColumn } from './sort-column';
import { SortHeader } from './sort-header/sort-header';
import { TreeCell } from './tree-cell/tree-cell';

@Component({
  selector: 'lab-steps',
  imports: [
    FormsModule,
    Button,
    CheckboxCell,
    ExcludeButton,
    Icon,
    RatePipe,
    SortHeader,
    Tooltip,
    TranslatePipe,
    TreeCell,
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
}
