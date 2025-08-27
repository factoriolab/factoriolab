import { inject, Injectable } from '@angular/core';

import { Picker } from '~/components/picker/picker';
import { rational } from '~/models/rational';
import { Normalization } from '~/state/normalization';
import {
  ObjectiveSettings,
  ObjectiveState,
} from '~/state/objectives/objective';
import { ObjectiveType } from '~/state/objectives/objective-type';
import { ObjectiveUnit } from '~/state/objectives/objective-unit';
import { ObjectivesStore } from '~/state/objectives/objectives-store';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { RecipesStore } from '~/state/recipes/recipes-store';

@Injectable({ providedIn: 'root' })
export class Conversion {
  protected readonly normalization = inject(Normalization);
  private readonly objectivesStore = inject(ObjectivesStore);
  private readonly picker = inject(Picker);
  private readonly preferencesStore = inject(PreferencesStore);
  private readonly recipesStore = inject(RecipesStore);

  changeUnit(objective: ObjectiveSettings, unit: ObjectiveUnit): void {
    const data = this.recipesStore.adjustedDataset();
    if (unit === ObjectiveUnit.Machines) {
      if (objective.unit !== ObjectiveUnit.Machines) {
        const recipeIds = data.itemRecipeIds[objective.targetId];
        const updateFn = (recipeId: string): void => {
          this.convertItemsToMachines(objective, recipeId);
        };
        if (recipeIds.length === 1) updateFn(recipeIds[0]);
        else {
          this.picker.pickRecipe(recipeIds).subscribe((targetId) => {
            updateFn(targetId);
          });
        }
      }
    } else {
      if (
        objective.unit === ObjectiveUnit.Machines &&
        data.adjustedRecipe[objective.targetId]
      ) {
        const itemIds = Array.from(
          data.adjustedRecipe[objective.targetId].produces,
        );
        const updateFn = (itemId: string): void => {
          this.convertMachinesToItems(objective, itemId, unit);
        };

        if (itemIds.length === 1) updateFn(itemIds[0]);
        else {
          this.picker.pickItem(itemIds).subscribe((targetId) => {
            updateFn(targetId);
          });
        }
      } else {
        // No target conversion required
        this.convertItemsToItems(objective, objective.targetId, unit);
      }
    }
  }

  /**
   * Update unit field (non-machines -> machines), then convert and update
   * objective value so that number of items remains constant
   */
  convertItemsToMachines(objective: ObjectiveState, recipeId: string): void {
    this.objectivesStore.updateRecord(objective.id, {
      targetId: recipeId,
      unit: ObjectiveUnit.Machines,
    });

    if (
      !this.preferencesStore.convertObjectiveValues() ||
      objective.type === ObjectiveType.Maximize
    )
      return;

    const oldValue = this.normalization.normalizeRate(objective);
    const recipe = this.recipesStore.adjustedDataset().adjustedRecipe[recipeId];
    const newValue = oldValue.div(recipe.output[objective.targetId]);
    this.objectivesStore.updateRecord(objective.id, { value: newValue });
  }

  /**
   * Update unit field (machines -> non-machines), then convert and update
   * objective value so that number of items remains constant
   */
  convertMachinesToItems(
    objective: ObjectiveState,
    itemId: string,
    unit: ObjectiveUnit,
  ): void {
    this.objectivesStore.updateRecord(objective.id, {
      targetId: itemId,
      unit,
    });

    if (
      !this.preferencesStore.convertObjectiveValues() ||
      objective.type === ObjectiveType.Maximize ||
      objective.recipe == null
    )
      return;

    const factor = this.normalization.normalizeRate({
      id: '',
      targetId: itemId,
      value: rational.one,
      unit,
      type: ObjectiveType.Output,
    });
    const oldValue = objective.value.mul(objective.recipe.output[itemId]);
    const newValue = oldValue.div(factor);
    this.objectivesStore.updateRecord(objective.id, { value: newValue });
  }

  /**
   * Update unit field (non-machines -> non-machines), then convert and update
   * objective value so that number of items remains constant
   */
  convertItemsToItems(
    objective: ObjectiveState,
    itemId: string,
    unit: ObjectiveUnit,
  ): void {
    this.objectivesStore.updateRecord(objective.id, {
      targetId: itemId,
      unit,
    });

    if (
      !this.preferencesStore.convertObjectiveValues() ||
      objective.type === ObjectiveType.Maximize
    )
      return;

    const oldValue = this.normalization.normalizeRate(objective);
    const factor = this.normalization.normalizeRate({
      id: '',
      targetId: itemId,
      value: rational.one,
      unit,
      type: ObjectiveType.Output,
    });
    const newValue = oldValue.div(factor);
    this.objectivesStore.updateRecord(objective.id, { value: newValue });
  }
}
