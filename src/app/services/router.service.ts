import { Injectable } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { take, filter } from 'rxjs/operators';
import * as pako from 'pako';

import {
  ItemId,
  Entities,
  Product,
  NEntities,
  RecipeSettings,
  Step,
  RateType,
} from '~/models';
import { State } from '~/store';
import { DatasetState, getDatasetState } from '~/store/dataset';
import * as Products from '~/store/products';
import * as Recipes from '~/store/recipe';
import * as Settings from '~/store/settings';

enum ModuleId {
  None,
  Speed1,
  Speed2,
  Speed3,
  Prod1,
  Prod2,
  Prod3,
}

const moduleN: Entities<ModuleId> = {
  [ItemId.Module]: ModuleId.None,
  [ItemId.SpeedModule]: ModuleId.Speed1,
  [ItemId.SpeedModule2]: ModuleId.Speed2,
  [ItemId.SpeedModule3]: ModuleId.Speed3,
  [ItemId.ProductivityModule]: ModuleId.Prod1,
  [ItemId.ProductivityModule2]: ModuleId.Prod2,
  [ItemId.ProductivityModule3]: ModuleId.Prod3,
};

const moduleI: NEntities<ItemId> = {
  [ModuleId.None]: ItemId.Module,
  [ModuleId.Speed1]: ItemId.SpeedModule,
  [ModuleId.Speed2]: ItemId.SpeedModule2,
  [ModuleId.Speed3]: ItemId.SpeedModule3,
  [ModuleId.Prod1]: ItemId.ProductivityModule,
  [ModuleId.Prod2]: ItemId.ProductivityModule2,
  [ModuleId.Prod3]: ItemId.ProductivityModule3,
};

@Injectable({
  providedIn: 'root',
})
export class RouterService {
  loaded: boolean;
  unzipping: boolean;
  zip: string;
  zipPartial = '';

  constructor(private router: Router, private store: Store<State>) {
    this.router.events.subscribe((e) => this.updateState(e));
  }

  updateUrl(
    products: Product[],
    recipes: Recipes.RecipeState,
    settings: Settings.SettingsState,
    data: DatasetState
  ) {
    if (this.loaded && !this.unzipping) {
      const zProducts = this.zipProducts(products, data);
      const zState = `p=${zProducts.join(',')}`;
      this.zipPartial = '';
      const zRecipes = this.zipRecipes(recipes, data);
      if (zRecipes.length) {
        this.zipPartial += `&r=${zRecipes.join(',')}`;
      }
      const zSettings = this.zipSettings(settings, data);
      if (zSettings) {
        this.zipPartial += `&s=${zSettings}`;
      }
      this.zip = btoa(pako.deflate(zState + this.zipPartial, { to: 'string' }));
      this.router.navigateByUrl(`#${this.zip}`);
    } else {
      this.loaded = true;
    }
  }

  stepHref(step: Step, data: DatasetState) {
    const products: Product[] = [
      {
        id: 0,
        itemId: step.itemId,
        rate: step.items.valueOf(),
        rateType: RateType.Items,
      },
    ];
    const zProducts = this.zipProducts(products, data);
    const zState = `p=${zProducts.join(',')}`;
    return `/#${btoa(
      pako.deflate(zState + this.zipPartial, { to: 'string' })
    )}`;
  }

  updateState(e: Event) {
    try {
      if (e instanceof NavigationEnd) {
        const fragments = e.url.split('#');
        if (fragments.length > 1) {
          const urlZip = fragments[fragments.length - 1];
          if (this.zip !== urlZip) {
            const state: string = pako.inflate(atob(urlZip), { to: 'string' });
            const params = state.split('&');
            this.store
              .select(getDatasetState)
              .pipe(
                filter((d) => !!d),
                take(1)
              )
              .subscribe((data) => {
                this.unzipping = true;
                for (const p of params) {
                  const s = p.split('=');
                  if (s[1]) {
                    if (s[0] === 'p') {
                      this.unzipProducts(s[1].split(','), data);
                    } else if (s[0] === 'r') {
                      this.zipPartial = `&r=${s[1]}`;
                      this.unzipRecipes(s[1].split(','), data);
                    } else if (s[0] === 's') {
                      this.zipPartial += `&r=${s[1]}`;
                      this.unzipSettings(s[1], data);
                    }
                  }
                }
              });
          }
        }
      }
    } catch (e) {
      console.error('Navigation failed.');
      console.error(e);
    } finally {
      this.unzipping = false;
    }
  }

  zipProducts(products: Product[], data: DatasetState): string[] {
    return products.map((product) => {
      const i = data.itemN[product.itemId];
      const t = product.rateType;
      const r = product.rate;
      return `${i}:${t}:${r}`;
    });
  }

  unzipProducts(zProducts: string[], data: DatasetState) {
    const products: Product[] = [];
    let n = 0;
    for (const product of zProducts) {
      const p = product.split(':');
      products.push({
        id: n,
        itemId: data.itemI[p[0]],
        rateType: Number(p[1]),
        rate: Number(p[2]),
      });
      n++;
    }
    this.store.dispatch(new Products.LoadAction(products));
  }

  zipRecipes(state: Recipes.RecipeState, data: DatasetState): string[] {
    return Object.keys(state).map((id) => {
      const settings = state[id];
      const i = data.recipeN[id];
      const ig = settings.ignore == null ? '' : settings.ignore ? 1 : 0;
      const bl = settings.belt == null ? '' : data.itemN[settings.belt];
      const fc = settings.factory == null ? '' : data.itemN[settings.factory];
      const md =
        settings.modules == null
          ? ''
          : settings.modules.map((m) => moduleN[m]).join('.');
      const bt =
        settings.beaconModule == null ? '' : moduleN[settings.beaconModule];
      const bc = settings.beaconCount == null ? '' : settings.beaconCount;
      return `${i}:${ig}:${bl}:${fc}:${md}:${bt}:${bc}`;
    });
  }

