import { KeyValue } from '@angular/common';
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
  ItemId,
  ListMode,
  DisplayRateVal,
  InserterTarget,
  InserterCapacity,
  InserterData,
  DefaultPayload,
  PrecisionColumns,
  FactorySettings,
  DisplayRateLabel,
} from '~/models';
import { RouterService } from '~/services';
import { FactoriesState } from '~/store/factories';
import { ItemsState } from '~/store/items';
import { ColumnsState } from '~/store/preferences';
import { RecipesState } from '~/store/recipes';
import { SettingsState } from '~/store/settings';
import { ExportUtility, RecipeUtility } from '~/utilities';

export enum StepDetailTab {
  None,
  Inputs,
  Outputs,
  Targets,
  Factory,
  Recipes,
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
  @Input() itemRaw: ItemsState;
  @Input() recipeSettings: RecipesState;
  @Input() recipeRaw: RecipesState;
  @Input() settings: SettingsState;
  @Input() factories: FactoriesState;
  @Input() beltSpeed: Entities<Rational>;
  _steps: Step[] = [];
  get steps(): Step[] {
    return this._steps;
  }
  @Input() set steps(value: Step[]) {
    this._steps = value.map((s) => ({
      ...s,
      ...{
        id: `${s.itemId || ''}.${s.recipeId || ''}`,
        href: this.router.stepHref(s),
      },
    }));
    this.setDetailTabs();
    this.setDisplayedSteps();
    this.setEffectivePrecision();
  }
  @Input() disabledRecipes: string[];
  @Input() displayRate: DisplayRate;
  @Input() inserterTarget: InserterTarget;
  @Input() inserterCapacity: InserterCapacity;
  _columns: ColumnsState;
  get columns(): ColumnsState {
    return this._columns;
  }
  @Input() set columns(value: ColumnsState) {
    this._columns = value;
    this.totalSpan = 2;
    if (this.columns[Column.Belts].show) {
      this.totalSpan++;
    }
    if (this.columns[Column.Wagons].show) {
      this.totalSpan++;
    }
    if (this.columns[Column.Factories].show) {
      this.totalSpan += 3;
    }
    if (this.columns[Column.Beacons].show) {
      this.totalSpan += 3;
    }
    this.setEffectivePrecision();
  }
  @Input() modifiedIgnore: boolean;
  @Input() modifiedBelt: boolean;
  @Input() modifiedWagon: boolean;
  @Input() modifiedFactory: boolean;
  @Input() modifiedBeacons: boolean;
  _mode = ListMode.All; // Default also defined in container
  get mode(): ListMode {
    return this._mode;
  }
  @Input() set mode(value: ListMode) {
    this._mode = value;
    this.setDisplayedSteps();
  }
  _selected: string;
  get selected(): string {
    return this._selected;
  }
  @Input() set selected(value: string) {
    this._selected = value;
    this.setDisplayedSteps();
  }

  @Output() ignoreItem = new EventEmitter<string>();
  @Output() setBelt = new EventEmitter<DefaultIdPayload>();
  @Output() setWagon = new EventEmitter<DefaultIdPayload>();
  @Output() setFactory = new EventEmitter<DefaultIdPayload>();
  @Output() setFactoryModules = new EventEmitter<DefaultIdPayload<string[]>>();
  @Output() setBeaconCount = new EventEmitter<DefaultIdPayload<number>>();
  @Output() setBeacon = new EventEmitter<DefaultIdPayload>();
  @Output() setBeaconModules = new EventEmitter<DefaultIdPayload<string[]>>();
  @Output() setColumns = new EventEmitter<ColumnsState>();
  @Output() resetItem = new EventEmitter<string>();
  @Output() resetRecipe = new EventEmitter<string>();
  @Output() resetIgnore = new EventEmitter();
  @Output() resetBelt = new EventEmitter();
  @Output() resetWagon = new EventEmitter();
  @Output() resetFactory = new EventEmitter();
  @Output() resetBeacons = new EventEmitter();
  @Output() setDisabledRecipes = new EventEmitter<DefaultPayload<string[]>>();

  displayedSteps: Step[] = [];
  details: Entities<StepDetailTab[]> = {};
  recipes: Entities<string[]> = {};
  expanded: Entities<StepDetailTab> = {};
  totalSpan = 2;
  effPrecision: Entities<number> = {};
  DisplayRateVal = DisplayRateVal;
  ColumnsLeftOfPower = [Column.Belts, Column.Factories, Column.Beacons];

  Column = Column;
  DisplayRate = DisplayRate;
  ItemId = ItemId;
  ListMode = ListMode;
  StepDetailTab = StepDetailTab;
  Rational = Rational;

  get rateLabel(): string {
    return DisplayRateLabel[this.displayRate];
  }

  get totalPower(): string {
    let value = Rational.zero;
    for (const step of this.steps.filter((s) => s.power)) {
      value = value.add(step.power);
    }
    return this.power(value);
  }

  get totalPollution(): string {
    let value = Rational.zero;
    for (const step of this.steps.filter((s) => s.pollution)) {
      value = value.add(step.pollution);
    }
    return this.rate(value, this.effPrecision[Column.Pollution]);
  }

  constructor(public router: RouterService) {}

