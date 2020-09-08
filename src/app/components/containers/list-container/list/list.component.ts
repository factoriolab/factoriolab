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
  MODULE_ID,
  Column,
  ColumnsAsOptions,
  toBoolEntities,
  PUMPJACK_ID,
} from '~/models';
import { RouterService } from '~/services/router.service';
import { ItemsState } from '~/store/items';
import { RecipesState } from '~/store/recipes';
import { RecipeUtility } from '~/utilities';

enum ListEditType {
  Columns,
  Belt,
  Factory,
  FactoryModule,
  Beacon,
  BeaconModule,
}

interface ListEdit {
  step: Step;
  type: ListEditType;
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
  _steps: Step[];
  get steps() {
    return this._steps;
  }
  @Input() set steps(value: Step[]) {
    this._steps = value;
    this.effPrecSurplus = this.effPrecFrom(
      this._itemPrecision,
      (s: Step) => s.surplus
    );
    this.effPrecItems = this.effPrecFrom(
      this._itemPrecision,
      (s: Step) => s.surplus
    );
    this.effPrecBelts = this.effPrecFrom(
      this._beltPrecision,
      (s: Step) => s.belts
    );
    this.effPrecFactories = this.effPrecFrom(
      this._factoryPrecision,
      (s: Step) => s.factories
    );
    this.effPrecPower = this.effPrecFrom(
      this._factoryPrecision,
      (s: Step) => s.consumption
    );
    this.effPrecPollution = this.effPrecFrom(
      this._factoryPrecision,
      (s: Step) => s.pollution
    );
  }
  @Input() belt: string;
  @Input() factoryRank: string[];
  @Input() moduleRank: string[];
  @Input() beaconModule: string;
  @Input() displayRate: DisplayRate;
  @Input() powerPrecision: number;
  @Input() pollutionPrecision: number;
  _itemPrecision: number;
  @Input() set itemPrecision(value: number) {
    this._itemPrecision = value;
    this.effPrecSurplus = this.effPrecFrom(value, (s: Step) => s.surplus);
    this.effPrecItems = this.effPrecFrom(value, (s: Step) => s.items);
  }
  _beltPrecision: number;
  @Input() set beltPrecision(value: number) {
    this._beltPrecision = value;
    this.effPrecBelts = this.effPrecFrom(value, (s: Step) => s.belts);
  }
  _factoryPrecision: number;
  @Input() set factoryPrecision(value: number) {
    this._factoryPrecision = value;
    this.effPrecFactories = this.effPrecFrom(value, (s: Step) => s.factories);
    this.effPrecPower = this.effPrecFrom(value, (s: Step) => s.consumption);
    this.effPrecPollution = this.effPrecFrom(value, (s: Step) => s.pollution);
  }
  @Input() beaconCount: number;
  @Input() drillModule: boolean;
  _columns: string[];
  get columns() {
    return this._columns;
  }
  @Input() set columns(value: string[]) {
    this._columns = value;
    this.show = toBoolEntities(value);
    this.totalSpan = 2;
    if (this.columns.indexOf(Column.Belts) !== -1) {
      this.totalSpan++;
    }
    if (this.columns.indexOf(Column.Factories) !== -1) {
      this.totalSpan += 3;
    }
    if (this.columns.indexOf(Column.Beacons) !== -1) {
      this.totalSpan++;
    }
  }
  @Input() modifiedIgnore: boolean;
  @Input() modifiedBelt: boolean;
  @Input() modifiedFactory: boolean;
  @Input() modifiedBeacons: boolean;

  @Output() ignoreItem = new EventEmitter<string>();
  @Output() setBelt = new EventEmitter<DefaultIdPayload>();
  @Output() setFactory = new EventEmitter<DefaultIdPayload>();
  @Output() setFactoryModules = new EventEmitter<DefaultIdPayload<string[]>>();
  @Output() setBeacon = new EventEmitter<DefaultIdPayload>();
  @Output() setBeaconModules = new EventEmitter<DefaultIdPayload<string[]>>();
  @Output() setBeaconCount = new EventEmitter<DefaultIdPayload<number>>();
  @Output() hideColumn = new EventEmitter<string>();
  @Output() showColumn = new EventEmitter<string>();
  @Output() resetItem = new EventEmitter<string>();
  @Output() resetRecipe = new EventEmitter<string>();
  @Output() resetIgnore = new EventEmitter();
  @Output() resetBelt = new EventEmitter();
  @Output() resetFactory = new EventEmitter();
  @Output() resetBeacons = new EventEmitter();

  edit: ListEdit;
  expanded: Entities<boolean> = {};
  show: Entities<boolean> = {};
  totalSpan = 2;
  effPrecSurplus: number;
  effPrecItems: number;
  effPrecBelts: number;
  effPrecFactories: number;
  effPrecPower: number;
  effPrecPollution: number;

  Column = Column;
  DisplayRate = DisplayRate;
  StepEditType = ListEditType;
  Rational = Rational;
  MODULE_ID = MODULE_ID;
  PUMPJACK_ID = PUMPJACK_ID;
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
    for (const step of this.steps.filter((s) => s.consumption)) {
      value = value.add(step.consumption);
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

  effPrecFrom(precision: number, fn: (step: Step) => Rational) {
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
      const result = value.toPrecision(precision).toString();
      if (precision > 0) {
        const split = result.split('.');
        if (split.length > 1) {
          if (split[1].length < precision) {
            const spaces = precision - split[1].length;
            return result + '0'.repeat(spaces);
          }
        } else {
          return result + ' '.repeat(precision + 1);
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
      ? [MODULE_ID]
      : [...this.data.recipeModuleIds[step.recipeId], MODULE_ID];
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
    const defaultModule = this.miningIgnoreModule(step)
      ? MODULE_ID
      : this.beaconModule;
    const def = new Array(count).fill(defaultModule);
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