  unzipRecipes(zRecipes: string[], data: DatasetState) {
    const recipes: Recipes.RecipeState = {};
    for (const recipe of zRecipes) {
      const r = recipe.split(':');
      const u: RecipeSettings = {};
      if (r[1] !== '') {
        u.ignore = r[1] === '1' ? true : false;
      }
      if (r[2] !== '') {
        u.belt = data.itemI[r[2]];
      }
      if (r[3] !== '') {
        u.factory = data.itemI[r[3]];
      }
      if (r[4] !== '') {
        u.modules = r[4].split('.').map((m) => moduleI[Number(m)]);
      }
      if (r[5] !== '') {
        u.beaconModule = moduleI[Number(r[5])];
      }
      if (r[6] !== '') {
        u.beaconCount = Number(r[6]);
      }
      recipes[data.recipeI[r[0]]] = u;
    }
    this.store.dispatch(new Recipes.LoadAction(recipes));
  }

  zipSettings(state: Settings.SettingsState, data: DatasetState): string {
    const init = Settings.initialSettingsState;
    if (state === init) {
      return null;
    }
    const dr = state.displayRate === init.displayRate ? '' : state.displayRate;
    const ip =
      state.itemPrecision === init.itemPrecision
        ? ''
        : state.itemPrecision == null
        ? 'n'
        : state.itemPrecision;
    const bp =
      state.beltPrecision === init.beltPrecision
        ? ''
        : state.beltPrecision == null
        ? 'n'
        : state.beltPrecision;
    const fp =
      state.factoryPrecision === init.factoryPrecision
        ? ''
        : state.factoryPrecision == null
        ? 'n'
        : state.factoryPrecision;
    const tb = state.belt === init.belt ? '' : data.itemN[state.belt];
    const pa =
      state.assembler === init.assembler ? '' : data.itemN[state.assembler];
    const pf = state.furnace === init.furnace ? '' : data.itemN[state.furnace];
    const or =
      state.oilRecipe === init.oilRecipe ? '' : data.recipeN[state.oilRecipe];
    const fl = state.fuel === init.fuel ? '' : data.itemN[state.fuel];
    const mp =
      state.prodModule === init.prodModule ? '' : moduleN[state.prodModule];
    const ms =
      state.speedModule === init.speedModule ? '' : moduleN[state.speedModule];
    const bm =
      state.beaconModule === init.beaconModule
        ? ''
        : moduleN[state.beaconModule];
    const bc = state.beaconCount === init.beaconCount ? '' : state.beaconCount;
    const dm =
      state.drillModule === init.drillModule ? '' : Number(state.drillModule);
    const mb = state.miningBonus === init.miningBonus ? '' : state.miningBonus;
    const rs =
      state.researchSpeed === init.researchSpeed ? '' : state.researchSpeed;
    const fr = state.flowRate === init.flowRate ? '' : state.flowRate;
    const ex =
      state.expensive === init.expensive ? '' : Number(state.expensive);
    return `${dr}:${ip}:${bp}:${fp}:${tb}:${pa}:${pf}:${or}:${fl}:${mp}:${ms}:${bm}:${bc}:${dm}:${mb}:${rs}:${fr}:${ex}`;
  }

  unzipSettings(zSettings: string, data: DatasetState) {
    const s = zSettings.split(':');
    const settings: Settings.SettingsState = {} as any;
    if (s[0] !== '') {
      settings.displayRate = Number(s[0]);
    }
    if (s[1] !== '') {
      settings.itemPrecision = s[1] === 'n' ? null : Number(s[1]);
    }
    if (s[2] !== '') {
      settings.beltPrecision = s[2] === 'n' ? null : Number(s[2]);
    }
    if (s[3] !== '') {
      settings.factoryPrecision = s[3] === 'n' ? null : Number(s[3]);
    }
    if (s[4] !== '') {
      settings.belt = data.itemI[s[4]];
    }
    if (s[5] !== '') {
      settings.assembler = data.itemI[s[5]];
    }
    if (s[6] !== '') {
      settings.furnace = data.itemI[s[6]];
    }
    if (s[7] !== '') {
      settings.oilRecipe = data.recipeI[s[7]];
    }
    if (s[8] !== '') {
      settings.fuel = data.itemI[s[8]];
    }
    if (s[9] !== '') {
      settings.prodModule = moduleI[Number(s[9])];
    }
    if (s[10] !== '') {
      settings.speedModule = moduleI[Number(s[10])];
    }
    if (s[11] !== '') {
      settings.beaconModule = moduleI[Number(s[11])];
    }
    if (s[12] !== '') {
      settings.beaconCount = Number(s[12]);
    }
    if (s[13] !== '') {
      settings.drillModule = s[13] === '1';
    }
    if (s[14] !== '') {
      settings.miningBonus = Number(s[14]);
    }
    if (s[15] !== '') {
      settings.researchSpeed = Number(s[15]);
    }
    if (s[16] !== '') {
      settings.flowRate = Number(s[16]);
    }
    if (s[17] !== '') {
      settings.expensive = s[17] === '1';
    }
    this.store.dispatch(new Settings.LoadAction(settings));
  }
}