  setEffectivePrecision(): void {
    if (this.steps && this.columns) {
      this.effPrecision = {};
      this.effPrecision[Column.Surplus] = this.effPrecFrom(
        this.columns[Column.Items].precision,
        (s) => s[Column.Surplus.toLowerCase()]
      );
      for (const i of PrecisionColumns.filter((i) => this.columns[i].show)) {
        this.effPrecision[i] = this.effPrecFrom(
          this.columns[i].precision,
          (s) => s[i.toLowerCase()]
        );
      }
    }
  }

  effPrecFrom(precision: number, fn: (step: Step) => Rational): number {
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

  setDetailTabs(): void {
    this.details = {};
    this.recipes = {};
    for (const step of this.steps) {
      this.details[step.id] = [];
      if (step.recipeId) {
        const recipe = this.data.recipeR[step.recipeId];
        if (
          recipe.in &&
          (!step.itemId || !this.itemSettings[step.itemId].ignore)
        ) {
          this.details[step.id].push(StepDetailTab.Inputs);
        }
        this.details[step.id].push(StepDetailTab.Outputs);
      }
      if (step.parents) {
        this.details[step.id].push(StepDetailTab.Targets);
      }
      if (step.factories?.nonzero()) {
        this.details[step.id].push(StepDetailTab.Factory);
      }
      if (step.itemId) {
        const recipeIds = this.data.complexRecipeIds.filter((r) =>
          this.data.recipeR[r].produces(step.itemId)
        );
        if (recipeIds.length) {
          this.details[step.id].push(StepDetailTab.Recipes);
          this.recipes[step.id] = recipeIds;
        }
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

  setDisplayedSteps(): void {
    if (this.mode === ListMode.All) {
      this.displayedSteps = this.steps;
    } else if (this.selected) {
      this.displayedSteps = this.steps.filter(
        (s) => s.itemId === this.selected || s.recipeId === this.selected
      );
      this.expanded = this.displayedSteps
        .map((s) => this.trackBy(s))
        .reduce((e: Entities<StepDetailTab>, v) => {
          e[v] = this.details[v][0];
          return e;
        }, {});
    } else {
      this.displayedSteps = [];
      this.expanded = {};
    }
  }

  trackBy(step: Step): string {
    return step.id;
  }

  findStep(id: string): Step {
    return this.steps.find((s) => s.itemId === id);
  }

  sortKeyValue(
    a: KeyValue<string, Rational>,
    b: KeyValue<string, Rational>
  ): number {
    return b.value.sub(a.value).toNumber();
  }

  factoryRate(value: Rational, precision: number, factory: string): string {
    if (factory === ItemId.Pumpjack) {
      return `${this.rate(value.mul(Rational.hundred), precision - 1)}%`;
    } else {
      return this.rate(value, precision);
    }
  }

  rate(value: Rational, precision: number): string {
    if (precision == null) {
      return value.toFraction();
    } else {
      const num =
        precision === -2
          ? Math.round(value.mul(Rational.hundred).toNumber())
          : value.toPrecision(precision);
      const result = num.toString();
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

  power(value: Rational): string {
    if (value.lt(Rational.thousand)) {
      return `${this.rate(value, this.effPrecision[Column.Power])} kW`;
    } else {
      return `${this.rate(
        value.div(Rational.thousand),
        this.effPrecision[Column.Power]
      )} MW`;
    }
  }

  leftPad(value: string): string {
    return ' '.repeat(4 - value.length) + value;
  }

  inserter(value: Rational): StepInserter {
    const inserter = InserterData[this.inserterTarget][
      this.inserterCapacity
    ].find((d) => d.value.gt(value) || d.id === ItemId.StackInserter);

    if (!this.data.itemEntities[inserter.id]) {
      return null;
    }

    return {
      id: inserter.id,
      value: value.div(inserter.value),
    };
  }

  getSettings(step: Step): FactorySettings {
    return this.factories.entities[this.recipeSettings[step.recipeId].factory];
  }

  factoryChange(step: Step, value: string): void {
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

  factoryModuleChange(step: Step, value: string, index: number): void {
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
      value,
      this.recipeSettings[step.recipeId].factoryModules
    );
    this.setFactoryModules.emit({
      id: step.recipeId,
      value: modules,
      default: def,
    });
  }

  beaconModuleChange(step: Step, value: string, index: number): void {
    const count = this.recipeSettings[step.recipeId].beaconModules.length;
    const def = new Array(count).fill(this.getSettings(step).beaconModule);
    const modules = this.generateModules(
      index,
      value,
      this.recipeSettings[step.recipeId].beaconModules
    );
    this.setBeaconModules.emit({
      id: step.recipeId,
      value: modules,
      default: def,
    });
  }

  generateModules(index: number, value: string, original: string[]): string[] {
    if (index === 0) {
      // Copy to all
      return new Array(original.length).fill(value);
    } else {
      // Edit individual module
      const modules = [...original];
      modules[index] = value;
      return modules;
    }
  }

  beaconCountChange(step: Step, event: Event): void {
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

  resetStep(step: Step): void {
    this.resetItem.emit(step.itemId);
    this.resetRecipe.emit(step.recipeId);
  }

  export(): void {
    ExportUtility.stepsToCsv(
      this.steps,
      this.columns,
      this.itemSettings,
      this.recipeSettings,
      this.data
    );
  }

  toggleRecipe(id: string): void {
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
