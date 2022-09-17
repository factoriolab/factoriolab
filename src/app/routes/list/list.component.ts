import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Table } from 'primeng/table';
import { combineLatest, filter, first, map } from 'rxjs';

import {
  Column,
  Dataset,
  Game,
  ItemId,
  Rational,
  RecipeField,
  Step,
  StepDetailTab,
} from '~/models';
import { ContentService, TrackService } from '~/services';
import {
  Factories,
  Items,
  LabState,
  Preferences,
  Producers,
  Products,
  Recipes,
  Settings,
} from '~/store';
import { ExportUtility, RecipeUtility } from '~/utilities';

@Component({
  selector: 'lab-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit, AfterViewInit {
  vm$ = combineLatest([
    this.store.select(Factories.getFactories),
    this.store.select(Items.getItemSettings),
    this.store.select(Items.getItemsModified),
    this.store.select(Products.getStepsModified),
    this.store.select(Products.getTotals),
    this.store.select(Products.getSteps),
    this.store.select(Products.getStepDetails),
    this.store.select(Products.getStepById),
    this.store.select(Products.getStepByItemEntities),
    this.store.select(Products.getStepTree),
    this.store.select(Products.getEffectivePrecision),
    this.store.select(Products.getEffectivePowerUnit),
    this.store.select(Recipes.getRecipeSettings),
    this.store.select(Recipes.getRecipesModified),
    this.store.select(Recipes.getAdjustedDataset),
    this.store.select(Settings.getColumnsState),
    this.store.select(Settings.getSettings),
    this.store.select(Settings.getDisplayRateInfo),
    this.store.select(Settings.getOptions),
    this.store.select(Settings.getBeltSpeed),
    this.store.select(Settings.getBeltSpeedTxt),
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
        stepById,
        stepByItemEntities,
        stepTree,
        effectivePrecision,
        effectivePowerUnit,
        recipeSettings,
        recipesModified,
        data,
        columns,
        settings,
        dispRateInfo,
        options,
        beltSpeed,
        beltSpeedTxt,
      ]) => ({
        factories,
        itemSettings,
        itemsModified,
        stepsModified,
        totals,
        steps,
        stepDetails,
        stepById,
        stepByItemEntities,
        stepTree,
        effectivePrecision,
        effectivePowerUnit,
        recipeSettings,
        recipesModified,
        data,
        columns,
        settings,
        dispRateInfo,
        options,
        beltSpeed,
        beltSpeedTxt,
      })
    )
  );

  @ViewChild('stepsTable') stepsTable: Table | undefined;

  fragmentId: string | null | undefined;

  Column = Column;
  ItemId = ItemId;
  StepDetailTab = StepDetailTab;
  Game = Game;
  RecipeField = RecipeField;
  Rational = Rational;

  constructor(
    public contentSvc: ContentService,
    public trackSvc: TrackService,
    private route: ActivatedRoute,
    private store: Store<LabState>
  ) {}

  ngOnInit(): void {
    this.route.fragment
      .pipe(
        first(),
        filter((f) => f != null)
      )
      .subscribe((id) => {
        // Store the fragment to navigate to it after the component loads
        this.fragmentId = id;
      });
  }

  ngAfterViewInit(): void {
    // Now that component is loaded, try navigating to the fragment
    try {
      if (this.fragmentId) {
        document.querySelector('#\\' + this.fragmentId)?.scrollIntoView();
        combineLatest([
          this.store.select(Products.getSteps),
          this.store.select(Products.getStepDetails),
        ])
          .pipe(first())
          .subscribe(([steps, stepDetails]) => {
            const step = steps.find((s) => s.id === this.fragmentId);
            if (step) {
              const tabs = stepDetails[step.id].tabs;
              if (tabs.length) {
                if (this.stepsTable) {
                  this.stepsTable.toggleRow(step);
                }
              }
            }
          });
      }
    } catch {
      // ignore error
    }
  }

  resetStep(step: Step): void {
    if (step.itemId) {
      this.resetItem(step.itemId);
    }
    if (step.recipeId) {
      this.resetRecipe(step.recipeId);
    }
    if (step.producerId) {
      this.resetProducer(step.producerId);
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
    if (itemSettings[itemId].recipeId === recipeId) {
      // Reset to null
      this.setDefaultRecipe(itemId);
    } else {
      // Set default recipe
      this.setDefaultRecipe(
        itemId,
        recipeId,
        RecipeUtility.defaultRecipe(
          itemId,
          settings.disabledRecipeIds ?? [],
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
    const disabledRecipes = settings.disabledRecipeIds ?? [];
    const def = data.defaults?.disabledRecipeIds;
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
    step: Step,
    value: string,
    factories: Factories.FactoriesState,
    data: Dataset
  ): void {
    if (step.recipeId == null) return;

    this.setFactory(
      step.producerId ?? step.recipeId,
      value,
      RecipeUtility.bestMatch(
        data.recipeEntities[step.recipeId].producers,
        factories.ids ?? []
      ),
      step.producerId != null
    );
  }

  changeRecipeField(
    step: Step,
    event: string | number,
    recipeSettings: Recipes.RecipesState,
    factories: Factories.FactoriesState,
    field: RecipeField,
    index?: number,
    data?: Dataset
  ): void {
    if (step.recipeId == null) return;

    const id = step.producerId ?? step.recipeId;
    const isProducer = step.producerId != null;
    const recipe = recipeSettings[step.recipeId];
    if (recipe.factoryId) {
      const factory = factories.entities[recipe.factoryId];
      switch (field) {
        case RecipeField.FactoryModules: {
          if (
            factory.moduleRankIds != null &&
            data != null &&
            typeof event === 'string' &&
            index != null &&
            recipe.factoryModuleIds != null
          ) {
            const count = recipe.factoryModuleIds.length;
            const options = [
              ...data.recipeModuleIds[step.recipeId],
              ItemId.Module,
            ];
            const def = RecipeUtility.defaultModules(
              options,
              factory.moduleRankIds,
              count
            );
            const modules = this.generateModules(
              index,
              event,
              recipe.factoryModuleIds
            );
            this.setFactoryModules(id, modules, def, isProducer);
          }
          break;
        }
        case RecipeField.BeaconCount: {
          if (typeof event === 'string') {
            const def = factory.beaconCount;
            this.setBeaconCount(id, event, def, isProducer);
          }
          break;
        }
        case RecipeField.Beacon: {
          if (typeof event === 'string') {
            const def = factory.beaconId;
            this.setBeacon(id, event, def, isProducer);
          }
          break;
        }
        case RecipeField.BeaconModules: {
          if (
            typeof event === 'string' &&
            index != null &&
            recipe.beaconModuleIds != null
          ) {
            const count = recipe.beaconModuleIds.length;
            const def = new Array(count).fill(factory.beaconModuleId);
            const value = this.generateModules(
              index,
              event,
              recipe.beaconModuleIds
            );
            this.setBeaconModules(id, value, def, isProducer);
          }
          break;
        }
        case RecipeField.Overclock: {
          if (typeof event === 'number') {
            const def = factory.overclock;
            const value = Math.max(1, Math.min(250, event));
            this.setOverclock(id, value, def, isProducer);
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

  setFactory(id: string, value: string, def: string, producer = false): void {
    const action = producer
      ? Producers.SetFactoryAction
      : Recipes.SetFactoryAction;
    this.store.dispatch(new action({ id, value, def }));
  }

  setFactoryModules(
    id: string,
    value: string[],
    def: string[] | undefined,
    producer = false
  ): void {
    const action = producer
      ? Producers.SetFactoryModulesAction
      : Recipes.SetFactoryModulesAction;
    this.store.dispatch(new action({ id, value, def }));
  }

  setBeaconCount(
    id: string,
    value: string,
    def: string | undefined,
    producer = false
  ): void {
    const action = producer
      ? Producers.SetBeaconCountAction
      : Recipes.SetBeaconCountAction;
    this.store.dispatch(new action({ id, value, def }));
  }

  setBeacon(
    id: string,
    value: string,
    def: string | undefined,
    isProducer = false
  ): void {
    const action = isProducer
      ? Producers.SetBeaconAction
      : Recipes.SetBeaconAction;
    this.store.dispatch(new action({ id, value, def }));
  }

  setBeaconModules(
    id: string,
    value: string[],
    def: string[] | undefined,
    producer = false
  ): void {
    const action = producer
      ? Producers.SetBeaconModulesAction
      : Recipes.SetBeaconModulesAction;
    this.store.dispatch(new action({ id, value, def }));
  }

  setBeaconTotal(id: string, value: string): void {
    this.store.dispatch(new Recipes.SetBeaconTotalAction({ id, value }));
  }

  setOverclock(
    id: string,
    value: number,
    def: number | undefined,
    producer = false
  ): void {
    const action = producer
      ? Producers.SetOverclockAction
      : Recipes.SetOverclockAction;
    this.store.dispatch(new action({ id, value, def }));
  }

  resetItem(value: string): void {
    this.store.dispatch(new Items.ResetItemAction(value));
  }

  resetRecipe(value: string): void {
    this.store.dispatch(new Recipes.ResetRecipeAction(value));
  }

  resetProducer(value: string): void {
    this.store.dispatch(new Producers.ResetProducerAction(value));
  }

  resetIgnores(): void {
    this.store.dispatch(new Items.ResetIgnoresAction());
  }

  resetBelts(): void {
    this.store.dispatch(new Items.ResetBeltsAction());
  }

  resetWagons(): void {
    this.store.dispatch(new Items.ResetWagonsAction());
  }

  resetFactories(): void {
    this.store.dispatch(new Recipes.ResetFactoriesAction());
  }

  resetBeacons(): void {
    this.store.dispatch(new Recipes.ResetBeaconsAction());
  }

  setDisabledRecipes(value: string[], def: string[] | undefined): void {
    this.store.dispatch(new Settings.SetDisabledRecipesAction({ value, def }));
  }

  setDefaultRecipe(id: string, value?: string, def?: string): void {
    this.store.dispatch(new Items.SetRecipeAction({ id, value, def }));
  }
}
