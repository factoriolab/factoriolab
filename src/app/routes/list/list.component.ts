import {
  Component,
  Input,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnInit,
  ChangeDetectorRef,
  OnChanges,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { combineLatest, filter, map, take } from 'rxjs';

import {
  Step,
  DisplayRate,
  Entities,
  Rational,
  Column,
  ItemId,
  ListMode,
  DisplayRateVal,
  Game,
  PIPE,
  Dataset,
  StepDetailTab,
  RecipeField,
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

@UntilDestroy()
@Component({
  selector: 'lab-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit, OnChanges, AfterViewInit {
  vm$ = combineLatest([
    this.store.select(Factories.getFactories),
    this.store.select(Items.getItemSettings),
    this.store.select(Items.getItemsModified),
    this.store.select(Products.getStepsModified),
    this.store.select(Products.getTotals),
    this.store.select(Products.getSteps),
    this.store.select(Products.getStepDetails),
    this.store.select(Products.getStepByItemEntities),
    this.store.select(Products.getStepTree),
    this.store.select(Products.getEffectivePrecision),
    this.store.select(Products.getEffectivePowerUnit),
    this.store.select(Recipes.getRecipeSettings),
    this.store.select(Recipes.getRecipesModified),
    this.store.select(Recipes.getAdjustedDataset),
    this.store.select(Settings.getSettings),
    this.store.select(Settings.getBeltSpeed),
    this.store.select(Preferences.getColumnsState),
  ]).pipe(
    map(
      ([
        factories,
        itemSettings,
        itemsModified,
        stepsModified,
        totals,
        steps,
        stepDetails,
        stepByItemEntities,
        stepTree,
        effectivePrecision,
        effectivePowerUnit,
        recipeSettings,
        recipesModified,
        data,
        settings,
        beltSpeed,
        columns,
      ]) => ({
        factories,
        itemSettings,
        itemsModified,
        stepsModified,
        totals,
        steps,
        stepDetails,
        stepByItemEntities,
        stepTree,
        effectivePrecision,
        effectivePowerUnit,
        recipeSettings,
        recipesModified,
        data,
        settings,
        beltSpeed,
        columns,
      })
    )
  );

  @Input() mode = ListMode.All;
  @Input() selectedId: string | undefined;

  expanded: Entities<StepDetailTab> = {};
  fragmentId: string | null | undefined;

  ColumnsLeftOfPower = [Column.Belts, Column.Factories, Column.Beacons];
  DisplayRateVal = DisplayRateVal;
  PIPE = PIPE;
  Column = Column;
  DisplayRate = DisplayRate;
  ItemId = ItemId;
  ListMode = ListMode;
  StepDetailTab = StepDetailTab;
  Game = Game;
  RecipeField = RecipeField;
  Rational = Rational;

  constructor(
    private ref: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    public trackService: TrackService,
    public store: Store<LabState>
  ) {}

  ngOnInit(): void {
    this.activatedRoute.fragment
      .pipe(
        take(1),
        filter((f) => f != null)
      )
      .subscribe((id) => {
        // Store the fragment to navigate to it after the component loads
        this.fragmentId = id;
      });
    this.syncDetailTabs();
  }

  ngOnChanges(): void {
    this.expanded = {};
    if (this.selectedId != null) {
      const selected = this.selectedId;
      this.store
        .select(Products.getStepDetails)
        .pipe(take(1))
        .subscribe((stepDetails) => {
          if (stepDetails[selected]?.tabs.length) {
            this.expanded[selected] = stepDetails[selected].tabs[0];
          }
        });
    }
  }

  ngAfterViewInit(): void {
    // Now that component is loaded, try navigating to the fragment
    try {
      if (this.fragmentId) {
        document.querySelector('#' + this.fragmentId)?.scrollIntoView();
        combineLatest([
          this.store.select(Products.getSteps),
          this.store.select(Products.getStepDetails),
        ])
          .pipe(take(1))
          .subscribe(([steps, stepDetails]) => {
            const step = steps.find((s) => s.id === this.fragmentId);
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
          const tabs = stepDetails[id]?.tabs;
          if (!tabs?.length) {
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
    if (step.itemId) {
      this.resetItem(step.itemId);
    }
    if (step.recipeId) {
      this.resetRecipe(step.recipeId);
    }
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
      this.setDefaultRecipe(itemId, undefined, undefined);
    } else {
      // Set default recipe
      this.setDefaultRecipe(
        itemId,
        recipeId,
        RecipeUtility.defaultRecipe(
          itemId,
          settings.disabledRecipes ?? [],
          data
        )
      );
    }
  }

  toggleRecipe(
    id: string,
    settings: Settings.SettingsState,
    data: Dataset
  ): void {
    const disabledRecipes = settings.disabledRecipes ?? [];
    const def = data.defaults?.disabledRecipes;
    if (disabledRecipes.indexOf(id) === -1) {
      this.setDisabledRecipes([...disabledRecipes, id], def);
    } else {
      this.setDisabledRecipes(
        disabledRecipes.filter((i) => i !== id),
        def
      );
    }
  }

  changeFactory(
    recipeId: string,
    value: string,
    factories: Factories.FactoriesState,
    data: Dataset
  ): void {
    this.setFactory(
      recipeId,
      value,
      RecipeUtility.bestMatch(
        data.recipeEntities[recipeId].producers,
        factories.ids ?? []
      )
    );
  }

  changeRecipeField(
    recipeId: string,
    event: string | Event,
    recipeSettings: Recipes.RecipesState,
    factories: Factories.FactoriesState,
    field: RecipeField,
    index?: number,
    data?: Dataset
  ): void {
    const recipe = recipeSettings[recipeId];
    if (recipe.factory) {
      const factory = factories.entities[recipe.factory];
      switch (field) {
        case RecipeField.FactoryModules: {
          if (
            factory.moduleRank != null &&
            data != null &&
            typeof event === 'string' &&
            index != null &&
            recipe.factoryModules != null
          ) {
            const count = recipe.factoryModules.length;
            const options = [...data.recipeModuleIds[recipeId], ItemId.Module];
            const def = RecipeUtility.defaultModules(
              options,
              factory.moduleRank,
              count
            );
            const modules = this.generateModules(
              index,
              event,
              recipe.factoryModules
            );
            this.setFactoryModules(recipeId, modules, def);
          }
          break;
        }
        case RecipeField.BeaconCount: {
          if (typeof event === 'string') {
            const def = factory.beaconCount;
            this.setBeaconCount(recipeId, event, def);
          }
          break;
        }
        case RecipeField.BeaconModules: {
          if (
            typeof event === 'string' &&
            index != null &&
            recipe.beaconModules != null
          ) {
            const count = recipe.beaconModules.length;
            const def = new Array(count).fill(factory.beaconModule);
            const value = this.generateModules(
              index,
              event,
              recipe.beaconModules
            );
            this.setBeaconModules(recipeId, value, def);
          }
          break;
        }
        case RecipeField.Overclock: {
          if (typeof event !== 'string') {
            const target = event.target as HTMLInputElement;
            const value = target.valueAsNumber;
            if (value >= 1 && value <= 250) {
              const def = factory.overclock;
              this.setOverclock(recipeId, value, def);
            }
          }
          break;
        }
      }
    }
  }

  generateModules(index: number, value: string, original: string[]): string[] {
    const modules = [...original]; // Copy
    // Fill in index to the right
    for (let i = index; i < modules.length; i++) {
      modules[i] = value;
    }
    return modules;
  }

  /** Action Dispatch Methods */
  ignoreItem(value: string): void {
    this.store.dispatch(new Items.IgnoreItemAction(value));
  }

  setBelt(id: string, value: string, def: string): void {
    this.store.dispatch(new Items.SetBeltAction({ id, value, def }));
  }

  setWagon(id: string, value: string, def: string): void {
    this.store.dispatch(new Items.SetWagonAction({ id, value, def }));
  }

  setFactory(id: string, value: string, def: string): void {
    this.store.dispatch(new Recipes.SetFactoryAction({ id, value, def }));
  }

  setFactoryModules(
    id: string,
    value: string[],
    def: string[] | undefined
  ): void {
    this.store.dispatch(
      new Recipes.SetFactoryModulesAction({ id, value, def })
    );
  }

  setBeaconCount(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(new Recipes.SetBeaconCountAction({ id, value, def }));
  }

  setBeacon(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(new Recipes.SetBeaconAction({ id, value, def }));
  }

  setBeaconModules(
    id: string,
    value: string[],
    def: string[] | undefined
  ): void {
    this.store.dispatch(new Recipes.SetBeaconModulesAction({ id, value, def }));
  }

  setBeaconTotal(id: string, value: string): void {
    this.store.dispatch(new Recipes.SetBeaconTotalAction({ id, value }));
  }

  setOverclock(id: string, value: number, def: number | undefined): void {
    this.store.dispatch(new Recipes.SetOverclockAction({ id, value, def }));
  }

  resetItem(value: string): void {
    this.store.dispatch(new Items.ResetItemAction(value));
  }

  resetRecipe(value: string): void {
    this.store.dispatch(new Recipes.ResetRecipeAction(value));
  }

  resetIgnore(): void {
    this.store.dispatch(new Items.ResetIgnoreAction());
  }

  resetBelt(): void {
    this.store.dispatch(new Items.ResetBeltAction());
  }

  resetWagon(): void {
    this.store.dispatch(new Items.ResetWagonAction());
  }

  resetFactory(): void {
    this.store.dispatch(new Recipes.ResetFactoryAction());
  }

  resetOverclock(): void {
    this.store.dispatch(new Recipes.ResetOverclockAction());
  }

  resetBeacons(): void {
    this.store.dispatch(new Recipes.ResetBeaconsAction());
  }

  setDisabledRecipes(value: string[], def: string[] | undefined): void {
    this.store.dispatch(new Settings.SetDisabledRecipesAction({ value, def }));
  }

  setDefaultRecipe(
    id: string,
    value: string | undefined,
    def: string | undefined
  ): void {
    this.store.dispatch(new Items.SetRecipeAction({ id, value, def }));
  }
}
