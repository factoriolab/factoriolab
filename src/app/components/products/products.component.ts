import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import {
  Product,
  RateType,
  Entities,
  rateTypeOptions,
  DisplayRate,
  IdType,
  DisplayRateOptions,
  ItemId,
  Game,
  PIPE,
  Dataset,
  RecipeSettings,
  FactorySettings,
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

enum RecipeField {
  FactoryModules,
  BeaconCount,
  Beacon,
  BeaconModules,
  Overclock,
}

@Component({
  selector: 'lab-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent {
  vm$ = combineLatest([
    this.store.select(Products.getProductSteps),
    this.store.select(Products.getProducts),
    this.store.select(Items.getItemSettings),
    this.store.select(Factories.getFactorySettings),
    this.store.select(Recipes.getRecipeSettings),
    this.store.select(Recipes.getAdjustedDataset),
    this.store.select(Settings.getDisplayRate),
  ]).pipe(
    map(
      ([
        productSteps,
        products,
        itemSettings,
        factorySettings,
        recipeSettings,
        data,
        displayRate,
      ]) => ({
        productSteps,
        products,
        itemSettings,
        factorySettings,
        recipeSettings,
        data,
        displayRate,
        productOptions: products.reduce((e: Entities<string[]>, p) => {
          e[p.id] = productSteps[p.itemId].map((r) => r[0]);
          return e;
        }, {}),
        rateTypeOptions: rateTypeOptions(displayRate, data.game),
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
  RecipeUtility = RecipeUtility;

  constructor(public track: TrackService, public store: Store<LabState>) {}

  changeItem(product: Product, itemId: string, data: Dataset): void {
    if (
      product.rateType === RateType.Factories &&
      !data.itemRecipeIds[itemId]
    ) {
      // Reset rate type to items
      this.setRateType(product.id, RateType.Items);
    }

    this.setItem(product.id, itemId);
  }

  changeFactory(
    id: number,
    value: string,
    recipeId: string,
    factorySettings: Factories.FactoriesState,
    data: Dataset
  ): void {
    this.setViaSetting(
      id,
      value,
      RecipeUtility.bestMatch(
        data.recipeEntities[recipeId].producers,
        factorySettings.ids
      )
    );
  }

  changeRecipeField(
    product: Product,
    event: string | Event,
    recipeId: string,
    recipeSettings: Recipes.RecipesState,
    factorySettings: Factories.FactoriesState,
    field: RecipeField,
    index?: number,
    data?: Dataset
  ): void {
    const s = this.getState(
      recipeId,
      product.viaSetting,
      recipeSettings,
      factorySettings
    );
    switch (field) {
      case RecipeField.FactoryModules: {
        if (
          s.factory.moduleRank != null &&
          data != null &&
          typeof event === 'string'
        ) {
          const count = product.viaFactoryModules.length;
          const options = [...data.recipeModuleIds[recipeId], ItemId.Module];
          const def = s.fMatch
            ? s.recipe.factoryModules
            : RecipeUtility.defaultModules(
                options,
                s.factory.moduleRank,
                count
              );
          const modules = this.generateModules(
            index,
            event,
            product.viaFactoryModules
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
      case RecipeField.BeaconModules: {
        if (typeof event === 'string') {
          const count = product.viaBeaconModules.length;
          const bMatch =
            product.viaBeacon == null || product.viaBeacon === s.recipe.beacon;
          const def =
            s.fMatch && bMatch
              ? s.recipe.beaconModules
              : new Array(count).fill(s.factory.beaconModule);
          const value = this.generateModules(
            index,
            event,
            product.viaBeaconModules
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

  getState(
    recipeId: string,
    factoryId: string,
    recipeSettings: Recipes.RecipesState,
    factorySettings: Factories.FactoriesState
  ): AllSettingsState {
    const recipe = recipeSettings[recipeId];
    const factory = factorySettings.entities[factoryId];
    return {
      recipe,
      factory,
      fMatch: factoryId === recipe.factory,
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
  removeProduct(id: number): void {
    this.store.dispatch(new Products.RemoveAction(id));
  }

  setItem(id: number, value: string): void {
    this.store.dispatch(new Products.SetItemAction({ id, value }));
  }

  setRate(id: number, value: string): void {
    this.store.dispatch(new Products.SetRateAction({ id, value }));
  }

  setRateType(id: number, value: RateType): void {
    this.store.dispatch(new Products.SetRateTypeAction({ id, value }));
  }

  setVia(id: number, value: string): void {
    this.store.dispatch(new Products.SetViaAction({ id, value }));
  }

  setViaSetting(id: number, value: string, def: string | undefined): void {
    this.store.dispatch(new Products.SetViaSettingAction({ id, value, def }));
  }

  setViaFactoryModules(
    id: number,
    value: string[],
    def: string[] | undefined
  ): void {
    this.store.dispatch(
      new Products.SetViaFactoryModulesAction({ id, value, def })
    );
  }

  setViaBeaconCount(id: number, value: string, def: string | undefined): void {
    this.store.dispatch(
      new Products.SetViaBeaconCountAction({ id, value, def })
    );
  }

  setViaBeacon(id: number, value: string, def: string | undefined): void {
    this.store.dispatch(new Products.SetViaBeaconAction({ id, value, def }));
  }

  setViaBeaconModules(
    id: number,
    value: string[],
    def: string[] | undefined
  ): void {
    this.store.dispatch(
      new Products.SetViaBeaconModulesAction({ id, value, def })
    );
  }

  setViaOverclock(id: number, value: number, def: number | undefined): void {
    this.store.dispatch(new Products.SetViaOverclockAction({ id, value, def }));
  }

  addProduct(value: string): void {
    this.store.dispatch(new Products.AddAction(value));
  }

  setDisplayRate(value: DisplayRate, prev: DisplayRate): void {
    this.store.dispatch(new Settings.SetDisplayRateAction({ value, prev }));
  }
}
