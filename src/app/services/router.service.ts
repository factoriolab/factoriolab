import { Injectable } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';
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
  zip: string;

  constructor(private router: Router) {
    this.router.events.subscribe(this.updateState);
  }

  updateUrl(state: State) {
    const products = this.zipProducts(state.productsState, state.datasetState);
    let zState = `p=${products.join(',')}`;
    const recipes = this.zipRecipes(state.recipeState, state.datasetState);
    if (recipes.length) {
      zState += `&r=${recipes.join(',')}`;
    }
    const settings = this.zipSettings(state.settingsState, state.datasetState);
    if (settings) {
      zState += `&s=${settings}`;
    }
    console.log(zState);
    this.zip = btoa(pako.deflate(zState, { to: 'string' }));
    this.router.navigateByUrl(`#${this.zip}`);
  }

  updateState(e: RouterEvent) {
    console.log(e);
    const fragments = e.url.split('#');
    const urlZip = fragments[fragments.length - 1];
    if (this.zip !== urlZip) {
      console.log('new value');
    } else {
      console.log('old value');
    }
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

  zipSettings(state: SettingsState, data: DatasetState): string {
    const init = initialSettingsState;
    if (state === init) {
      return null;
    }
    const dr = state.displayRate === init.displayRate ? '' : state.displayRate;
    const pr = state.precision === init.precision ? '' : state.precision;
    const tb = state.belt === init.belt ? '' : data.itemZ[state.belt];
    const pa =
      state.assembler === init.assembler ? '' : data.itemZ[state.assembler];
    const pf = state.furnace === init.furnace ? '' : data.itemZ[state.furnace];
    const pd = state.drill === init.drill ? '' : data.itemZ[state.drill];
    const mp =
      state.prodModule === init.prodModule ? '' : moduleZ[state.prodModule];
    const mo =
      state.otherModule === init.otherModule ? '' : moduleZ[state.otherModule];
    const bt =
      state.beaconType === init.beaconType ? '' : moduleZ[state.beaconType];
    const bc = state.beaconCount === init.beaconCount ? '' : state.beaconType;
    const or = state.oilRecipe === init.oilRecipe ? '' : state.oilRecipe;
    const fl = state.fuel === init.fuel ? '' : data.itemZ[state.fuel];
    const mb = state.miningBonus === init.miningBonus ? '' : state.miningBonus;
    const rs =
      state.researchSpeed === init.researchSpeed ? '' : state.researchSpeed;
    const fr = state.flowRate === init.flowRate ? '' : state.flowRate;
    return `${dr}:${pr}:${tb}:${pa}:${pf}:${pd}:${mp}:${mo}:${bt}:${bc}:${or}:${fl}:${mb}:${rs}:${fr}`;
  }
}
