import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

import {
  Step,
  DisplayRate,
  Entities,
  Rational,
  Dataset,
  DefaultIdPayload,
} from '~/models';
import { RouterService } from '~/services/router.service';
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
  @Input() data: Dataset;
  @Input() itemSettings: ItemsState;
  @Input() recipeSettings: RecipesState;
  @Input() recipeRaw: RecipesState;
  @Input() steps: Step[];
  @Input() belt: string;
  @Input() factoryRank: string[];
  @Input() moduleRank: string[];
  @Input() beaconModule: string;
  @Input() beaconCount: number;
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
  @Output() setBelt = new EventEmitter<DefaultIdPayload>();
  @Output() setFactory = new EventEmitter<DefaultIdPayload>();
  @Output() setModules = new EventEmitter<DefaultIdPayload<string[]>>();
  @Output() setBeaconModule = new EventEmitter<DefaultIdPayload>();
  @Output() setBeaconCount = new EventEmitter<DefaultIdPayload<number>>();
  @Output() resetItem = new EventEmitter<string>();
  @Output() resetRecipe = new EventEmitter<string>();
  @Output() resetIgnore = new EventEmitter();
  @Output() resetBelt = new EventEmitter();
  @Output() resetFactory = new EventEmitter();
  @Output() resetModules = new EventEmitter();
  @Output() resetBeacons = new EventEmitter();

  edit: StepEdit;
  expanded: Entities<boolean> = {};

  DisplayRate = DisplayRate;
  StepEditType = StepEditType;
  Rational = Rational;

  constructor(public router: RouterService) {}

  trackBy(step: Step) {
    return `${step.itemId}.${step.recipeId}`;
  }

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

  factoryChange(step: Step, value: string) {
    const def = RecipeUtility.bestMatch(
      this.data.recipeEntities[step.recipeId].producers,
      this.factoryRank
    );
    const event = {
      id: step.recipeId,
      value,
      default: def,
    };
    this.setFactory.emit(event);
  }

  factoryModuleChange(step: Step, value: string, index: number) {
    const count = this.recipeSettings[step.recipeId].modules.length;
    const def = RecipeUtility.defaultModules(
      [...this.data.recipeModuleIds[step.recipeId], 'module'],
      this.moduleRank,
      count
    );
    if (index === 0) {
      // Copy to all
      const modules = [];
      for (let i = 0; i < count; i++) {
        modules.push(value);
      }
      this.setModules.emit({ id: step.recipeId, value: modules, default: def });
    } else {
      // Edit individual module
      const modules = [
        ...this.recipeSettings[step.recipeId].modules.slice(0, index),
        value,
        ...this.recipeSettings[step.recipeId].modules.slice(index + 1),
      ];
      this.setModules.emit({ id: step.recipeId, value: modules, default: def });
    }
  }

  beaconCountChange(step: Step, event: any) {
    if (event.target.value) {
      const value = Math.round(Number(event.target.value));
      if (
        this.recipeSettings[
          this.steps.find((s) => s.recipeId === step.recipeId).recipeId
        ].beaconCount !== value
      ) {
        this.setBeaconCount.emit({
          id: step.recipeId,
          value,
          default: this.beaconCount,
        });
      }
    }
  }

  resetStep(step: Step) {
    this.resetItem.emit(step.itemId);
    this.resetRecipe.emit(step.recipeId);
  }
}
