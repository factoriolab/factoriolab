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
} from '~/models';
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

  @Input() mode = ListMode.All;
  @Input() selected: string;
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
  wagonPrecision$: Observable<number>;
  factoryPrecision$: Observable<number>;
  powerPrecision$: Observable<number>;
  pollutionPrecision$: Observable<number>;
  beaconCount$: Observable<number>;
  drillModule$: Observable<boolean>;
  columns$: Observable<string[]>;
  modifiedIgnore$: Observable<boolean>;
  modifiedBelt$: Observable<boolean>;
  modifiedFactory$: Observable<boolean>;
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
    this.wagonPrecision$ = this.store.select(Settings.getWagonPrecision);
    this.factoryPrecision$ = this.store.select(Settings.getFactoryPrecision);
    this.powerPrecision$ = this.store.select(Settings.getPowerPrecision);
    this.pollutionPrecision$ = this.store.select(
      Settings.getPollutionPrecision
    );
    this.beaconCount$ = this.store.select(Settings.getBeaconCount);
    this.drillModule$ = this.store.select(Settings.getDrillModule);
    this.columns$ = this.store.select(Settings.getColumns);
    this.modifiedIgnore$ = this.store.select(Items.getContainsIgnore);
    this.modifiedBelt$ = this.store.select(Items.getContainsBelt);
    this.modifiedFactory$ = this.store.select(Recipes.getContainsFactory);
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

  resetBeacons() {
    this.store.dispatch(new Recipes.ResetBeaconsAction());
  }
}
