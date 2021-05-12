import { Component, EventEmitter, Input } from '@angular/core';

import {
  Dataset,
  DefaultIdPayload,
  FactorySettings,
  ItemId,
  Rational,
  RecipeSettings,
} from '~/models';
import { FactoriesState } from '~/store/factories';
import { RecipesState } from '~/store/recipes';
import { RecipeUtility } from '~/utilities';

class SettingsState {
  recipe: RecipeSettings;
  factory: FactorySettings;
  fMatch: boolean;
}

@Component({
  selector: 'lab-recipe-settings',
  template: '',
})
export class RecipeSettingsComponent {
  @Input() data: Dataset;
  @Input() recipeSettings: RecipesState;
  @Input() factories: FactoriesState;

  getState(id: string, recipeId: string, factoryId: string): SettingsState {
    const recipe = this.recipeSettings[recipeId];
    return {
      recipe,
      factory: this.factories.entities[factoryId],
      fMatch: id !== recipeId && factoryId === recipe.factory,
    };
  }

  changeFactory(
    recipeId: string,
    value: string,
    emitter: EventEmitter<DefaultIdPayload>,
    id = recipeId
  ): void {
    emitter.emit({
      id,
      value,
      default: RecipeUtility.bestMatch(
        this.data.recipeEntities[recipeId].producers,
        this.factories.ids
      ),
    });
  }

  changeFactoryModules(
    recipeId: string,
    input: string,
    index: number,
    modules: string[],
    emitter: EventEmitter<DefaultIdPayload<string[]>>,
    id = recipeId,
    factoryId = this.recipeSettings[recipeId].factory
  ): void {
    const count = modules.length;
    const options = [...this.data.recipeModuleIds[recipeId], ItemId.Module];
    const s = this.getState(id, recipeId, factoryId);
    const def = s.fMatch
      ? s.recipe.factoryModules
      : RecipeUtility.defaultModules(options, s.factory.moduleRank, count);
    const value = this.generateModules(index, input, modules);
    emitter.emit({
      id,
      value,
      default: def,
    });
  }

  changeBeaconCount(
    recipeId: string,
    event: Event,
    emitter: EventEmitter<DefaultIdPayload>,
    id = recipeId,
    factoryId = this.recipeSettings[recipeId].factory
  ): void {
    try {
      const value = (event.target as HTMLInputElement).value;
      const rational = Rational.fromString(value);
      if (rational.gte(Rational.zero)) {
        const s = this.getState(id, recipeId, factoryId);
        const def = s.fMatch ? s.recipe.beaconCount : s.factory.beaconCount;
        emitter.emit({ id, value, default: def });
      }
    } catch {}
  }

  changeBeacon(
    recipeId: string,
    value: string,
    emitter: EventEmitter<DefaultIdPayload>,
    id = recipeId,
    factoryId = this.recipeSettings[recipeId].factory
  ): void {
    const s = this.getState(id, recipeId, factoryId);
    const def = s.fMatch ? s.recipe.beacon : s.factory.beacon;
    emitter.emit({ id, value, default: def });
  }

  changeBeaconModules(
    recipeId: string,
    input: string,
    index: number,
    modules: string[],
    emitter: EventEmitter<DefaultIdPayload<string[]>>,
    id = recipeId,
    factoryId = this.recipeSettings[recipeId].factory,
    beaconId = null
  ): void {
    const count = modules.length;
    const s = this.getState(id, recipeId, factoryId);
    const bMatch = beaconId == null || beaconId === s.recipe.beacon;
    const def =
      s.fMatch && bMatch
        ? s.recipe.beaconModules
        : new Array(count).fill(s.factory.beaconModule);
    const value = this.generateModules(index, input, modules);
    emitter.emit({
      id,
      value,
      default: def,
    });
  }

  generateModules(index: number, value: string, original: string[]): string[] {
    if (index === 0) {
      // Copy to all
      return new Array(original.length).fill(value);
    } else {
      // Edit individual module
      const modules = [...original];
      modules[index] = value;
      return modules;
    }
  }

  gtZero(value: string): boolean {
    try {
      return Rational.fromString(value).gt(Rational.zero);
    } catch {}
    return false;
  }
}
