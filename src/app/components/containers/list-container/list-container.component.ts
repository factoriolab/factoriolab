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
  ColumnSettings,
} from '~/models';
import { State } from '~/store';
import { getColumns } from '~/store/columns';
import * as Items from '~/store/items';
import { getSteps } from '~/store/products';
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
  recipeSettings$: Observable<Recipes.RecipesState>;
  recipeRaw$: Observable<Recipes.RecipesState>;
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
  columns$: Observable<Entities<ColumnSettings>>;
  modifiedIgnore$: Observable<boolean>;
  modifiedBelt$: Observable<boolean>;
  modifiedFactory$: Observable<boolean>;
  modifiedBeacons$: Observable<boolean>;

  constructor(private store: Store<State>) {}

  ngOnInit() {
    if (!this.steps) {
      this.steps$ = this.store.select(getSteps);
    }
    this.data$ = this.store.select(Recipes.getAdjustedDataset);
    this.itemSettings$ = this.store.select(Items.getItemSettings);
    this.recipeSettings$ = this.store.select(Recipes.getRecipeSettings);
    this.recipeRaw$ = this.store.select(Recipes.recipesState);
    this.beltSpeed$ = this.store.select(Settings.getBeltSpeed);
    this.disabledRecipes$ = this.store.select(Settings.getDisabledRecipes);
    this.factoryRank$ = this.store.select(Settings.getFactoryRank);
    this.moduleRank$ = this.store.select(Settings.getModuleRank);
    this.beaconModule$ = this.store.select(Settings.getBeaconModule);
    this.displayRate$ = this.store.select(Settings.getDisplayRate);
    this.beaconCount$ = this.store.select(Settings.getBeaconCount);
    this.inserterTarget$ = this.store.select(Settings.getInserterTarget);
    this.inserterCapacity$ = this.store.select(Settings.getInserterCapacity);
    this.columns$ = this.store.select(getColumns);
    this.modifiedIgnore$ = this.store.select(Items.getContainsIgnore);
    this.modifiedBelt$ = this.store.select(Items.getContainsBelt);
    this.modifiedFactory$ = this.store.select(Recipes.getContainsFactory);
    this.modifiedBeacons$ = this.store.select(Recipes.getContainsBeacons);
  }

  ignoreItem(value: string) {
    this.store.dispatch(new Items.IgnoreItemAction(value));
  }

  setBelt(data: DefaultIdPayload) {
    this.store.dispatch(new Items.SetBeltAction(data));
  }

  setFactory(data: DefaultIdPayload) {
    this.store.dispatch(new Recipes.SetFactoryAction(data));
  }

  setFactoryModules(data: DefaultIdPayload<string[]>) {
    this.store.dispatch(new Recipes.SetFactoryModulesAction(data));
  }

  setBeaconCount(data: DefaultIdPayload<number>) {
    this.store.dispatch(new Recipes.SetBeaconCountAction(data));
  }

  setBeacon(data: DefaultIdPayload) {
    this.store.dispatch(new Recipes.SetBeaconAction(data));
  }

  setBeaconModules(data: DefaultIdPayload<string[]>) {
    this.store.dispatch(new Recipes.SetBeaconModulesAction(data));
  }

  setColumns(value: string[]) {
    this.store.dispatch(new Settings.SetColumnsAction(value));
  }

  resetItem(value: string) {
    this.store.dispatch(new Items.ResetItemAction(value));
  }

  resetRecipe(value: string) {
    this.store.dispatch(new Recipes.ResetRecipeAction(value));
  }

  resetIgnore() {
    this.store.dispatch(new Items.ResetIgnoreAction());
  }

  resetBelt() {
    this.store.dispatch(new Items.ResetBeltAction());
  }

  resetFactory() {
    this.store.dispatch(new Recipes.ResetFactoryAction());
  }

  resetBeacons() {
    this.store.dispatch(new Recipes.ResetBeaconsAction());
  }

  setDisabledRecipes(value: DefaultPayload<string[]>) {
    this.store.dispatch(new Settings.SetDisabledRecipesAction(value));
  }
}
