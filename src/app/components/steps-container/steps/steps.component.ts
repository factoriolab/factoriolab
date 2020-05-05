import { Component, Input, Output, EventEmitter } from '@angular/core';
import Fraction from 'fraction.js';

import { Step, RecipeId } from 'src/app/models';

@Component({
  selector: 'lab-steps',
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.scss'],
})
export class StepsComponent {
  @Input() steps: Step[];
  @Input() itemPrecision: number;
  @Input() beltPrecision: number;
  @Input() factoryPrecision: number;

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

  rate(value: Fraction, precision: number) {
    if (precision == null) {
      return value.toFraction(true);
    } else {
      const decimal = value.valueOf();
      const round = Math.pow(10, precision);
      return Math.ceil(decimal * round) / round;
    }
  }
}
