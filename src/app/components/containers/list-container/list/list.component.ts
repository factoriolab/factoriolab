import { KeyValue } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnInit,
  ChangeDetectorRef,
  OnChanges,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
  Step,
  DisplayRate,
  Entities,
  Rational,
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
  DisplayRateLabel,
  Game,
  PIPE,
  IdPayload,
} from '~/models';
import { RouterService } from '~/services';
import { ItemsState } from '~/store/items';
import { ColumnsState } from '~/store/preferences';
import { RecipesState } from '~/store/recipes';
import { SettingsState } from '~/store/settings';
import { ExportUtility, RecipeUtility } from '~/utilities';
import { RecipeSettingsComponent } from '../../recipe-settings.component';

export enum StepDetailTab {
  None,
  Item,
  Recipe,
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
export class ListComponent
  extends RecipeSettingsComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() itemSettings: ItemsState;
  @Input() itemRaw: ItemsState;
  @Input() recipeRaw: RecipesState;
  @Input() settings: SettingsState;
  @Input() beltSpeed: Entities<Rational>;
  _steps: Step[] = [];
  get steps(): Step[] {
    return this._steps;
  }
  @Input() set steps(value: Step[]) {
    this._steps = [...value];

    this.routerSvc.requestHash(this.settings.baseId).subscribe((hash) => {
      setTimeout(() => {
        this._steps.forEach((s) => {
          s.href = this.routerSvc.stepHref(s, hash);
        });
        this.ref.detectChanges();
      });
    });
    this.setDetailTabs();
    this.setDisplayedSteps();
    this.setEffectivePrecision();
  }
  @Input() disabledRecipes: string[];
  _displayRate: DisplayRate;
  get displayRate(): DisplayRate {
    return this._displayRate;
  }
  @Input() set displayRate(value: DisplayRate) {
    this._displayRate = value;
    this.rateLabel = DisplayRateLabel[this.displayRate];
  }
  @Input() inserterTarget: InserterTarget;
  @Input() inserterCapacity: InserterCapacity;
  _columns: ColumnsState;
  get columns(): ColumnsState {
    return this._columns;
  }
  @Input() set columns(value: ColumnsState) {
    this._columns = value;
    this.leftSpan = value[Column.Tree].show ? 2 : 1;
    this.setEffectivePrecision();
  }
  @Input() modifiedIgnore: boolean;
  @Input() modifiedBelt: boolean;
  @Input() modifiedWagon: boolean;
  @Input() modifiedFactory: boolean;
  @Input() modifiedOverclock: boolean;
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
  @Output() setBeaconCount = new EventEmitter<DefaultIdPayload<string>>();
  @Output() setBeacon = new EventEmitter<DefaultIdPayload>();
  @Output() setBeaconModules = new EventEmitter<DefaultIdPayload<string[]>>();
  @Output() setBeaconTotal = new EventEmitter<IdPayload>();
  @Output() setOverclock = new EventEmitter<DefaultIdPayload<number>>();
  @Output() setColumns = new EventEmitter<ColumnsState>();
  @Output() resetItem = new EventEmitter<string>();
  @Output() resetRecipe = new EventEmitter<string>();
  @Output() resetIgnore = new EventEmitter();
  @Output() resetBelt = new EventEmitter();
  @Output() resetWagon = new EventEmitter();
  @Output() resetFactory = new EventEmitter();
  @Output() resetOverclock = new EventEmitter();
  @Output() resetBeacons = new EventEmitter();
  @Output() setDisabledRecipes = new EventEmitter<DefaultPayload<string[]>>();
  @Output() setDefaultRecipe = new EventEmitter<DefaultIdPayload>();

  displayedSteps: Step[] = [];
  details: Entities<StepDetailTab[]> = {};
  recipes: Entities<string[]> = {};
  outputs: Entities<Step[]> = {};
  expanded: Entities<StepDetailTab> = {};
  leftSpan = 2;
  effPrecision: Entities<number> = {};
  fragment: string;
  DisplayRateVal = DisplayRateVal;
  ColumnsLeftOfPower = [Column.Belts, Column.Factories, Column.Beacons];
  rateLabel: string;

  totalBelts: Entities<Rational> = {};
  totalWagons: Entities<Rational> = {};
  totalFactories: Entities<Rational> = {};
  totalBeacons: Entities<Rational> = {};
  totalPower: string;
  totalPollution: string;

  Column = Column;
  DisplayRate = DisplayRate;
  ItemId = ItemId;
  ListMode = ListMode;
  StepDetailTab = StepDetailTab;
  Game = Game;
  Rational = Rational;
  PIPE = PIPE;

  constructor(
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private routerSvc: RouterService
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.fragment.subscribe((fragment) => {
      // Store the fragment to navigate to it after the component loads
      this.fragment = fragment;
    });
  }

