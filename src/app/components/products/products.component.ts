import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import {
  Dataset,
  DisplayRate,
  DisplayRateOptions,
  FactorySettings,
  Game,
  IdType,
  ItemId,
  PIPE,
  Product,
  RateType,
  RecipeField,
  RecipeSettings,
} from '~/models';
import { TrackService } from '~/services';
import { LabState } from '~/store';
import * as Factories from '~/store/factories';
import * as Items from '~/store/items';
import * as Products from '~/store/products';
import * as Recipes from '~/store/recipes';
import * as Settings from '~/store/settings';
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
    this.store.select(Products.getProductOptions),
    this.store.select(Items.getItemSettings),
    this.store.select(Factories.getFactories),
    this.store.select(Recipes.getRecipeSettings),
    this.store.select(Recipes.getAdjustedDataset),
    this.store.select(Settings.getDisplayRate),
    this.store.select(Settings.getRateTypeOptions),
  ]).pipe(
    map(
      ([
        products,
        productOptions,
        itemSettings,
        factories,
        recipeSettings,
        data,
        displayRate,
        rateTypeOptions,
      ]) => ({
        products,
        productOptions,
        itemSettings,
        factories,
        recipeSettings,
        data,
        displayRate,
        rateTypeOptions,
      })
    )
  );

  PIPE = PIPE;
  DisplayRateOptions = DisplayRateOptions;

  IdType = IdType;
  ItemId = ItemId;
  RateType = RateType;
  Game = Game;
  RecipeField = RecipeField;

  constructor(public trackSvc: TrackService, private store: Store<LabState>) {}

  changeItem(product: Product, itemId: string): void {
    if (product.rateType === RateType.Factories) {
      // Reset rate type to items
      this.setRateType(product.id, RateType.Items);
    }

    this.setItem(product.id, itemId);
  }

  changeFactory(
    id: string,
    value: string,
    recipeId: string,
    factories: Factories.FactoriesState,
    data: Dataset
  ): void {
    this.setViaSetting(
      id,
      value,
      RecipeUtility.bestMatch(
        data.recipeEntities[recipeId].producers,
        factories.ids ?? []
      )
    );
  }

  changeRecipeField(
    product: Product,
    event: string | Event,
    recipeId: string,
    recipeSettings: Recipes.RecipesState,
    factories: Factories.FactoriesState,
    field: RecipeField,
    index?: number,
    data?: Dataset
  ): void {
    if (product.viaSetting != null) {
      const s = this.getState(
        recipeId,
        product.viaSetting,
        recipeSettings,
        factories
      );
      switch (field) {
        case RecipeField.FactoryModules: {
          if (
            s.factory.moduleRankIds != null &&
            data != null &&
            typeof event === 'string' &&
            index != null &&
            product.viaFactoryModuleIds != null
          ) {
            const count = product.viaFactoryModuleIds.length;
            const options = [...data.recipeModuleIds[recipeId], ItemId.Module];
            const def = s.fMatch
              ? s.recipe.factoryModuleIds
              : RecipeUtility.defaultModules(
                  options,
                  s.factory.moduleRankIds,
                  count
                );
            const modules = this.generateModules(
              index,
              event,
              product.viaFactoryModuleIds
            );
            this.setViaFactoryModules(product.id, modules, def);
          }
          break;
        }
        case RecipeField.BeaconCount: {
          if (typeof event === 'string') {
            const def = s.fMatch ? s.recipe.beaconCount : s.factory.beaconCount;
            this.setViaBeaconCount(product.id, event, def);
          }
          break;
        }
        case RecipeField.Beacon: {
          if (typeof event === 'string') {
            const def = s.fMatch ? s.recipe.beaconId : s.factory.beaconId;
            this.setViaBeacon(product.id, event, def);
          }
          break;
        }
        case RecipeField.BeaconModules: {
          if (
            typeof event === 'string' &&
            index != null &&
            product.viaBeaconModuleIds != null
          ) {
            const count = product.viaBeaconModuleIds.length;
            const bMatch =
              product.viaBeaconId == null ||
              product.viaBeaconId === s.recipe.beaconId;
            const def =
              s.fMatch && bMatch
                ? s.recipe.beaconModuleIds
                : new Array(count).fill(s.factory.beaconModuleId);
            const value = this.generateModules(
              index,
              event,
              product.viaBeaconModuleIds
            );
            this.setViaBeaconModules(product.id, value, def);
          }
          break;
        }
        case RecipeField.Overclock: {
          if (typeof event !== 'string') {
            const target = event.target as HTMLInputElement;
            const value = target.valueAsNumber;
            if (value >= 1 && value <= 250) {
              const def = s.fMatch ? s.recipe.overclock : s.factory.overclock;
              this.setViaOverclock(product.id, value, def);
            }
          }
          break;
        }
      }
    }
  }

  getState(
    recipeId: string,
    factoryId: string,
    recipeSettings: Recipes.RecipesState,
    factories: Factories.FactoriesState
  ): AllSettingsState {
    const recipe = recipeSettings[recipeId];
    const factory = factories.entities[factoryId];
    return {
      recipe,
      factory,
      fMatch: factoryId === recipe.factoryId,
    };
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

  setViaSetting(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(new Products.SetViaSettingAction({ id, value, def }));
  }

  setViaFactoryModules(
    id: string,
    value: string[],
    def: string[] | undefined
  ): void {
    this.store.dispatch(
      new Products.SetViaFactoryModulesAction({ id, value, def })
    );
  }

  setViaBeaconCount(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(
      new Products.SetViaBeaconCountAction({ id, value, def })
    );
  }

  setViaBeacon(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(new Products.SetViaBeaconAction({ id, value, def }));
  }

  setViaBeaconModules(
    id: string,
    value: string[],
    def: string[] | undefined
  ): void {
    this.store.dispatch(
      new Products.SetViaBeaconModulesAction({ id, value, def })
    );
  }

  setViaOverclock(id: string, value: number, def: number | undefined): void {
    this.store.dispatch(new Products.SetViaOverclockAction({ id, value, def }));
  }

  addProduct(value: string): void {
    this.store.dispatch(new Products.AddAction(value));
  }

  setDisplayRate(value: DisplayRate, prev: DisplayRate): void {
    this.store.dispatch(new Settings.SetDisplayRateAction({ value, prev }));
  }
}
