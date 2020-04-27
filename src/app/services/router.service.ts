import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as pako from 'pako';

import { ItemId, Entities } from '~/models';
import { State } from '~/store';
import { DatasetState } from '~/store/dataset';
import { ProductsState } from '~/store/products';
import { RecipeState } from '~/store/recipe';
import { initialSettingsState, SettingsState } from '~/store/settings';

enum ModuleId {
  None,
  Speed1,
  Speed2,
  Speed3,
  Prod1,
  Prod2,
  Prod3,
  Eff1,
  Eff2,
  Eff3,
}

const moduleZ: Entities<ModuleId> = {
  [ItemId.Module]: ModuleId.None,
  [ItemId.SpeedModule1]: ModuleId.Speed1,
  [ItemId.SpeedModule2]: ModuleId.Speed2,
  [ItemId.SpeedModule3]: ModuleId.Speed3,
  [ItemId.ProductivityModule1]: ModuleId.Prod1,
  [ItemId.ProductivityModule2]: ModuleId.Prod2,
  [ItemId.ProductivityModule3]: ModuleId.Prod3,
  [ItemId.EfficiencyModule1]: ModuleId.Eff1,
  [ItemId.EfficiencyModule2]: ModuleId.Eff2,
  [ItemId.EfficiencyModule3]: ModuleId.Eff3,
};

@Injectable({
  providedIn: 'root',
})
export class RouterService {
  constructor(private router: Router) {
    this.router.events.subscribe((e) => console.log(e));
  }

  updateUrl(state: State) {
    const products = this.zipProducts(state.productsState, state.datasetState);
    let zState = `p=${products.join(',')}`;
    const recipes = this.zipRecipes(state.recipeState, state.datasetState);
    if (recipes.length) {
      zState += `&r=${recipes.join(',')}`;
    }
    const settings = this.zipSettings(state.settingsState, state.datasetState);
    if (settings.length) {
      zState += `&${settings.join('&')}`;
    }
    console.log(zState);
    const zip = btoa(pako.deflate(zState, { to: 'string' }));
    this.router.navigateByUrl(`#${zip}`);
  }

  zipProducts(state: ProductsState, data: DatasetState): string[] {
    return state.ids.map((id) => {
      const product = state.entities[id];
      const i = data.itemZ[product.itemId];
      const t = product.rateType;
      const r = product.rate;
      return `${i}:${t}:${r}`;
    });
  }

  zipRecipes(state: RecipeState, data: DatasetState): string[] {
    return Object.keys(state).map((id) => {
      const settings = state[id];
      const i = data.recipeZ[id];
      const ig = settings.ignore == null ? '' : settings.ignore ? 1 : 0;
      const ln = settings.lane == null ? '' : data.itemZ[settings.lane];
      const fc = settings.factory == null ? '' : data.itemZ[settings.factory];
      const md =
        settings.modules == null
          ? ''
          : settings.modules.map((m) => moduleZ[m]).join('.');
      const bt =
        settings.beaconType == null ? '' : moduleZ[settings.beaconType];
      const bc = settings.beaconCount == null ? '' : settings.beaconCount;
      return `${i}:${ig}:${ln}:${fc}:${md}:${bt}:${bc}`;
    });
  }

  zipSettings(state: SettingsState, data: DatasetState): string[] {
    const init = initialSettingsState;
    const val = [];
    if (state.displayRate !== init.displayRate) {
      val.push(`dr=${state.displayRate}`);
    }
    if (state.precision !== init.precision) {
      val.push(`pr=${state.precision}`);
    }
    if (state.belt !== init.belt) {
      val.push(`tb=${data.itemZ[state.belt]}`);
    }
    if (state.assembler !== init.assembler) {
      val.push(`ar=${data.itemZ[state.assembler]}`);
    }
    if (state.furnace !== init.furnace) {
      val.push(`fc=${data.itemZ[state.furnace]}`);
    }
    if (state.drill !== init.drill) {
      val.push(`dl=${data.itemZ[state.drill]}`);
    }
    if (state.prodModule !== init.prodModule) {
      val.push(`pm=${moduleZ[state.prodModule]}`);
    }
    if (state.otherModule !== init.otherModule) {
      val.push(`om=${moduleZ[state.otherModule]}`);
    }
    if (state.beaconType !== init.beaconType) {
      val.push(`bt=${moduleZ[state.beaconType]}`);
    }
    if (state.beaconCount !== init.beaconCount) {
      val.push(`bc=${state.beaconCount}`);
    }
    if (state.oilRecipe !== init.oilRecipe) {
      val.push(`or=${data.recipeZ[state.oilRecipe]}`);
    }
    if (state.fuel !== init.fuel) {
      val.push(`fl=${data.itemZ[state.fuel]}`);
    }
    if (state.miningBonus !== init.miningBonus) {
      val.push(`mb=${state.miningBonus}`);
    }
    if (state.researchSpeed !== init.researchSpeed) {
      val.push(`rs=${state.researchSpeed}`);
    }
    if (state.flowRate !== init.flowRate) {
      val.push(`fr=${state.flowRate}`);
    }
    return val;
  }
}
