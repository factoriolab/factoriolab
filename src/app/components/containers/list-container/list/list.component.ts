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
  Column,
  ColumnsAsOptions,
  ItemId,
  ListMode,
  DisplayRateVal,
  InserterTarget,
  InserterCapacity,
  InserterData,
  DefaultPayload,
  toBoolEntities,
} from '~/models';
import { RouterService } from '~/services/router.service';
import { ColumnsState } from '~/store/columns';
import { FactoriesState } from '~/store/factories';
import { ItemsState } from '~/store/items';
import { RecipesState } from '~/store/recipes';
import { ExportUtility, RecipeUtility } from '~/utilities';

export enum StepEditType {
  Columns,
  Belt,
  Factory,
  FactoryModule,
  Beacon,
  BeaconModule,
}

export enum StepDetailTab {
  None,
  Inputs,
  Outputs,
  Factory,
  Recipes,
}

export interface StepEdit {
  step: Step;
  type: StepEditType;
  index?: number;
}

export interface StepInserter {
  id: string;
  value: Rational;
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
  @Input() factories: FactoriesState;
  @Input() beltSpeed: Entities<Rational>;
  _steps: Step[];
  get steps() {
    return this._steps;
  }
  @Input() set steps(value: Step[]) {
    this._steps = value;
    this.setDetailTabs();
    this.setDisplayedSteps();
    this.setEffectivePrecision();
  }
  @Input() disabledRecipes: string[];
  @Input() displayRate: DisplayRate;
  @Input() inserterTarget: InserterTarget;
  @Input() inserterCapacity: InserterCapacity;
  _columns: ColumnsState;
  get columns() {
    return this._columns;
  }
  @Input() set columns(value: ColumnsState) {
    this._columns = value;
    this.show = toBoolEntities(value.ids);
    this.totalSpan = 2;
    if (this.show[Column.Belts]) {
      this.totalSpan++;
    }
    if (this.show[Column.Wagons]) {
      this.totalSpan++;
    }
    if (this.show[Column.Factories]) {
      this.totalSpan += 3;
    }
    if (this.show[Column.Beacons]) {
      this.totalSpan += 3;
    }
    this.setEffectivePrecision();
  }
  @Input() modifiedIgnore: boolean;
  @Input() modifiedBelt: boolean;
  @Input() modifiedFactory: boolean;
  @Input() modifiedBeacons: boolean;
  _mode = ListMode.All; // Default also defined in container
  get mode() {
    return this._mode;
  }
  @Input() set mode(value: ListMode) {
    this._mode = value;
    if (this.steps) {
      this.setDisplayedSteps();
    }
  }
  _selected: string;
  get selected() {
    return this._selected;
  }
  @Input() set selected(value: string) {
    this._selected = value;
    this.setDisplayedSteps();
  }

  @Output() ignoreItem = new EventEmitter<string>();
  @Output() setBelt = new EventEmitter<DefaultIdPayload>();
  @Output() setFactory = new EventEmitter<DefaultIdPayload>();
  @Output() setFactoryModules = new EventEmitter<DefaultIdPayload<string[]>>();
  @Output() setBeaconCount = new EventEmitter<DefaultIdPayload<number>>();
  @Output() setBeacon = new EventEmitter<DefaultIdPayload>();
  @Output() setBeaconModules = new EventEmitter<DefaultIdPayload<string[]>>();
  @Output() setColumns = new EventEmitter<string[]>();
  @Output() resetItem = new EventEmitter<string>();
  @Output() resetRecipe = new EventEmitter<string>();
  @Output() resetIgnore = new EventEmitter();
  @Output() resetBelt = new EventEmitter();
  @Output() resetFactory = new EventEmitter();
  @Output() resetBeacons = new EventEmitter();
  @Output() setDisabledRecipes = new EventEmitter<DefaultPayload<string[]>>();

  displayedSteps: Step[] = [];
  edit: StepEdit;
  details: Entities<StepDetailTab[]> = {};
  recipes: Entities<string[]> = {};
  expanded: Entities<StepDetailTab> = {};
  show: Entities<boolean> = {};
  totalSpan = 2;
  effPrecision: Entities<number> = {};

