import { Component, Input, Output, EventEmitter } from '@angular/core';
import Fraction from 'fraction.js';

import {
  Step,
  RecipeId,
  ItemId,
  CategoryId,
  OptionsType,
  options,
  DisplayRate,
} from '~/models';
import { RouterService } from '~/services/router.service';
import { DatasetState } from '~/store/dataset';
import { RecipeState } from '~/store/recipe';
import { RecipeUtility } from '~/utilities';

enum StepEditType {
  Belt,
  Factory,
  Module,
  Beacon,
}

interface StepEdit {
  step: Step;
  type: StepEditType;
  index?: number;
}

@Component({
  selector: 'lab-steps',
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.scss'],
})
export class StepsComponent {
  @Input() data: DatasetState;
  @Input() recipe: RecipeState;
  @Input() steps: Step[];
  @Input() displayRate: DisplayRate;
  @Input() itemPrecision: number;
  @Input() beltPrecision: number;
  @Input() factoryPrecision: number;

  @Output() ignoreStep = new EventEmitter<RecipeId>();
  @Output() setBelt = new EventEmitter<[RecipeId, ItemId]>();
  @Output() setFactory = new EventEmitter<[RecipeId, ItemId]>();
  @Output() setModules = new EventEmitter<[RecipeId, ItemId[]]>();
  @Output() setBeaconModule = new EventEmitter<[RecipeId, ItemId]>();
  @Output() setBeaconCount = new EventEmitter<[RecipeId, number]>();
  @Output() resetStep = new EventEmitter<RecipeId>();

  edit: StepEdit;

  CategoryId = CategoryId;
  DisplayRate = DisplayRate;
  StepEditType = StepEditType;
  ItemId = ItemId;
  OptionsType = OptionsType;

  options = options;

  constructor(public router: RouterService) {}

  rate(value: Fraction, precision: number) {
    if (precision == null) {
      return value.toFraction(true);
    } else {
      const decimal = value.valueOf();
      const round = Math.pow(10, precision);
      return Math.ceil(decimal * round) / round;
    }
  }

  prodAllowed(step: Step) {
    return RecipeUtility.prodModuleAllowed(
      this.data.recipeEntities[step.recipeId],
      this.data.itemEntities
    );
  }

  factoryModuleChange(step: Step, value: ItemId, index: number) {
    if (index === 0) {
      // Copy to all
      const modules = [];
      for (const m of step.settings.modules) {
        modules.push(value);
      }
      this.setModules.emit([step.recipeId, modules]);
    } else {
      // Edit individual module
      const modules = [
        ...step.settings.modules.slice(0, index),
        value,
        ...step.settings.modules.slice(index + 1),
      ];
      this.setModules.emit([step.recipeId, modules]);
    }
  }

  beaconCountChange(step: Step, event: any) {
    if (event.target.value) {
      const value = Math.round(Number(event.target.value));
      if (
        this.steps.find((s) => s.itemId === step.itemId).settings
          .beaconCount !== value
      ) {
        this.setBeaconCount.emit([step.recipeId, value]);
      }
    }
  }
}