  ngOnChanges(): void {
    // Total Belts
    this.totalBelts = {};
    for (const step of this.steps.filter((s) => s.belts?.nonzero())) {
      const belt = this.itemSettings[step.itemId].belt;
      if (!this.totalBelts[belt]) {
        this.totalBelts[belt] = Rational.zero;
      }
      this.totalBelts[belt] = this.totalBelts[belt].add(step.belts.ceil());
    }

    // Total Wagons
    this.totalWagons = {};
    for (const step of this.steps.filter((s) => s.wagons?.nonzero())) {
      const wagon = this.itemSettings[step.itemId].wagon;
      if (!this.totalWagons[wagon]) {
        this.totalWagons[wagon] = Rational.zero;
      }
      this.totalWagons[wagon] = this.totalWagons[wagon].add(step.wagons.ceil());
    }

    // Total Factories
    this.totalFactories = {};
    for (const step of this.steps.filter((s) => s.factories?.nonzero())) {
      const recipe = this.data.recipeEntities[step.recipeId];
      // Don't include silos from launch recipes
      if (!recipe.part) {
        let factory = this.recipeSettings[step.recipeId].factory;
        if (
          this.data.game === Game.DysonSphereProgram &&
          factory === ItemId.MiningDrill
        ) {
          // Use recipe id (vein type) in place of mining drill for DSP mining
          factory = step.recipeId;
        }
        if (!this.totalFactories.hasOwnProperty(factory)) {
          this.totalFactories[factory] = Rational.zero;
        }
        this.totalFactories[factory] = this.totalFactories[factory].add(
          step.factories.ceil()
        );
      }

      // Total Beacons
      this.totalBeacons = {};
      for (const step of this.steps.filter((s) => s.beacons?.nonzero())) {
        const beacon = this.recipeSettings[step.recipeId].beacon;
        if (!this.totalBeacons.hasOwnProperty(beacon)) {
          this.totalBeacons[beacon] = Rational.zero;
        }
        this.totalBeacons[beacon] = this.totalBeacons[beacon].add(
          step.beacons.ceil()
        );
      }
    }

    // Total Power
    let value = Rational.zero;
    for (const step of this.steps.filter((s) => s.power)) {
      value = value.add(step.power);
    }
    this.totalPower = this.power(value);

    // Total Pollution
    value = Rational.zero;
    for (const step of this.steps.filter((s) => s.pollution)) {
      value = value.add(step.pollution);
    }
    this.totalPollution = this.rate(value, this.effPrecision[Column.Pollution]);

    // Calculate Tree
    if (this.mode === ListMode.All && this.columns[Column.Tree].show) {
      const indents: Entities<number> = {};
      for (const step of this.steps) {
        let indent: boolean[] = [];
        if (step.parents) {
          const keys = Object.keys(step.parents);
          if (keys.length === 1 && indents[keys[0]] != null) {
            indent = new Array(indents[keys[0]] + 1).fill(false);
          }
        }
        if (step.recipeId) {
          indents[step.recipeId] = indent.length;
        }
        step.indent = indent;
      }

      this.trailIndents();
    }
  }

  ngAfterViewInit(): void {
    // Now that component is loaded, try navigating to the fragment
    try {
      if (this.fragment) {
        document.querySelector('#' + this.fragment).scrollIntoView();
        const step = this.steps.find(
          (s) => s.itemId === this.fragment || s.recipeId === this.fragment
        );
        if (step && this.details[step.id]?.length) {
          this.expanded[step.id] = this.details[step.id][0];
          this.ref.detectChanges();
        }
      }
    } catch (e) {}
  }

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
          (s) =>
            i === Column.Items
              ? (s.items || Rational.zero).sub(s.surplus || Rational.zero)
              : s[i.toLowerCase()]
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
    this.outputs = {};
    for (const step of this.steps) {
      this.details[step.id] = [];
      if (step.itemId) {
        this.details[step.id].push(StepDetailTab.Item);
        this.outputs[step.id] = this.steps
          .filter((s) => s.outputs?.[step.itemId])
          .sort((a, b) =>
            b.outputs[step.itemId].sub(a.outputs[step.itemId]).toNumber()
          );
      }
      if (step.recipeId) {
        this.details[step.id].push(StepDetailTab.Recipe);
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
        .map((s) => s.id)
        .reduce((e: Entities<StepDetailTab>, v) => {
          e[v] = this.details[v][0];
          return e;
        }, {});
    } else {
      this.displayedSteps = [];
      this.expanded = {};
    }
  }

  trackBy(i: number, step: Step): string {
    return step.id;
  }

  link(step: Step): string {
    return `#${step.itemId || step.recipeId}`;
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
      return `${this.rate(
        value.mul(Rational.hundred),
        precision != null ? Math.max(precision - 2, 0) : precision
      )}%`;
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
    if (value.abs().lt(Rational.thousand)) {
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

  toggleDefaultRecipe(itemId: string, recipeId: string): void {
    if (this.itemSettings[itemId].recipe === recipeId) {
      // Reset to null
      this.setDefaultRecipe.emit({
        id: itemId,
        value: null,
        def: null,
      });
    } else {
      // Set default recipe
      this.setDefaultRecipe.emit({
        id: itemId,
        value: recipeId,
        def: RecipeUtility.defaultRecipe(
          itemId,
          this.disabledRecipes,
          this.data
        ),
      });
    }
  }

  toggleRecipe(id: string): void {
    if (this.disabledRecipes.indexOf(id) === -1) {
      this.setDisabledRecipes.emit({
        value: [...this.disabledRecipes, id],
        def: this.data.defaults.disabledRecipes,
      });
    } else {
      this.setDisabledRecipes.emit({
        value: this.disabledRecipes.filter((i) => i !== id),
        def: this.data.defaults.disabledRecipes,
      });
    }
  }

  trailIndents(): void {
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      if (step.indent.length) {
        for (let j = i + 1; j < this.steps.length; j++) {
          const next = this.steps[j];
          if (next.indent.length === step.indent.length) {
            for (let k = i; k < j; k++) {
              const trail = this.steps[k];
              trail.indent[step.indent.length - 1] = true;
            }
            break;
          } else if (next.indent.length < step.indent.length) {
            break;
          }
        }
      }
    }
  }
}
