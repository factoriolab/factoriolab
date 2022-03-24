import { Component, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';

import {
  Dataset,
  DefaultIdPayload,
  FactorySettings,
  ItemId,
  Rational,
  RecipeSettings,
} from '~/models';
import { LabState } from '~/store';
import * as Factories from '~/store/factories';
import { FactoriesState } from '~/store/factories';
import * as Recipes from '~/store/recipes';
import { RecipesState } from '~/store/recipes';
import { RecipeUtility } from '~/utilities';

interface SettingsState {
  recipe: RecipeSettings;
  factory: FactorySettings;
  fMatch: boolean;
}

@Component({
  selector: 'lab-recipe-settings',
  template: '',
})
export class RecipeSettingsComponent {
  constructor(protected store: Store<LabState>) {}

  getState(
    id: string,
    recipeId: string,
    factoryId: string,
    recipeSettings: RecipesState,
    factorySettings: FactoriesState
  ): SettingsState {
    const recipe = recipeSettings[recipeId];
    return {
      recipe,
      factory: factorySettings.entities[factoryId],
      fMatch: id !== recipeId && factoryId === recipe.factory,
    };
  }

  changeFactory(
    recipeId: string,
    value: string,
    emitter: EventEmitter<DefaultIdPayload>,
    factorySettings: FactoriesState,
    data: Dataset,
    id = recipeId
  ): void {
    emitter.emit({
      id,
      value,
      def: RecipeUtility.bestMatch(
        data.recipeEntities[recipeId].producers,
        factorySettings.ids
      ),
    });
  }

  changeFactoryModules(
    recipeId: string,
    input: string,
    index: number,
    modules: string[],
    emitter: EventEmitter<DefaultIdPayload<string[]>>,
    recipeSettings: RecipesState,
    factorySettings: FactoriesState,
    data: Dataset,
    id = recipeId,
    factoryId?: string
  ): void {
    if (factoryId == null) {
      factoryId = recipeSettings[recipeId].factory;
    }
    const count = modules.length;
    const options = [...data.recipeModuleIds[recipeId], ItemId.Module];
    const s = this.getState(
      id,
      recipeId,
      factoryId,
      recipeSettings,
      factorySettings
    );
    const def = s.fMatch
      ? s.recipe.factoryModules
      : RecipeUtility.defaultModules(options, s.factory.moduleRank, count);
    const value = this.generateModules(index, input, modules);
    emitter.emit({ id, value, def });
  }

  changeBeaconCount(
    recipeId: string,
    value: string,
    emitter: EventEmitter<DefaultIdPayload>,
    recipeSettings: RecipesState,
    factorySettings: FactoriesState,
    id = recipeId,
    factoryId?: string
  ): void {
    if (factoryId == null) {
      factoryId = recipeSettings[recipeId].factory;
    }
    const s = this.getState(
      id,
      recipeId,
      factoryId,
      recipeSettings,
      factorySettings
    );
    const def = s.fMatch ? s.recipe.beaconCount : s.factory.beaconCount;
    emitter.emit({ id, value, def });
  }

  changeBeacon(
    recipeId: string,
    value: string,
    emitter: EventEmitter<DefaultIdPayload>,
    recipeSettings: RecipesState,
    factorySettings: FactoriesState,
    id = recipeId,
    factoryId?: string
  ): void {
    if (factoryId == null) {
      factoryId = recipeSettings[recipeId].factory;
    }
    const s = this.getState(
      id,
      recipeId,
      factoryId,
      recipeSettings,
      factorySettings
    );
    const def = s.fMatch ? s.recipe.beacon : s.factory.beacon;
    emitter.emit({ id, value, def });
  }

  changeBeaconModules(
    recipeId: string,
    input: string,
    index: number,
    modules: string[],
    emitter: EventEmitter<DefaultIdPayload<string[]>>,
    recipeSettings: RecipesState,
    factorySettings: FactoriesState,
    id = recipeId,
    factoryId?: string,
    beaconId?: string
  ): void {
    if (factoryId == null) {
      factoryId = recipeSettings[recipeId].factory;
    }
    const count = modules.length;
    const s = this.getState(
      id,
      recipeId,
      factoryId,
      recipeSettings,
      factorySettings
    );
    const bMatch = beaconId == null || beaconId === s.recipe.beacon;
    const def =
      s.fMatch && bMatch
        ? s.recipe.beaconModules
        : new Array(count).fill(s.factory.beaconModule);
    const value = this.generateModules(index, input, modules);
    emitter.emit({ id, value, def });
  }

  changeOverclock(
    recipeId: string,
    input: Event,
    emitter: EventEmitter<DefaultIdPayload<number>>,
    recipeSettings: RecipesState,
    factorySettings: FactoriesState,
    id = recipeId,
    factoryId?: string
  ): void {
    if (factoryId == null) {
      factoryId = recipeSettings[recipeId].factory;
    }
    const target = input.target as HTMLInputElement;
    const value = target.valueAsNumber;
    if (value >= 1 && value <= 250) {
      const s = this.getState(
        id,
        recipeId,
        factoryId,
        recipeSettings,
        factorySettings
      );
      const def = s.fMatch ? s.recipe.overclock : s.factory.overclock;
      emitter.emit({ id, value, def });
    }
  }

  generateModules(index: number, value: string, original: string[]): string[] {
    const modules = [...original]; // Copy
    // Fill in index to the right
    for (let i = index; i < modules.length; i++) {
      modules[i] = value;
    }
    return modules;
  }

  gtZero(value: string | undefined): boolean {
    if (value != null) {
      try {
        return Rational.fromString(value).gt(Rational.zero);
      } catch {}
    }
    return false;
  }
}
