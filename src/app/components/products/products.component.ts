import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import { DisplayRate, displayRateOptions, RateType } from '~/models';
import { TrackService } from '~/services';
import {
  Factories,
  Items,
  LabState,
  Products,
  Recipes,
  Settings,
} from '~/store';

@Component({
  selector: 'lab-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent {
  vm$ = combineLatest([
    this.store.select(Products.getProducts),
    this.store.select(Products.getViaOptions),
    this.store.select(Items.getItemSettings),
    this.store.select(Factories.getFactories),
    this.store.select(Recipes.getRecipeSettings),
    this.store.select(Settings.getDisplayRate),
    this.store.select(Settings.getRateTypeOptions),
    this.store.select(Settings.getOptions),
    this.store.select(Settings.getDataset),
  ]).pipe(
    map(
      ([
        products,
        viaOptions,
        itemSettings,
        factories,
        recipeSettings,
        displayRate,
        rateTypeOptions,
        options,
        data,
      ]) => ({
        products,
        viaOptions,
        itemSettings,
        factories,
        recipeSettings,
        displayRate,
        rateTypeOptions,
        options,
        data,
      })
    )
  );

  displayRateOptions = displayRateOptions;

  RateType = RateType;

  constructor(public trackSvc: TrackService, private store: Store<LabState>) {}

  /** Action Dispatch Methods */
  removeProduct(id: string): void {
    this.store.dispatch(new Products.RemoveAction(id));
  }

  setItem(id: string, value: string): void {
    this.store.dispatch(new Products.SetItemAction({ id, value }));
  }

  setRate(id: string, value: string): void {
    this.store.dispatch(new Products.SetRateAction({ id, value }));
  }

  setRateType(id: string, value: RateType): void {
    this.store.dispatch(new Products.SetRateTypeAction({ id, value }));
  }

  setVia(id: string, value: string): void {
    this.store.dispatch(new Products.SetViaAction({ id, value }));
  }

  addProduct(value: string): void {
    this.store.dispatch(new Products.AddAction(value));
  }

  setDisplayRate(value: DisplayRate, prev: DisplayRate): void {
    this.store.dispatch(new Settings.SetDisplayRateAction({ value, prev }));
  }
}
