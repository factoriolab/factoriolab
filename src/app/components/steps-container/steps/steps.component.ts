import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Step, RecipeId } from 'src/app/models';

@Component({
  selector: 'lab-steps',
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.scss'],
})
export class StepsComponent {
  @Input() steps: Step[];

  @Output() editBeaconCount = new EventEmitter<[RecipeId, number]>();

  constructor() {}

  beaconCountChange(step: Step, event: any) {
    if (event.target.value) {
      const value = parseInt(event.target.value as string, 10);
      const recipeId: RecipeId = step.settings.recipeId
        ? step.settings.recipeId
        : ((step.itemId as string) as RecipeId);
      if (
        this.steps.find((s) => s.itemId === step.itemId).settings
          .beaconCount !== value
      ) {
        this.editBeaconCount.emit([recipeId, value]);
      }
    }
  }
}
