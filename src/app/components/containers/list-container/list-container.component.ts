import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import {
  Step,
  DisplayRate,
  Dataset,
  DefaultIdPayload,
  ListMode,
  Entities,
  Rational,
  InserterTarget,
  InserterCapacity,
  DefaultPayload,
  IdPayload,
} from '~/models';
import { State } from '~/store';
import * as Factories from '~/store/factories';
import * as Items from '~/store/items';
import * as Preferences from '~/store/preferences';
import * as Products from '~/store/products';
import * as Recipes from '~/store/recipes';
import * as Settings from '~/store/settings';
import { ListComponent } from './list/list.component';

@Component({
  selector: 'lab-list-container',
  templateUrl: './list-container.component.html',
  styleUrls: ['./list-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListContainerComponent implements OnInit {
  @ViewChild(ListComponent) child: ListComponent;

  @Input() mode = ListMode.All;
  @Input() selected: string;
  @Input() steps: Step[];

  data$: Observable<Dataset>;
  itemSettings$: Observable<Items.ItemsState>;
  itemRaw$: Observable<Items.ItemsState>;
  recipeSettings$: Observable<Recipes.RecipesState>;
  recipeRaw$: Observable<Recipes.RecipesState>;
  settings$: Observable<Settings.SettingsState>;
  factories$: Observable<Factories.FactoriesState>;
  beltSpeed$: Observable<Entities<Rational>>;
  steps$: Observable<Step[]>;
  disabledRecipes$: Observable<string[]>;
  factoryRank$: Observable<string[]>;
  moduleRank$: Observable<string[]>;
  beaconModule$: Observable<string>;
  displayRate$: Observable<DisplayRate>;
  beaconCount$: Observable<number>;
  inserterTarget$: Observable<InserterTarget>;
  inserterCapacity$: Observable<InserterCapacity>;
  columns$: Observable<Preferences.ColumnsState>;
  modifiedIgnore$: Observable<boolean>;
  modifiedBelt$: Observable<boolean>;
  modifiedWagon$: Observable<boolean>;
  modifiedFactory$: Observable<boolean>;
  modifiedOverclock$: Observable<boolean>;
  modifiedBeacons$: Observable<boolean>;

  constructor(private store: Store<State>) {}

  ngOnInit(): void {
    if (!this.steps) {
      this.steps$ = this.store.select(Products.getSteps);
    }
    this.data$ = this.store.select(Recipes.getAdjustedDataset);
    this.itemSettings$ = this.store.select(Items.getItemSettings);
    this.itemRaw$ = this.store.select(Items.itemsState);
    this.recipeSettings$ = this.store.select(Recipes.getRecipeSettings);
    this.recipeRaw$ = this.store.select(Recipes.recipesState);
    this.settings$ = this.store.select(Settings.getSettings);
    this.factories$ = this.store.select(Factories.getFactorySettings);
    this.beltSpeed$ = this.store.select(Settings.getBeltSpeed);
    this.disabledRecipes$ = this.store.select(Settings.getDisabledRecipes);
    this.displayRate$ = this.store.select(Settings.getDisplayRate);
    this.inserterTarget$ = this.store.select(Settings.getInserterTarget);
    this.inserterCapacity$ = this.store.select(Settings.getInserterCapacity);
    this.columns$ = this.store.select(Preferences.getColumnsState);
    this.modifiedIgnore$ = this.store.select(Items.getContainsIgnore);
    this.modifiedBelt$ = this.store.select(Items.getContainsBelt);
    this.modifiedWagon$ = this.store.select(Items.getContainsWagon);
    this.modifiedFactory$ = this.store.select(Recipes.getContainsFactory);
    this.modifiedOverclock$ = this.store.select(Recipes.getContainsOverclock);
    this.modifiedBeacons$ = this.store.select(Recipes.getContainsBeacons);
  }

  ignoreItem(value: string): void {
    this.store.dispatch(new Items.IgnoreItemAction(value));
  }

  setBelt(data: DefaultIdPayload): void {
    this.store.dispatch(new Items.SetBeltAction(data));
  }

  setWagon(data: DefaultIdPayload): void {
    this.store.dispatch(new Items.SetWagonAction(data));
  }

  setFactory(data: DefaultIdPayload): void {
    this.store.dispatch(new Recipes.SetFactoryAction(data));
  }

  setFactoryModules(data: DefaultIdPayload<string[]>): void {
    this.store.dispatch(new Recipes.SetFactoryModulesAction(data));
  }

  setBeaconCount(data: DefaultIdPayload<string>): void {
    this.store.dispatch(new Recipes.SetBeaconCountAction(data));
  }

  setBeacon(data: DefaultIdPayload): void {
    this.store.dispatch(new Recipes.SetBeaconAction(data));
  }

  setBeaconModules(data: DefaultIdPayload<string[]>): void {
    this.store.dispatch(new Recipes.SetBeaconModulesAction(data));
  }

  setBeaconTotal(data: IdPayload): void {
    this.store.dispatch(new Recipes.SetBeaconTotalAction(data));
  }

  setOverclock(data: DefaultIdPayload<number>): void {
    this.store.dispatch(new Recipes.SetOverclockAction(data));
  }

  setColumns(value: Preferences.ColumnsState): void {
    this.store.dispatch(new Preferences.SetColumnsAction(value));
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

  setDisabledRecipes(value: DefaultPayload<string[]>): void {
    this.store.dispatch(new Settings.SetDisabledRecipesAction(value));
  }

  setDefaultRecipe(value: DefaultIdPayload): void {
    this.store.dispatch(new Items.SetRecipeAction(value));
  }
}