  Column = Column;
  DisplayRate = DisplayRate;
  ItemId = ItemId;
  ListMode = ListMode;
  StepDetailTab = StepDetailTab;
  StepEditType = StepEditType;
  Rational = Rational;
  DisplayRateVal = DisplayRateVal;
  ColumnsAsOptions = ColumnsAsOptions;
  ColumnsLeftOfPower = [Column.Belts, Column.Factories, Column.Beacons];

  get rateLabel() {
    switch (this.displayRate) {
      case DisplayRate.PerHour:
        return '/h';
      case DisplayRate.PerMinute:
        return '/m';
      case DisplayRate.PerSecond:
        return '/s';
      default:
        return '';
    }
  }

  get totalPower() {
    let value = Rational.zero;
    for (const step of this.steps.filter((s) => s.power)) {
      value = value.add(step.power);
    }
    return this.power(value);
  }

  get totalPollution() {
    let value = Rational.zero;
    for (const step of this.steps.filter((s) => s.pollution)) {
      value = value.add(step.pollution);
    }
    return this.rate(value, this.effPrecision[Column.Pollution]);
  }

  constructor(public router: RouterService) {}

  setEffectivePrecision() {
    if (this.steps && this.columns) {
      this.effPrecision = {};
      this.effPrecision[Column.Items] = this.effPrecFrom(
        this.columns.precision[Column.Items],
        (s) => s[Column.Items.toLowerCase()]
      );
      this.effPrecision[Column.Surplus] = this.effPrecFrom(
        this.columns.precision[Column.Items],
        (s) => s[Column.Surplus.toLowerCase()]
      );
      for (const i of this.columns.ids) {
        this.effPrecision[i] = this.effPrecFrom(
          this.columns.precision[i],
          (s) => s[i.toLowerCase()]
        );
      }
    }
  }

  effPrecFrom(precision: number, fn: (step: Step) => Rational) {
    if (precision == null) {
      return precision;
    }
    let max = 0;
    for (const step of this.steps) {
      const dec = fn(step)?.toDecimals();
      if (dec >= precision) {
        return precision;
      } else if (dec > max) {
        max = dec;
      }
    }
    return max;
  }

  setDetailTabs() {
    this.details = {};
    this.recipes = {};
    for (const step of this.steps.filter((s) => s.itemId)) {
      this.details[step.itemId] = [];
      if (
        this.data.recipeEntities[step.recipeId]?.in &&
        !this.itemSettings[step.itemId].ignore
      ) {
        this.details[step.itemId].push(StepDetailTab.Inputs);
      }
      if (step.parents) {
        this.details[step.itemId].push(StepDetailTab.Outputs);
      }
      if (step.factories?.nonzero()) {
        this.details[step.itemId].push(StepDetailTab.Factory);
      }
      const recipeIds = this.data.complexRecipeIds.filter((r) =>
        this.data.recipeR[r].produces(step.itemId)
      );
      if (recipeIds.length) {
        this.details[step.itemId].push(StepDetailTab.Recipes);
        this.recipes[step.itemId] = recipeIds;
      }
    }

    // Hide any step details that are no longer valid
    for (const id of Object.keys(this.expanded).filter(
      (i) => this.expanded[i]
    )) {
      if (!this.details[id]?.length) {
        // Collapse this step
        delete this.expanded[id];
      } else if (this.details[id].indexOf(this.expanded[id]) === -1) {
        // Pick a different tab
        this.expanded[id] = this.details[id][0];
      }
    }
  }

  setDisplayedSteps() {
    if (this.mode === ListMode.All) {
      this.displayedSteps = this.steps;
    } else if (this.selected) {
      this.displayedSteps = this.steps.filter(
        (s) => s.itemId === this.selected || s.recipeId === this.selected
      );
      this.expanded = this.displayedSteps
        .map((s) => s.itemId)
        .reduce((e: Entities<StepDetailTab>, v) => {
          e[v] = this.details[v][0];
          return e;
        }, {});
    } else {
      this.displayedSteps = [];
      this.expanded = {};
    }
  }

  trackBy(step: Step) {
    return `${step.itemId}.${step.recipeId}`;
  }

  findStep(id: string) {
    return this.steps.find((s) => s.itemId === id);
  }

  factoryRate(value: Rational, precision: number, factory: string) {
    if (factory === ItemId.Pumpjack) {
      return `${this.rate(value.mul(Rational.hundred), precision - 1)}%`;
    } else {
      return this.rate(value, precision);
    }
  }

