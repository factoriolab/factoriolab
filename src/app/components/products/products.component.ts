import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import {
  Breakpoint,
  Dataset,
  DisplayRate,
  displayRateOptions,
  FactorySettings,
  Game,
  ItemId,
  Producer,
  RateType,
  RecipeField,
  RecipeSettings,
} from '~/models';
import { ContentService, TrackService } from '~/services';
import {
  Factories,
  Items,
  LabState,
  Producers,
  Products,
  Recipes,
  Settings,
} from '~/store';
import { RecipeUtility } from '~/utilities';

interface AllSettingsState {
  recipe: RecipeSettings;
  factory: FactorySettings;
  fMatch: boolean;
}

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
    this.store.select(Producers.getProducers),
    this.store.select(Items.getItemSettings),
    this.store.select(Factories.getFactories),
    this.store.select(Recipes.getRecipeSettings),
    this.store.select(Settings.getDisplayRate),
    this.store.select(Settings.getRateTypeOptions),
    this.store.select(Settings.getOptions),
    this.store.select(Settings.getDataset),
    this.contentService.width$,
  ]).pipe(
    map(
      ([
        products,
        viaOptions,
        producers,
        itemSettings,
        factories,
        recipeSettings,
        displayRate,
        rateTypeOptions,
        options,
        data,
        width,
      ]) => ({
        products,
        viaOptions,
        producers,
        itemSettings,
        factories,
        recipeSettings,
        displayRate,
        rateTypeOptions,
        options,
        data,
        mobile: width < Breakpoint.Small,
      })
    )
  );

  displayRateOptions = displayRateOptions;

  Game = Game;
  RateType = RateType;
  RecipeField = RecipeField;

  constructor(
    public trackSvc: TrackService,
    private store: Store<LabState>,
    private contentService: ContentService
  ) {}

  generateModules(index: number, value: string, original: string[]): string[] {
    const modules = [...original]; // Copy
    // Fill in index to the right
    for (let i = index; i < modules.length; i++) {
      modules[i] = value;
    }
    return modules;
  }

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

  removeProducer(id: string): void {
    this.store.dispatch(new Producers.RemoveAction(id));
  }

  setRecipe(id: string, value: string): void {
    this.store.dispatch(new Producers.SetRecipeAction({ id, value }));
  }

  setCount(id: string, value: string): void {
    this.store.dispatch(new Producers.SetCountAction({ id, value }));
  }

  addProduct(value: string): void {
    this.store.dispatch(new Products.AddAction(value));
  }

  addProducer(value: string): void {
    this.store.dispatch(new Producers.AddAction(value));
  }

  setDisplayRate(value: DisplayRate, prev: DisplayRate): void {
    this.store.dispatch(new Settings.SetDisplayRateAction({ value, prev }));
  }
}
