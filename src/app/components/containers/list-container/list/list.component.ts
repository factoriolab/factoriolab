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
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

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
  PowerUnit,
  Dataset,
} from '~/models';
import { TrackService } from '~/services';
import { State } from '~/store';
import * as Items from '~/store/items';
import { ItemsState } from '~/store/items';
import { initialColumnsState } from '~/store/preferences';
import * as Products from '~/store/products';
import * as Recipes from '~/store/recipes';
import { RecipesState } from '~/store/recipes';
import { initialSettingsState } from '~/store/settings';
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
  itemSettings$ = this.store.select(Items.getItemSettings);
  itemsModified$ = this.store.select(Items.getItemsModified);
  stepsModified$ = this.store.select(Products.getStepsModified);
  itemTotals$ = this.store.select(Products.getItemTotals);
  recipeTotals$ = this.store.select(Products.getRecipeTotals);
  miscTotals$ = this.store.select(Products.getMiscTotals);
  recipesModified$ = this.store.select(Recipes.getRecipesModified);

  @Input() settings = initialSettingsState;
  @Input() beltSpeed: Entities<Rational> = {};
  @Input() steps: Step[] = [];
  @Input() disabledRecipes: string[] = [];
  @Input() displayRate = DisplayRate.PerMinute;
  @Input() inserterTarget = InserterTarget.Chest;
  @Input() inserterCapacity = InserterCapacity.Capacity0;
  @Input() columns = initialColumnsState;
  @Input() powerUnit = PowerUnit.Auto;
  @Input() mode = ListMode.All;
  @Input() selected: string | undefined;

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
  @Output() resetItem = new EventEmitter<string>();
  @Output() resetRecipe = new EventEmitter<string>();
  @Output() resetIgnore = new EventEmitter();
  @Output() resetBelt = new EventEmitter();
  @Output() resetWagon = new EventEmitter();
  @Output() resetFactory = new EventEmitter();
  @Output() resetOverclock = new EventEmitter();
  @Output() resetBeacons = new EventEmitter();
  @Output() setDisabledRecipes = new EventEmitter<
    DefaultPayload<string[] | undefined>
  >();
  @Output() setDefaultRecipe = new EventEmitter<
    DefaultIdPayload<string | undefined>
  >();

  displayedSteps: Step[] = [];
  details: Entities<StepDetailTab[]> = {};
  recipes: Entities<string[]> = {};
  outputs: Entities<Step[]> = {};
  expanded: Entities<StepDetailTab> = {};
  leftSpan = 2;
  effPrecision: Entities<number | null> = {};
  effPowerUnit = PowerUnit.kW;
  fragment: string | null = null;
  DisplayRateVal = DisplayRateVal;
  ColumnsLeftOfPower = [Column.Belts, Column.Factories, Column.Beacons];
  rateLabel: string | undefined;

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
    public track: TrackService,
    store: Store<State>
  ) {
    super(store);
  }

  ngOnInit(): void {
    this.route.fragment.subscribe((fragment) => {
      // Store the fragment to navigate to it after the component loads
      this.fragment = fragment;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['steps']) {
      this.setDetailTabs();
    }

    if (changes['steps'] || changes['mode'] || changes['selected']) {
      this.setDisplayedSteps();
    }

    if (changes['steps'] || changes['columns'] || changes['powerUnit']) {
      this.setEffectivePrecision();
    }

    if (changes['displayRate']) {
      this.rateLabel = DisplayRateLabel[this.displayRate];
    }

    if (changes['columns']) {
      this.leftSpan = this.columns[Column.Tree].show ? 2 : 1;
    }

    if (changes['steps'] || changes['mode'] || changes['columns']) {
      this.calculateTree();
    }
  }

  ngAfterViewInit(): void {
    // Now that component is loaded, try navigating to the fragment
    try {
      if (this.fragment) {
        document.querySelector('#' + this.fragment)?.scrollIntoView();
        const step = this.steps.find(
          (s) => s.itemId === this.fragment || s.recipeId === this.fragment
        );
        if (step?.id && this.details[step.id]?.length) {
          this.expanded[step.id] = this.details[step.id][0];
          this.ref.detectChanges();
        }
      }
    } catch (e) {}
  }

  setDetailTabs(): void {
    this.details = {};
    this.recipes = {};
    this.outputs = {};
    for (const step of this.steps) {
      if (step.id) {
        this.details[step.id] = [];
        if (step.itemId) {
          this.details[step.id].push(StepDetailTab.Item);
          this.outputs[step.id] = this.steps
            .filter((s) => s.outputs?.[step.itemId] != null)
            .sort((a, b) =>
              (b.outputs?.[step.itemId] || Rational.zero)
                .sub(a.outputs?.[step.itemId] || Rational.zero)
                .toNumber()
            );
        }
        if (step.recipeId) {
          this.details[step.id].push(StepDetailTab.Recipe);
        }
        if (step.factories?.nonzero()) {
          this.details[step.id].push(StepDetailTab.Factory);
        }
        if (step.itemId) {
          // const recipeIds = this.data.complexRecipeIds.filter((r) =>
          //   this.data.recipeR[r].produces(step.itemId)
          // );
          const recipeIds = [];
          if (recipeIds.length) {
            this.details[step.id].push(StepDetailTab.Recipes);
            this.recipes[step.id] = recipeIds;
          }
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
          if (v != null) {
            e[v] = this.details[v][0];
          }
          return e;
        }, {});
    } else {
      this.displayedSteps = [];
      this.expanded = {};
    }
  }

  setEffectivePrecision(): void {
    if (this.steps && this.columns) {
      this.effPrecision = {};
      this.effPrecision[Column.Surplus] = this.effPrecFrom(
        this.columns[Column.Items].precision,
        (s) => s.surplus
      );

      for (const i of PrecisionColumns.filter((i) => this.columns[i].show)) {
        this.effPrecision[i] = this.effPrecFrom(
          this.columns[i].precision,
          (s) =>
            i === Column.Items
              ? (s.items || Rational.zero).sub(s.surplus || Rational.zero)
              : (s as Record<string, any>)[i.toLowerCase()]
        );
      }

      if (this.columns[Column.Power].show) {
        if (this.powerUnit === PowerUnit.Auto) {
          let minPower: Rational | undefined;
          for (const step of this.steps.filter((s) => s.power != null)) {
            if (minPower == null || step.power!.lt(minPower)) {
              minPower = step.power;
            }
          }
          minPower = minPower ?? Rational.zero;
          if (minPower.lt(Rational.thousand)) {
            this.effPowerUnit = PowerUnit.kW;
          } else if (minPower.lt(Rational.million)) {
            this.effPowerUnit = PowerUnit.MW;
          } else {
            this.effPowerUnit = PowerUnit.GW;
          }
        } else {
          this.effPowerUnit = this.powerUnit;
        }
      }
    }
  }

  effPrecFrom(
    precision: number | null,
    fn: (step: Step) => Rational | undefined
  ): number | null {
    if (precision == null) {
      return precision;
    }
    let max = 0;
    for (const step of this.steps) {
      const dec = fn(step)?.toDecimals() ?? 0;
      if (dec >= precision) {
        return precision;
      } else if (dec > max) {
        max = dec;
      }
    }
    return max;
  }

  calculateTree(): void {
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

  trailIndents(): void {
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      if (step.indent?.length) {
        for (let j = i + 1; j < this.steps.length; j++) {
          const next = this.steps[j];
          if (next.indent) {
            if (next.indent.length === step.indent.length) {
              for (let k = i; k < j; k++) {
                const trail = this.steps[k];
                if (trail.indent) {
                  trail.indent[step.indent.length - 1] = true;
                }
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

  link(step: Step): string {
    return `#${step.itemId || step.recipeId}`;
  }

  findStep(id: string): Step | undefined {
    return this.steps.find((s) => s.itemId === id);
  }

  sortKeyValue(
    a: KeyValue<string, Rational>,
    b: KeyValue<string, Rational>
  ): number {
    return b.value.sub(a.value).toNumber();
  }

  leftPad(value: string): string {
    return ' '.repeat(4 - value.length) + value;
  }

  inserter(value: Rational, data: Dataset): StepInserter | null {
    const inserter = InserterData[this.inserterTarget][
      this.inserterCapacity
    ].find((d) => d.value.gt(value) || d.id === ItemId.StackInserter);

    if (inserter == null || data.itemEntities[inserter.id] == null) {
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

  export(
    itemSettings: ItemsState,
    recipeSettings: RecipesState,
    data: Dataset
  ): void {
    ExportUtility.stepsToCsv(
      this.steps,
      this.columns,
      itemSettings,
      recipeSettings,
      data
    );
  }

  toggleDefaultRecipe(
    itemId: string,
    recipeId: string,
    itemSettings: ItemsState,
    data: Dataset
  ): void {
    if (itemSettings[itemId].recipe === recipeId) {
      // Reset to null
      this.setDefaultRecipe.emit({
        id: itemId,
        value: undefined,
        def: undefined,
      });
    } else {
      // Set default recipe
      this.setDefaultRecipe.emit({
        id: itemId,
        value: recipeId,
        def: RecipeUtility.defaultRecipe(itemId, this.disabledRecipes, data),
      });
    }
  }

  toggleRecipe(id: string, data: Dataset): void {
    if (this.disabledRecipes.indexOf(id) === -1) {
      this.setDisabledRecipes.emit({
        value: [...this.disabledRecipes, id],
        def: data.defaults?.disabledRecipes,
      });
    } else {
      this.setDisabledRecipes.emit({
        value: this.disabledRecipes.filter((i) => i !== id),
        def: data.defaults?.disabledRecipes,
      });
    }
  }
}
