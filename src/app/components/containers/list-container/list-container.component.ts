import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Step, RecipeId, ItemId, DisplayRate } from '~/models';
import { State } from '~/store';
import * as Dataset from '~/store/dataset';
import * as Items from '~/store/items';
import * as Recipes from '~/store/recipes';
import * as Products from '~/store/products';
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

  @Input() steps: Step[];

  data$: Observable<Dataset.DatasetState>;
  itemSettings$: Observable<Items.ItemsState>;
  recipeSettings$: Observable<Recipes.RecipesState>;
  recipeRaw$: Observable<Recipes.RecipesState>;
  modifiedIgnore$: Observable<boolean>;
  modifiedBelt$: Observable<boolean>;
  modifiedFactory$: Observable<boolean>;
  modifiedModules$: Observable<boolean>;
  modifiedBeacons$: Observable<boolean>;
  steps$: Observable<Step[]>;
  displayRate$: Observable<DisplayRate>;
  itemPrecision$: Observable<number>;
  beltPrecision$: Observable<number>;
  factoryPrecision$: Observable<number>;

  constructor(private store: Store<State>) {}

  ngOnInit() {
    if (!this.steps) {
      this.steps$ = this.store.select(Products.getSteps);
    }
    this.data$ = this.store.select(Dataset.getDatasetState);
    this.itemSettings$ = this.store.select(Items.getItemSettings);
    this.recipeSettings$ = this.store.select(Recipes.getRecipeSettings);
    this.recipeRaw$ = this.store.select(Recipes.recipesState);
    this.modifiedIgnore$ = this.store.select(Items.getContainsIgnore);
    this.modifiedBelt$ = this.store.select(Items.getContainsBelt);
    this.modifiedFactory$ = this.store.select(Recipes.getContainsFactory);
    this.modifiedModules$ = this.store.select(Recipes.getContainsModules);
    this.modifiedBeacons$ = this.store.select(Recipes.getContainsBeacons);
    this.displayRate$ = this.store.select(Settings.getDisplayRate);
    this.itemPrecision$ = this.store.select(Settings.getItemPrecision);
    this.beltPrecision$ = this.store.select(Settings.getBeltPrecision);
    this.factoryPrecision$ = this.store.select(Settings.getFactoryPrecision);
  }

  ignoreItem(value: ItemId) {
    this.store.dispatch(new Items.IgnoreAction(value));
  }

  setBelt(data: [ItemId, ItemId]) {
    this.store.dispatch(new Items.SetBeltAction(data));
  }

  setFactory(data: [RecipeId, ItemId]) {
    this.store.dispatch(new Recipes.SetFactoryAction(data));
  }

  setModules(data: [RecipeId, ItemId[]]) {
    this.store.dispatch(new Recipes.SetModulesAction(data));
  }

  setBeaconModule(data: [RecipeId, ItemId]) {
    this.store.dispatch(new Recipes.SetBeaconModuleAction(data));
  }

  setBeaconCount(data: [RecipeId, number]) {
    this.store.dispatch(new Recipes.SetBeaconCountAction(data));
  }

  resetItem(value: ItemId) {
    this.store.dispatch(new Items.ResetAction(value));
  }

  resetRecipe(value: RecipeId) {
    this.store.dispatch(new Recipes.ResetAction(value));
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

  resetModules() {
    this.store.dispatch(new Recipes.ResetModulesAction());
  }

  resetBeacons() {
    this.store.dispatch(new Recipes.ResetBeaconsAction());
  }
}