  rate(value: Rational, precision: number) {
    if (precision == null) {
      return value.toFraction();
    } else {
      const result = value.toPrecision(precision).toString();
      if (precision > 0) {
        const split = result.split('.');
        if (split.length > 1) {
          if (split[1].length < precision) {
            const spaces = precision - split[1].length;
            return result + '0'.repeat(spaces);
          }
        } else if (value.isInteger()) {
          return result + ' '.repeat(precision + 1);
        } else {
          return result + '.' + '0'.repeat(precision);
        }
      }
      return result;
    }
  }

  power(value: Rational) {
    if (value.lt(Rational.thousand)) {
      return `${this.rate(value, this.effPrecision[Column.Power])} kW`;
    } else {
      return `${this.rate(
        value.div(Rational.thousand),
        this.effPrecision[Column.Power]
      )} MW`;
    }
  }

  leftPad(value: string) {
    return ' '.repeat(4 - value.length) + value;
  }

  inserter(value: Rational): StepInserter {
    const inserter = InserterData[this.inserterTarget][
      this.inserterCapacity
    ].find((d) => d.value.gt(value) || d.id === ItemId.StackInserter);
    return {
      id: inserter.id,
      value: value.div(inserter.value),
    };
  }

  getSettings(step: Step) {
    return this.factories.entities[this.recipeSettings[step.recipeId].factory];
  }

  factoryChange(step: Step, value: string) {
    const def = RecipeUtility.bestMatch(
      this.data.recipeEntities[step.recipeId].producers,
      this.factories.ids
    );
    const event = {
      id: step.recipeId,
      value,
      default: def,
    };
    this.setFactory.emit(event);
  }

  factoryModuleChange(step: Step, value: string, index: number) {
    const count = this.recipeSettings[step.recipeId].factoryModules.length;
    const options = [
      ...this.data.recipeModuleIds[step.recipeId],
      ItemId.Module,
    ];
    const def = RecipeUtility.defaultModules(
      options,
      this.getSettings(step).moduleRank,
      count
    );
    const modules = this.generateModules(
      index,
      count,
      value,
      this.recipeSettings[step.recipeId].factoryModules
    );
    this.setFactoryModules.emit({
      id: step.recipeId,
      value: modules,
      default: def,
    });
  }

  beaconModuleChange(step: Step, value: string, index: number) {
    const count = this.recipeSettings[step.recipeId].beaconModules.length;
    const def = new Array(count).fill(this.getSettings(step).beaconModule);
    const modules = this.generateModules(
      index,
      count,
      value,
      this.recipeSettings[step.recipeId].beaconModules
    );
    this.setBeaconModules.emit({
      id: step.recipeId,
      value: modules,
      default: def,
    });
  }

  generateModules(
    index: number,
    count: number,
    value: string,
    original: string[]
  ) {
    if (index === 0) {
      // Copy to all
      return new Array(count).fill(value);
    } else {
      // Edit individual module
      const modules = [...original];
      modules[index] = value;
      return modules;
    }
  }

  beaconCountChange(step: Step, event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.value) {
      const value = Math.round(Number(target.value));
      const def = this.getSettings(step).beaconCount;
      if (
        this.recipeSettings[
          this.steps.find((s) => s.recipeId === step.recipeId).recipeId
        ].beaconCount !== value
      ) {
        this.setBeaconCount.emit({
          id: step.recipeId,
          value,
          default: def,
        });
      }
    }
  }

  resetStep(step: Step) {
    this.resetItem.emit(step.itemId);
    this.resetRecipe.emit(step.recipeId);
  }

  export() {
    ExportUtility.stepsToCsv(
      this.steps,
      this.columns.ids,
      this.itemSettings,
      this.recipeSettings
    );
  }

  toggleRecipe(id: string) {
    if (this.disabledRecipes.indexOf(id) === -1) {
      this.setDisabledRecipes.emit({
        value: [...this.disabledRecipes, id],
        default: this.data.defaults.disabledRecipes,
      });
    } else {
      this.setDisabledRecipes.emit({
        value: this.disabledRecipes.filter((i) => i !== id),
        default: this.data.defaults.disabledRecipes,
      });
    }
  }
}
