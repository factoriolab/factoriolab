import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

import {
  Step,
  ItemId,
  CategoryId,
  options,
  DisplayRate,
  Entities,
  Rational,
  IdPayload,
} from '~/models';
import { RouterService } from '~/services/router.service';
import { DatasetState } from '~/store/dataset';
import { ItemsState } from '~/store/items';
import { RecipesState } from '~/store/recipes';
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
  selector: 'lab-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
  @Input() data: DatasetState;
  @Input() itemSettings: ItemsState;
  @Input() recipeSettings: RecipesState;
  @Input() recipeRaw: RecipesState;
  @Input() steps: Step[];
  @Input() displayRate: DisplayRate;
  @Input() itemPrecision: number;
  @Input() beltPrecision: number;
  @Input() factoryPrecision: number;
  @Input() modifiedIgnore: boolean;
  @Input() modifiedBelt: boolean;
  @Input() modifiedFactory: boolean;
  @Input() modifiedModules: boolean;
  @Input() modifiedBeacons: boolean;

  @Output() ignoreItem = new EventEmitter<string>();
  @Output() setBelt = new EventEmitter<IdPayload<string>>();
  @Output() setFactory = new EventEmitter<IdPayload<string>>();
  @Output() setModules = new EventEmitter<IdPayload<string[]>>();
  @Output() setBeaconModule = new EventEmitter<IdPayload<string>>();
  @Output() setBeaconCount = new EventEmitter<IdPayload<number>>();
  @Output() resetItem = new EventEmitter<string>();
  @Output() resetRecipe = new EventEmitter<string>();
  @Output() resetIgnore = new EventEmitter();
  @Output() resetBelt = new EventEmitter();
  @Output() resetFactory = new EventEmitter();
  @Output() resetModules = new EventEmitter();
  @Output() resetBeacons = new EventEmitter();

  edit: StepEdit;
  expanded: Entities<boolean> = {};

  CategoryId = CategoryId;
  DisplayRate = DisplayRate;
  StepEditType = StepEditType;
  Rational = Rational;

  options = options;

  constructor(public router: RouterService) {}

  findStep(id: string) {
    return this.steps.find((s) => s.itemId === id);
  }

  rate(value: Rational, precision: number) {
    if (precision == null) {
      return value.toFraction();
    } else {
      return value.toPrecision(precision);
    }
  }

  prodAllowed(step: Step) {
    return RecipeUtility.moduleAllowed(
      ItemId.ProductivityModule,
      step.recipeId,
      this.data
    );
  }

  factoryModuleChange(step: Step, value: string, index: number) {
    if (index === 0) {
      // Copy to all
      const modules = [];
      for (const m of this.recipeSettings[step.recipeId].modules) {
        modules.push(value);
      }
      this.setModules.emit({ id: step.recipeId, value: modules });
    } else {
      // Edit individual module
      const modules = [
        ...this.recipeSettings[step.recipeId].modules.slice(0, index),
        value,
        ...this.recipeSettings[step.recipeId].modules.slice(index + 1),
      ];
      this.setModules.emit({ id: step.recipeId, value: modules });
    }
  }

  beaconCountChange(step: Step, event: any) {
    if (event.target.value) {
      const value = Math.round(Number(event.target.value));
      if (
        this.recipeSettings[
          this.steps.find((s) => s.itemId === step.itemId).itemId
        ].beaconCount !== value
      ) {
        this.setBeaconCount.emit({ id: step.recipeId, value });
      }
    }
  }

  resetStep(step: Step) {
    this.resetItem.emit(step.itemId);
    this.resetRecipe.emit(step.recipeId);
  }
}
