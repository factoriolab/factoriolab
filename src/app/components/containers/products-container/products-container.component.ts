import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import {
  Product,
  RateType,
  IdPayload,
  Dataset,
  Rational,
  Entities,
  DisplayRate,
  DefaultIdPayload,
} from '~/models';
import { State } from '~/store';
import * as Factories from '~/store/factories';
import * as Items from '~/store/items';
import * as Products from '~/store/products';
import * as Recipes from '~/store/recipes';
import { getDisplayRate, SetDisplayRateAction } from '~/store/settings';
import { ProductsComponent } from './products/products.component';

@Component({
  selector: 'lab-products-container',
  templateUrl: './products-container.component.html',
  styleUrls: ['./products-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsContainerComponent implements OnInit {
  @ViewChild(ProductsComponent) child: ProductsComponent;

  data$: Observable<Dataset>;
  productSteps$: Observable<Entities<[string, Rational][]>>;
  products$: Observable<Product[]>;
  itemSettings$: Observable<Items.ItemsState>;
  recipeSettings$: Observable<Recipes.RecipesState>;
  factories$: Observable<Factories.FactoriesState>;
  displayRate$: Observable<DisplayRate>;

  constructor(private store: Store<State>) {}

  ngOnInit(): void {
    this.data$ = this.store.select(Recipes.getAdjustedDataset);
    this.productSteps$ = this.store.select(Products.getProductSteps);
    this.products$ = this.store.select(Products.getProducts);
    this.itemSettings$ = this.store.select(Items.getItemSettings);
    this.recipeSettings$ = this.store.select(Recipes.getRecipeSettings);
    this.factories$ = this.store.select(Factories.getFactorySettings);
    this.displayRate$ = this.store.select(getDisplayRate);
  }

  removeProduct(id: string): void {
    this.store.dispatch(new Products.RemoveAction(id));
  }

  setItem(data: IdPayload): void {
    this.store.dispatch(new Products.SetItemAction(data));
  }

  setRate(data: IdPayload): void {
    this.store.dispatch(new Products.SetRateAction(data));
  }

  setRateType(data: IdPayload<RateType>): void {
    this.store.dispatch(new Products.SetRateTypeAction(data));
  }

  setVia(data: IdPayload): void {
    this.store.dispatch(new Products.SetViaAction(data));
  }

  setViaSetting(data: DefaultIdPayload): void {
    this.store.dispatch(new Products.SetViaSettingAction(data));
  }

  setViaFactoryModules(data: DefaultIdPayload<string[]>): void {
    this.store.dispatch(new Products.SetViaFactoryModulesAction(data));
  }

  setViaBeaconCount(data: DefaultIdPayload): void {
    this.store.dispatch(new Products.SetViaBeaconCountAction(data));
  }

  setViaBeacon(data: DefaultIdPayload): void {
    this.store.dispatch(new Products.SetViaBeaconAction(data));
  }

  setViaBeaconModules(data: DefaultIdPayload<string[]>): void {
    this.store.dispatch(new Products.SetViaBeaconModulesAction(data));
  }

  setViaOverclock(data: DefaultIdPayload<number>): void {
    this.store.dispatch(new Products.SetViaOverclockAction(data));
  }

  addProduct(value: string): void {
    this.store.dispatch(new Products.AddAction(value));
  }

  setDisplayRate(value: DisplayRate): void {
    this.store.dispatch(new SetDisplayRateAction(value));
  }
}
