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
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { combineLatest, map, take } from 'rxjs';

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
  DefaultPayload,
  Game,
  PIPE,
  IdPayload,
  PowerUnit,
  Dataset,
  StepDetailTab,
} from '~/models';
import { TrackService } from '~/services';
import { LabState } from '~/store';
import * as Factories from '~/store/factories';
import * as Items from '~/store/items';
import * as Preferences from '~/store/preferences';
import * as Products from '~/store/products';
import * as Recipes from '~/store/recipes';
import * as Settings from '~/store/settings';
import { ExportUtility, RecipeUtility } from '~/utilities';
import { RecipeSettingsComponent } from '../../recipe-settings.component';

@UntilDestroy()
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
  vm$ = combineLatest([
    this.store.select(Factories.getFactorySettings),
    this.store.select(Items.getItemSettings),
    this.store.select(Items.getItemsModified),
    this.store.select(Products.getStepsModified),
    this.store.select(Products.getTotals),
    this.store.select(Products.getSteps),
    this.store.select(Products.getStepDetails),
    this.store.select(Products.getStepEntities),
    this.store.select(Products.getStepTree),
    this.store.select(Recipes.getRecipeSettings),
    this.store.select(Recipes.getRecipesModified),
    this.store.select(Recipes.getAdjustedDataset),
    this.store.select(Settings.getSettings),
    this.store.select(Settings.getBeltSpeed),
    this.store.select(Preferences.getColumnsState),
    this.store.select(Preferences.getEffectivePrecision),
    this.store.select(Preferences.getEffectivePowerUnit),
  ]).pipe(
    map(
      ([
        factorySettings,
        itemSettings,
        itemsModified,
        stepsModified,
        totals,
        steps,
        stepDetails,
        stepEntities,
        stepTree,
        recipeSettings,
        recipesModified,
        data,
        settings,
        beltSpeed,
        columns,
        effectivePrecision,
        effectivePowerUnit,
      ]) => ({
        factorySettings,
        itemSettings,
        itemsModified,
        stepsModified,
        totals,
        steps,
        stepDetails,
        stepEntities,
        stepTree,
        recipeSettings,
        recipesModified,
        data,
        settings,
        beltSpeed,
        columns,
        effectivePrecision,
        effectivePowerUnit,
      })
    )
  );

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

  expanded: Entities<StepDetailTab> = {};
  effPowerUnit = PowerUnit.kW;
  fragment: string | null = null;
  DisplayRateVal = DisplayRateVal;
  ColumnsLeftOfPower = [Column.Belts, Column.Factories, Column.Beacons];

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
    store: Store<LabState>
  ) {
    super(store);
  }

  ngOnInit(): void {
    this.route.fragment.subscribe((fragment) => {
      // Store the fragment to navigate to it after the component loads
      this.fragment = fragment;
    });
  }

  ngOnChanges(): void {
    this.expanded = {};
    if (this.selected != null) {
      const selected = this.selected;
      this.store
        .select(Products.getStepDetails)
        .pipe(take(1))
        .subscribe((stepDetails) => {
          if (stepDetails[selected].tabs.length) {
            this.expanded[selected] = stepDetails[selected].tabs[0];
          }
        });
    }
  }

  ngAfterViewInit(): void {
    // Now that component is loaded, try navigating to the fragment
    try {
      if (this.fragment) {
        document.querySelector('#' + this.fragment)?.scrollIntoView();
        combineLatest([
          this.store.select(Products.getSteps),
          this.store.select(Products.getStepDetails),
        ])
          .pipe(take(1))
          .subscribe(([steps, stepDetails]) => {
            const step = steps.find((s) => s.id === this.fragment);
            if (step) {
              const tabs = stepDetails[step.id].tabs;
              if (tabs.length) {
                this.expanded[step.id] = tabs[0];
              }
            }
          });
      }
    } catch (e) {}
  }

  syncDetailTabs(): void {
    this.store
      .select(Products.getStepDetails)
      .pipe(untilDestroyed(this))
      .subscribe((stepDetails) => {
        // Hide any step details that are no longer valid
        for (const id of Object.keys(this.expanded).filter(
          (i) => this.expanded[i]
        )) {
          const tabs = stepDetails[id].tabs;
          if (tabs.length) {
            // Collapse this step
            delete this.expanded[id];
          } else if (tabs.indexOf(this.expanded[id]) === -1) {
            // Pick a different tab
            this.expanded[id] = tabs[0];
          }
        }
        this.ref.detectChanges();
      });
  }

  resetStep(step: Step): void {
    this.resetItem.emit(step.itemId);
    this.resetRecipe.emit(step.recipeId);
  }

  export(
    steps: Step[],
    itemSettings: Items.ItemsState,
    recipeSettings: Recipes.RecipesState,
    columns: Preferences.ColumnsState,
    data: Dataset
  ): void {
    ExportUtility.stepsToCsv(
      steps,
      columns,
      itemSettings,
      recipeSettings,
      data
    );
  }

  toggleDefaultRecipe(
    itemId: string,
    recipeId: string,
    itemSettings: Items.ItemsState,
    settings: Settings.SettingsState,
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
        def: RecipeUtility.defaultRecipe(
          itemId,
          settings.disabledRecipes ?? [],
          data
        ),
      });
    }
  }

  toggleRecipe(
    id: string,
    settings: Settings.SettingsState,
    data: Dataset
  ): void {
    const disabledRecipes = settings.disabledRecipes ?? [];
    if (disabledRecipes.indexOf(id) === -1) {
      this.setDisabledRecipes.emit({
        value: [...disabledRecipes, id],
        def: data.defaults?.disabledRecipes,
      });
    } else {
      this.setDisabledRecipes.emit({
        value: disabledRecipes.filter((i) => i !== id),
        def: data.defaults?.disabledRecipes,
      });
    }
  }
}
