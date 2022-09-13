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

  changeFactory(
    producer: Producer,
    value: string,
    factories: Factories.FactoriesState,
    data: Dataset
  ): void {
    this.setFactory(
      producer.id,
      value,
      RecipeUtility.bestMatch(
        data.recipeEntities[producer.recipeId].producers,
        factories.ids ?? []
      )
    );
  }

  changeRecipeField(
    producer: Producer,
    event: string | number,
    recipeSettings: Recipes.RecipesState,
    factories: Factories.FactoriesState,
    field: RecipeField,
    index?: number,
    data?: Dataset
  ): void {
    if (producer.factoryId == null) return;

    const s = this.getState(
      producer.recipeId,
      producer.factoryId,
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
          producer.factoryModuleIds != null
        ) {
          const count = producer.factoryModuleIds.length;
          const options = [
            ...data.recipeModuleIds[producer.recipeId],
            ItemId.Module,
          ];
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
            producer.factoryModuleIds
          );
          this.setFactoryModules(producer.id, modules, def);
        }
        break;
      }
      case RecipeField.BeaconCount: {
        if (typeof event === 'string') {
          const def = s.fMatch ? s.recipe.beaconCount : s.factory.beaconCount;
          this.setBeaconCount(producer.id, event, def);
        }
        break;
      }
      case RecipeField.Beacon: {
        if (typeof event === 'string') {
          const def = s.fMatch ? s.recipe.beaconId : s.factory.beaconId;
          this.setBeacon(producer.id, event, def);
        }
        break;
      }
      case RecipeField.BeaconModules: {
        if (
          typeof event === 'string' &&
          index != null &&
          producer.beaconModuleIds != null
        ) {
          const count = producer.beaconModuleIds.length;
          const bMatch =
            producer.beaconId == null ||
            producer.beaconId === s.recipe.beaconId;
          const def =
            s.fMatch && bMatch
              ? s.recipe.beaconModuleIds
              : new Array(count).fill(s.factory.beaconModuleId);
          const value = this.generateModules(
            index,
            event,
            producer.beaconModuleIds
          );
          this.setBeaconModules(producer.id, value, def);
        }
        break;
      }
      case RecipeField.Overclock: {
        if (typeof event === 'number') {
          const def = s.fMatch ? s.recipe.overclock : s.factory.overclock;
          const value = Math.max(1, Math.min(250, event));
          this.setOverclock(producer.id, value, def);
        }
        break;
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

  removeProducer(id: string): void {
    this.store.dispatch(new Producers.RemoveAction(id));
  }

  setRecipe(id: string, value: string): void {
    this.store.dispatch(new Producers.SetRecipeAction({ id, value }));
  }

  setCount(id: string, value: string): void {
    this.store.dispatch(new Producers.SetCountAction({ id, value }));
  }

  setFactory(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(new Producers.SetFactoryAction({ id, value, def }));
  }

  setFactoryModules(
    id: string,
    value: string[],
    def: string[] | undefined
  ): void {
    this.store.dispatch(
      new Producers.SetFactoryModulesAction({ id, value, def })
    );
  }

  setBeaconCount(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(new Producers.SetBeaconCountAction({ id, value, def }));
  }

  setBeacon(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(new Producers.SetBeaconAction({ id, value, def }));
  }

  setBeaconModules(
    id: string,
    value: string[],
    def: string[] | undefined
  ): void {
    this.store.dispatch(
      new Producers.SetBeaconModulesAction({ id, value, def })
    );
  }

  setOverclock(id: string, value: number, def: number | undefined): void {
    this.store.dispatch(new Producers.SetOverclockAction({ id, value, def }));
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
