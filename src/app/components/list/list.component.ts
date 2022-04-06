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
import { combineLatest, map, take } from 'rxjs';

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
import { RecipeSettingsComponent } from '../containers/recipe-settings.component';

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

  expanded: Entities<StepDetailTab> = {};
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
    this.resetItem(step.itemId);
    this.resetRecipe(step.recipeId);
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
    if (disabledRecipes.indexOf(id) === -1) {
      this.setDisabledRecipes(
        [...disabledRecipes, id],
        data.defaults?.disabledRecipes
      );
    } else {
      this.setDisabledRecipes(
        disabledRecipes.filter((i) => i !== id),
        data.defaults?.disabledRecipes
      );
    }
  }

  /** Action Dispatch Methods */
  ignoreItem(value: string | undefined): void {
    if (value) {
      this.store.dispatch(new Items.IgnoreItemAction(value));
    }
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

  resetItem(value: string | undefined): void {
    if (value != null) {
      this.store.dispatch(new Items.ResetItemAction(value));
    }
  }

  resetRecipe(value: string | undefined): void {
    if (value != null) {
      this.store.dispatch(new Recipes.ResetRecipeAction(value));
    }
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
