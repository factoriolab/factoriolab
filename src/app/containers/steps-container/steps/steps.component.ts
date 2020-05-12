import { Component, Input, Output, EventEmitter } from '@angular/core';
import Fraction from 'fraction.js';

import { Step, RecipeId, ItemId, CategoryId } from '~/models';
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
  @Input() itemPrecision: number;
  @Input() beltPrecision: number;
  @Input() factoryPrecision: number;

  @Output() ignoreStep = new EventEmitter<RecipeId>();
  @Output() editFactoryModule = new EventEmitter<[RecipeId, ItemId[]]>();
  @Output() editBeaconModule = new EventEmitter<[RecipeId, ItemId]>();
  @Output() editBeaconCount = new EventEmitter<[RecipeId, number]>();
  @Output() resetStep = new EventEmitter<RecipeId>();

  edit: StepEdit;
  allModuleOptions = [
    [ItemId.Module],
    [ItemId.SpeedModule, ItemId.SpeedModule2, ItemId.SpeedModule3],
    [
      ItemId.ProductivityModule,
      ItemId.ProductivityModule2,
      ItemId.ProductivityModule3,
    ],
  ];
  speedModuleOptions = [
    [
      ItemId.Module,
      ItemId.SpeedModule,
      ItemId.SpeedModule2,
      ItemId.SpeedModule3,
    ],
  ];

  editType = StepEditType;
  itemId = ItemId;
  categoryId = CategoryId;

  constructor() {}

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
      this.editFactoryModule.emit([step.recipeId, modules]);
    } else {
      // Edit individual module
      const modules = [
        ...step.settings.modules.slice(0, index),
        value,
        ...step.settings.modules.slice(index + 1),
      ];
      this.editFactoryModule.emit([step.recipeId, modules]);
    }
  }

  beaconCountChange(step: Step, event: any) {
    if (event.target.value) {
      const value = Math.round(Number(event.target.value));
      if (
        this.steps.find((s) => s.itemId === step.itemId).settings
          .beaconCount !== value
      ) {
        this.editBeaconCount.emit([step.recipeId, value]);
      }
    }
  }
}
