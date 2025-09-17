import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  faAngleRight,
  faEyeSlash,
  faFileArrowDown,
  faRotateLeft,
  faSquareCheck,
  faTableColumns,
} from '@fortawesome/free-solid-svg-icons';

import { RatePipe } from '~/components/steps/rate-pipe';
import { Exporter } from '~/exporter/exporter';
import { Step } from '~/solver/step';
import { ObjectivesStore } from '~/state/objectives/objectives-store';
import { RecipesStore } from '~/state/recipes/recipes-store';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';
import { updateSetIds } from '~/utils/set';

import { Button } from '../button/button';
import { Columns } from '../columns/columns';
import { Icon } from '../icon/icon';
import { Tooltip } from '../tooltip/tooltip';

@Component({
  selector: 'lab-steps',
  imports: [FormsModule, Button, Icon, RatePipe, Tooltip, TranslatePipe],
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
  protected readonly faEyeSlash = faEyeSlash;
  protected readonly faFileArrowDown = faFileArrowDown;
  protected readonly faRotateLeft = faRotateLeft;
  protected readonly faSquareCheck = faSquareCheck;
  protected readonly faTableColumns = faTableColumns;
  protected readonly settings = this.settingsStore.settings;
  protected readonly tree = this.objectivesStore.stepTree;

  expandedSteps = signal<Set<string>>(new Set());

  toggleStep(step: Step): void {
    this.expandedSteps.update((s) =>
      s.has(step.id)
        ? new Set(Array.from(s).filter((s) => s !== step.id))
        : new Set([...Array.from(s), step.id]),
    );
  }

  changeStepChecked(step: Step, value: boolean): void {
    // Priority: 1) Item state, 2) Recipe objective state, 3) Recipe state
    if (step.itemId != null) {
      const checkedItemIds = updateSetIds(
        step.itemId,
        value,
        this.settings().checkedItemIds,
      );
      this.settingsStore.apply({ checkedItemIds });
    } else if (step.recipeObjectiveId != null) {
      const checkedObjectiveIds = updateSetIds(
        step.recipeObjectiveId,
        value,
        this.settings().checkedObjectiveIds,
      );
      this.settingsStore.apply({ checkedObjectiveIds });
    } else if (step.recipeId != null) {
      const checkedRecipeIds = updateSetIds(
        step.recipeId,
        value,
        this.settings().checkedRecipeIds,
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

  changeItemExcluded(id: string): void {
    const value = !this.settings().excludedItemIds.has(id);
    const excludedItemIds = updateSetIds(
      id,
      value,
      this.settings().excludedItemIds,
    );
    this.settingsStore.apply({ excludedItemIds });
  }
}
