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
  toBoolEntities,
  ItemId,
  ListMode,
  DisplayRateVal,
  InserterTarget,
  InserterCapacity,
  InserterData,
} from '~/models';
import { RouterService } from '~/services/router.service';
import { ItemsState } from '~/store/items';
import { RecipesState } from '~/store/recipes';
import { ExportUtility, RecipeUtility } from '~/utilities';

enum StepEditType {
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
}

interface StepEdit {
  step: Step;
  type: StepEditType;
  index?: number;
}

interface StepInserter {
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
  @Input() beltSpeed: Entities<Rational>;
  _steps: Step[];
  get steps() {
    return this._steps;
  }
  @Input() set steps(value: Step[]) {
    this._steps = value;
    this.setDetailTabs();
    this.setDisplayedSteps();
    this.setItemsPrecision();
    this.setBeltsPrecision();
    this.setWagonsPrecision();
    this.setFactoriesPrecision();
    this.setPowerPrecision();
    this.setPollutionPrecision();
  }
  @Input() factoryRank: string[];
  @Input() moduleRank: string[];
  @Input() beaconModule: string;
  @Input() displayRate: DisplayRate;
  _itemPrecision = 0;
  @Input() set itemPrecision(value: number) {
    this._itemPrecision = value;
    this.setItemsPrecision();
  }
  _beltPrecision = 0;
  @Input() set beltPrecision(value: number) {
    this._beltPrecision = value;
    this.setBeltsPrecision();
  }
  _wagonPrecision = 0;
  @Input() set wagonPrecision(value: number) {
    this._wagonPrecision = value;
    this.setWagonsPrecision();
  }
  _factoryPrecision = 0;
  @Input() set factoryPrecision(value: number) {
    this._factoryPrecision = value;
    this.setFactoriesPrecision();
  }
  _powerPrecision = 0;
  @Input() set powerPrecision(value: number) {
    this._powerPrecision = value;
    this.setPowerPrecision();
  }
  _pollutionPrecision = 0;
  @Input() set pollutionPrecision(value: number) {
    this._pollutionPrecision = value;
    this.setPollutionPrecision();
  }
  @Input() beaconCount: number;
  @Input() drillModule: boolean;
  @Input() inserterTarget: InserterTarget;
  @Input() inserterCapacity: InserterCapacity;
  _columns: Column[];
  get columns() {
    return this._columns;
  }
  @Input() set columns(value: Column[]) {
    this._columns = value;
    this.show = toBoolEntities(value);
    this.totalSpan = 2;
    if (this.columns.indexOf(Column.Belts) !== -1) {
      this.totalSpan++;
    }
    if (this.columns.indexOf(Column.Wagons) !== -1) {
      this.totalSpan++;
    }
    if (this.columns.indexOf(Column.Factories) !== -1) {
      this.totalSpan += 3;
    }
    this.detailSpan = this.totalSpan - 1;
    if (this.columns.indexOf(Column.Beacons) !== -1) {
      this.totalSpan += 3;
    }
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

  displayedSteps: Step[] = [];
  edit: StepEdit;
  details: Entities<StepDetailTab[]> = {};
  expanded: Entities<StepDetailTab> = {};
  show: Entities<boolean> = {};
  totalSpan = 2;
  detailSpan = 1;
  effPrecSurplus: number;
  effPrecItems: number;
  effPrecBelts: number;
  effPrecWagons: number;
  effPrecFactories: number;
  effPrecPower: number;
  effPrecPollution: number;

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
    return this.rate(value, this.effPrecPollution);
  }

  constructor(public router: RouterService) {}

  setItemsPrecision() {
    this.effPrecSurplus = this.effPrecFrom(
      this._itemPrecision,
      (s: Step) => s.surplus
    );
    this.effPrecItems = this.effPrecFrom(
      this._itemPrecision,
      (s: Step) => s.items
    );
  }

  setBeltsPrecision() {
    this.effPrecBelts = this.effPrecFrom(
      this._beltPrecision,
      (s: Step) => s.belts
    );
  }

  setWagonsPrecision() {
    this.effPrecWagons = this.effPrecFrom(
      this._wagonPrecision,
      (s: Step) => s.wagons
    );
  }

  setFactoriesPrecision() {
    this.effPrecFactories = this.effPrecFrom(
      this._factoryPrecision,
      (s: Step) => s.factories
    );
  }

  setPowerPrecision() {
    this.effPrecPower = this.effPrecFrom(
      this._powerPrecision,
      (s: Step) => s.power
    );
  }

  setPollutionPrecision() {
    this.effPrecPollution = this.effPrecFrom(
      this._pollutionPrecision,
      (s: Step) => s.pollution
    );
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

  setDetailTabs() {
    this.details = {};
    for (const step of this.steps.filter((s) => s.itemId)) {
      this.details[step.itemId] = [];
      if (this.data.recipeEntities[step.recipeId]?.in) {
        this.details[step.itemId].push(StepDetailTab.Inputs);
      }
      if (step.parents) {
        this.details[step.itemId].push(StepDetailTab.Outputs);
      }
      if (step.factories) {
        this.details[step.itemId].push(StepDetailTab.Factory);
      }
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
      return `${this.rate(value, this.effPrecPower)} kW`;
    } else {
      return `${this.rate(value.div(Rational.thousand), this.effPrecPower)} MW`;
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

  miningIgnoreModule(step: Step) {
    if (!this.drillModule && this.recipeSettings[step.recipeId]?.factory) {
      return this.data.itemR[this.recipeSettings[step.recipeId].factory].factory
        .mining;
    }
    return false;
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
    const count = this.recipeSettings[step.recipeId].factoryModules.length;
    const options = this.miningIgnoreModule(step)
      ? [ItemId.Module]
      : [...this.data.recipeModuleIds[step.recipeId], ItemId.Module];
    const def = RecipeUtility.defaultModules(options, this.moduleRank, count);
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
    const def = new Array(count).fill(this.beaconModule);
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
      const def = this.miningIgnoreModule(step) ? 0 : this.beaconCount;
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
      this.columns,
      this.itemSettings,
      this.recipeSettings
    );
  }
}
