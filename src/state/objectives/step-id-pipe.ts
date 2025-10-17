import { Pipe, PipeTransform } from '@angular/core';

import { Step } from '~/solver/step';

@Pipe({ name: 'stepId' })
export class StepIdPipe implements PipeTransform {
  static find(stepId: string, steps: Step[]): Step | undefined {
    const [type, id] = stepId.split('_');
    if (type == null || id == null) return undefined;
    if (type === 'item') return steps.find((s) => s.itemId === id);
    if (type === 'objective')
      return steps.find((s) => s.recipeObjectiveId === id);
    if (type === 'recipe') return steps.find((s) => s.recipeId === id);
    return steps.find((s) => s.id === id);
  }

  static transform(value: Step): string {
    if (value.itemId) return `item_${value.itemId}`;
    if (value.recipeObjectiveId) return `objective_${value.recipeObjectiveId}`;
    if (value.recipeId) return `recipe_${value.recipeId}`;
    return `step_${value.id}`;
  }

  transform(value: Step): string {
    return StepIdPipe.transform(value);
  }
}
