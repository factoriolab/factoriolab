import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Step, DisplayRate, Dataset, DefaultIdPayload } from '~/models';
import { State } from '~/store';
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

  @Input() steps: Step[];

  data$: Observable<Dataset>;
  itemSettings$: Observable<Items.ItemsState>;
  recipeSettings$: Observable<Recipes.RecipesState>;
  recipeRaw$: Observable<Recipes.RecipesState>;
  steps$: Observable<Step[]>;
  belt$: Observable<string>;
  factoryRank$: Observable<string[]>;
  moduleRank$: Observable<string[]>;
  beaconModule$: Observable<string>;
  displayRate$: Observable<DisplayRate>;
  itemPrecision$: Observable<number>;
  beltPrecision$: Observable<number>;
  factoryPrecision$: Observable<number>;
  beaconCount$: Observable<number>;
  drillModule$: Observable<boolean>;
  columns$: Observable<string[]>;
  modifiedIgnore$: Observable<boolean>;
  modifiedBelt$: Observable<boolean>;
  modifiedFactory$: Observable<boolean>;
  modifiedModules$: Observable<boolean>;
  modifiedBeacons$: Observable<boolean>;

  constructor(private store: Store<State>) {}

  ngOnInit() {
    if (!this.steps) {
      this.steps$ = this.store.select(getSteps);
    }
    this.data$ = this.store.select(Settings.getDataset);
    this.itemSettings$ = this.store.select(Items.getItemSettings);
    this.recipeSettings$ = this.store.select(Recipes.getRecipeSettings);
    this.recipeRaw$ = this.store.select(Recipes.recipesState);
    this.belt$ = this.store.select(Settings.getBelt);
    this.factoryRank$ = this.store.select(Settings.getFactoryRank);
    this.moduleRank$ = this.store.select(Settings.getModuleRank);
    this.beaconModule$ = this.store.select(Settings.getBeaconModule);
    this.displayRate$ = this.store.select(Settings.getDisplayRate);
    this.itemPrecision$ = this.store.select(Settings.getItemPrecision);
    this.beltPrecision$ = this.store.select(Settings.getBeltPrecision);
    this.factoryPrecision$ = this.store.select(Settings.getFactoryPrecision);
    this.beaconCount$ = this.store.select(Settings.getBeaconCount);
    this.drillModule$ = this.store.select(Settings.getDrillModule);
    this.columns$ = this.store.select(Settings.getColumns);
    this.modifiedIgnore$ = this.store.select(Items.getContainsIgnore);
    this.modifiedBelt$ = this.store.select(Items.getContainsBelt);
    this.modifiedFactory$ = this.store.select(Recipes.getContainsFactory);
    this.modifiedModules$ = this.store.select(Recipes.getContainsModules);
    this.modifiedBeacons$ = this.store.select(Recipes.getContainsBeacons);
  }

  ignoreItem(value: string) {
    this.store.dispatch(new Items.IgnoreAction(value));
  }

  setBelt(data: DefaultIdPayload) {
    this.store.dispatch(new Items.SetBeltAction(data));
  }

  setFactory(data: DefaultIdPayload) {
    this.store.dispatch(new Recipes.SetFactoryAction(data));
  }

  setModules(data: DefaultIdPayload<string[]>) {
    this.store.dispatch(new Recipes.SetModulesAction(data));
  }

  setBeaconModule(data: DefaultIdPayload) {
    this.store.dispatch(new Recipes.SetBeaconModuleAction(data));
  }

  setBeaconCount(data: DefaultIdPayload<number>) {
    this.store.dispatch(new Recipes.SetBeaconCountAction(data));
  }

  showColumn(value: string) {
    this.store.dispatch(new Settings.ShowColumnAction(value));
  }

  hideColumn(value: string) {
    this.store.dispatch(new Settings.HideColumnAction(value));
  }

  resetItem(value: string) {
    this.store.dispatch(new Items.ResetAction(value));
  }

  resetRecipe(value: string) {
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
