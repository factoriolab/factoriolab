import { Pipe, PipeTransform } from '@angular/core';

import { Step } from '~/models/step';

@Pipe({ name: 'stepId', standalone: true })
export class StepIdPipe implements PipeTransform {
  static transform(value: Step): string {
    return (
      value.itemId ?? value.recipeObjectiveId ?? value.recipeId ?? value.id
    );
  }

  transform(value: Step): string {
    return StepIdPipe.transform(value);
  }
}
