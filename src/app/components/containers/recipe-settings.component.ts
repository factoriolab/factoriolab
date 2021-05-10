import { Component, EventEmitter, Input } from '@angular/core';

import {
  Dataset,
  DefaultIdPayload,
  FactorySettings,
  ItemId,
  Rational,
} from '~/models';
import { FactoriesState } from '~/store/factories';
import { RecipesState } from '~/store/recipes';
import { RecipeUtility } from '~/utilities';

@Component({
  selector: 'lab-recipe-settings',
  template: '',
})
export class RecipeSettingsComponent {
  @Input() data: Dataset;
  @Input() recipeSettings: RecipesState;
  @Input() factories: FactoriesState;

  getSettings(factoryId: string): FactorySettings {
    return this.factories.entities[factoryId];
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
    const def = RecipeUtility.defaultModules(
      options,
      this.getSettings(factoryId).moduleRank,
      count
    );
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
        const def = this.getSettings(factoryId).beaconCount;
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
    const def = this.getSettings(factoryId).beacon;
    emitter.emit({ id, value, default: def });
  }

  changeBeaconModules(
    recipeId: string,
    input: string,
    index: number,
    modules: string[],
    emitter: EventEmitter<DefaultIdPayload<string[]>>,
    id = recipeId,
    factoryId = this.recipeSettings[recipeId].factory
  ): void {
    const count = modules.length;
    const def = new Array(count).fill(this.getSettings(factoryId).beaconModule);
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
