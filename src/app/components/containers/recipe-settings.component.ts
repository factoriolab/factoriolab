import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import {
  Dataset,
  FactorySettings,
  ItemId,
  Rational,
  RecipeSettings,
} from '~/models';
import { LabState } from '~/store';
import { FactoriesState } from '~/store/factories';
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
    emitter: (id: string, value: string, def: string) => void,
    factorySettings: FactoriesState,
    data: Dataset,
    id = recipeId
  ): void {
    emitter(
      id,
      value,
      RecipeUtility.bestMatch(
        data.recipeEntities[recipeId].producers,
        factorySettings.ids
      )
    );
  }

  changeFactoryModules(
    recipeId: string,
    input: string,
    index: number,
    modules: string[],
    emitter: (id: string, value: string[], def: string[] | undefined) => void,
    recipeSettings: RecipesState,
    factorySettings: FactoriesState,
    data: Dataset,
    id = recipeId,
    factoryId: string | undefined = recipeSettings[recipeId].factory
  ): void {
    if (factoryId != null) {
      const count = modules.length;
      const options = [...data.recipeModuleIds[recipeId], ItemId.Module];
      const s = this.getState(
        id,
        recipeId,
        factoryId,
        recipeSettings,
        factorySettings
      );
      if (s.factory.moduleRank) {
        const def = s.fMatch
          ? s.recipe.factoryModules
          : RecipeUtility.defaultModules(options, s.factory.moduleRank, count);
        const value = this.generateModules(index, input, modules);
        emitter(id, value, def);
      }
    }
  }

  changeBeaconCount(
    recipeId: string,
    value: string,
    emitter: (id: string, value: string, def: string | undefined) => void,
    recipeSettings: RecipesState,
    factorySettings: FactoriesState,
    id = recipeId,
    factoryId: string | undefined = recipeSettings[recipeId].factory
  ): void {
    if (factoryId != null) {
      const s = this.getState(
        id,
        recipeId,
        factoryId,
        recipeSettings,
        factorySettings
      );
      const def = s.fMatch ? s.recipe.beaconCount : s.factory.beaconCount;
      emitter(id, value, def);
    }
  }

  changeBeacon(
    recipeId: string,
    value: string,
    emitter: (id: string, value: string, def: string | undefined) => void,
    recipeSettings: RecipesState,
    factorySettings: FactoriesState,
    id = recipeId,
    factoryId: string | undefined = recipeSettings[recipeId].factory
  ): void {
    if (factoryId != null) {
      const s = this.getState(
        id,
        recipeId,
        factoryId,
        recipeSettings,
        factorySettings
      );
      const def = s.fMatch ? s.recipe.beacon : s.factory.beacon;
      emitter(id, value, def);
    }
  }

  changeBeaconModules(
    recipeId: string,
    input: string,
    index: number,
    modules: string[],
    emitter: (id: string, value: string[], def: string[] | undefined) => void,
    recipeSettings: RecipesState,
    factorySettings: FactoriesState,
    id = recipeId,
    factoryId: string | undefined = recipeSettings[recipeId].factory,
    beaconId?: string
  ): void {
    if (factoryId) {
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
      emitter(id, value, def);
    }
  }

  changeOverclock(
    recipeId: string,
    input: Event,
    emitter: (id: string, value: number, def: number | undefined) => void,
    recipeSettings: RecipesState,
    factorySettings: FactoriesState,
    id = recipeId,
    factoryId: string | undefined = recipeSettings[recipeId].factory
  ): void {
    if (factoryId != null) {
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
        emitter(id, value, def);
      }
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
