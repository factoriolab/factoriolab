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
import {
  ContentService,
  ExportService,
  RouterService,
  TrackService,
} from '~/services';
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
import { RecipeUtility } from '~/utilities';

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
    this.routerSvc.zipConfig$,
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
        zipPartial,
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
        zipPartial,
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
    private store: Store<LabState>,
    private exportSvc: ExportService,
    private routerSvc: RouterService
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
        const [_, stepId, tabId] = this.fragmentId.split('_');
        combineLatest([
          this.store.select(Products.getSteps),
          this.store.select(Products.getStepDetails),
        ])
          .pipe(first())
          .subscribe(([steps, stepDetails]) => {
            const step = steps.find((s) => s.id === stepId);
            if (step) {
              const tabs = stepDetails[step.id].tabs;
              if (tabs.length) {
                if (this.stepsTable) {
                  this.stepsTable.toggleRow(step);
                  setTimeout(() => {
                    if (tabId) {
                      const tab = document.querySelector(
                        '#' + this.fragmentId + '_tab'
                      ) as HTMLElement | null;
                      if (tab) {
                        tab.click();
                      }
                    } else {
                      document
                        .querySelector('#' + this.fragmentId)
                        ?.scrollIntoView();
                    }
                  }, 10);
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
    this.exportSvc.stepsToCsv(
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

  changeRecipeField(
    step: Step,
    event: string | number,
    factories: Factories.FactoriesState,
    data: Dataset,
    field: RecipeField,
    index?: number,
    subindex?: number
  ): void {
    if (step.recipeId == null) return;

    const id = step.producerId ?? step.recipeId;
    const isProducer = step.producerId != null;
    const settings = step.recipeSettings;
    if (settings?.factoryId) {
      const factorySettings = factories.entities[settings.factoryId];
      switch (field) {
        case RecipeField.Factory: {
          if (typeof event === 'string' && factories.ids != null) {
            this.setFactory(
              step.producerId ?? step.recipeId,
              event,
              RecipeUtility.bestMatch(
                data.recipeEntities[step.recipeId].producers,
                factories.ids
              ),
              step.producerId != null
            );
          }

          break;
        }
        case RecipeField.FactoryModules: {
          if (
            factorySettings.moduleRankIds != null &&
            data != null &&
            typeof event === 'string' &&
            index != null &&
            settings.factoryModuleIds != null
          ) {
            const factory = data.factoryEntities[settings.factoryId];
            const count = settings.factoryModuleIds.length;
            const options = RecipeUtility.moduleOptions(
              factory,
              step.recipeId,
              data
            );
            const def = RecipeUtility.defaultModules(
              options,
              factorySettings.moduleRankIds,
              count
            );
            const modules = this.generateModules(
              index,
              event,
              settings.factoryModuleIds
            );
            this.setFactoryModules(id, modules, def, isProducer);
          }
          break;
        }
        case RecipeField.BeaconCount: {
          if (typeof event === 'string' && index != null) {
            const def = factorySettings.beaconCount;
            this.setBeaconCount(id, index, event, def, isProducer);
          }
          break;
        }
        case RecipeField.Beacon: {
          if (typeof event === 'string' && index != null) {
            const def = factorySettings.beaconId;
            this.setBeacon(id, index, event, def, isProducer);
          }
          break;
        }
        case RecipeField.BeaconModules: {
          if (
            factorySettings.beaconModuleRankIds != null &&
            typeof event === 'string' &&
            index != null &&
            subindex != null
          ) {
            const beaconSettings = settings.beacons?.[index];
            if (
              beaconSettings?.id != null &&
              beaconSettings?.moduleIds != null
            ) {
              const beacon = data.beaconEntities[beaconSettings.id];
              const count = beaconSettings.moduleIds.length;
              const options = RecipeUtility.moduleOptions(
                beacon,
                step.recipeId,
                data
              );
              const def = RecipeUtility.defaultModules(
                options,
                factorySettings.beaconModuleRankIds,
                count
              );
              const value = this.generateModules(
                subindex,
                event,
                beaconSettings.moduleIds
              );
              this.setBeaconModules(id, index, value, def, isProducer);
            }
          }
          break;
        }
        case RecipeField.BeaconTotal: {
          if (typeof event === 'string' && index != null) {
            this.setBeaconTotal(id, index, event, isProducer);
          }
          break;
        }
        case RecipeField.Overclock: {
          if (typeof event === 'number') {
            const def = factorySettings.overclock;
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

  addBeacon(id: string, producer = false): void {
    const action = producer
      ? Producers.AddBeaconAction
      : Recipes.AddBeaconAction;
    this.store.dispatch(new action(id));
  }

  removeBeacon(id: string, value: number, producer = false): void {
    const action = producer
      ? Producers.RemoveBeaconAction
      : Recipes.RemoveBeaconAction;
    this.store.dispatch(new action({ id, value }));
  }

  setBeaconCount(
    id: string,
    index: number,
    value: string,
    def: string | undefined,
    producer = false
  ): void {
    const action = producer
      ? Producers.SetBeaconCountAction
      : Recipes.SetBeaconCountAction;
    this.store.dispatch(new action({ id, index, value, def }));
  }

  setBeacon(
    id: string,
    index: number,
    value: string,
    def: string | undefined,
    producer = false
  ): void {
    const action = producer
      ? Producers.SetBeaconAction
      : Recipes.SetBeaconAction;
    this.store.dispatch(new action({ id, index, value, def }));
  }

  setBeaconModules(
    id: string,
    index: number,
    value: string[],
    def: string[] | undefined,
    producer = false
  ): void {
    const action = producer
      ? Producers.SetBeaconModulesAction
      : Recipes.SetBeaconModulesAction;
    this.store.dispatch(new action({ id, index, value, def }));
  }

  setBeaconTotal(
    id: string,
    index: number,
    value: string,
    producer = false
  ): void {
    const action = producer
      ? Producers.SetBeaconTotalAction
      : Recipes.SetBeaconTotalAction;
    this.store.dispatch(new action({ id, index, value }));
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

  resetRecipes(): void {
    this.store.dispatch(new Items.ResetRecipesAction());
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
