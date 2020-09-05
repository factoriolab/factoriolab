import { Injectable } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { deflate, inflate } from 'pako';

import {
  Product,
  RecipeSettings,
  Step,
  RateType,
  ItemSettings,
  Entities,
} from '~/models';
import { State } from '~/store';
import { AppLoadAction } from '~/store/app.actions';
import * as Items from '~/store/items';
import * as Products from '~/store/products';
import * as Recipes from '~/store/recipes';
import * as Settings from '~/store/settings';

export const NULL = 'n';
export const EMPTY = 'e';
export const ARRAYSEP = '.';
export const FIELDSEP = ':';
export const TRUE = '1';
export const FALSE = '0';

@Injectable({
  providedIn: 'root',
})
export class RouterService {
  unzipping: boolean;
  zip: string;
  zipPartial = '';

  constructor(private router: Router, private store: Store<State>) {
    this.router.events.subscribe((e) => this.updateState(e));
  }

  updateUrl(
    products: Products.ProductsState,
    items: Items.ItemsState,
    recipes: Recipes.RecipesState,
    settings: Settings.SettingsState
  ) {
    if (!this.unzipping) {
      const zProducts = this.zipProducts(
        products.ids.map((i) => products.entities[i])
      );
      const zState = `p=${zProducts.join(',')}`;
      this.zipPartial = '';
      const zPreset = this.zipDiffNum(
        settings.preset,
        Settings.initialSettingsState.preset
      );
      if (zPreset.length) {
        this.zipPartial += `&b=${zPreset}`;
      }
      const zItems = this.zipItems(items);
      if (zItems.length) {
        this.zipPartial += `&i=${zItems.join(',')}`;
      }
      const zRecipes = this.zipRecipes(recipes);
      if (zRecipes.length) {
        this.zipPartial += `&r=${zRecipes.join(',')}`;
      }
      const zSettings = this.zipSettings(settings);
      if (zSettings.length) {
        this.zipPartial += `&s=${zSettings}`;
      }
      this.zip = this.getHash(zState);
      this.router.navigateByUrl(`${this.router.url.split('#')[0]}#${this.zip}`);
    }
  }

  stepHref(step: Step) {
    const products: Product[] = [
      {
        id: '0',
        itemId: step.itemId,
        rate: step.items.toNumber(),
        rateType: RateType.Items,
      },
    ];
    const zProducts = this.zipProducts(products);
    return '#' + this.getHash(`p=${zProducts.join(',')}`);
  }

  getHash(zProducts: string) {
    const unzipped = zProducts + this.zipPartial;
    const zipped = `z=${btoa(deflate(unzipped, { to: 'string' }))}`;
    return unzipped.length < zipped.length ? unzipped : zipped;
  }

  updateState(e: Event) {
    try {
      if (e instanceof NavigationEnd) {
        const fragments = e.url.split('#');
        if (fragments.length > 1) {
          const urlZip = fragments[fragments.length - 1];
          if (this.zip !== urlZip) {
            const zState = urlZip.startsWith('z=')
              ? inflate(atob(urlZip.substr(2)), { to: 'string' })
              : urlZip;
            const params = zState.split('&');
            const state: State = {} as any;
            for (const p of params) {
              const s = p.split('=');
              if (s[1]) {
                if (s[0] === 'p') {
                  state.productsState = this.unzipProducts(s[1].split(','));
                } else if (s[0] === 'b') {
                  this.zipPartial += `&b=${s[1]}`;
                  state.settingsState = {
                    ...state.settingsState,
                    ...{ preset: this.parseNumber(s[1]) },
                  };
                } else if (s[0] === 'i') {
                  this.zipPartial = `&i=${s[1]}`;
                  state.itemsState = this.unzipItems(s[1].split(','));
                } else if (s[0] === 'r') {
                  this.zipPartial = `&r=${s[1]}`;
                  state.recipesState = this.unzipRecipes(s[1].split(','));
                } else if (s[0] === 's') {
                  this.zipPartial += `&s=${s[1]}`;
                  state.settingsState = {
                    ...state.settingsState,
                    ...this.unzipSettings(s[1]),
                  };
                }
              }
            }
            this.zip = urlZip;
            this.unzipping = true;
            this.store.dispatch(new AppLoadAction(state));
            this.unzipping = false;
          }
        }
      }
    } catch (e) {
      console.warn('Router: Failed to parse url');
      console.error(e);
    }
  }

  zipProducts(products: Product[]): string[] {
    return products.map((product) => {
      const i = product.itemId;
      const r = product.rate;

      if (product.rateType === RateType.Items) {
        return `${i}:${r}`;
      } else {
        const t = product.rateType;
        return `${i}:${r}:${t}`;
      }
    });
  }

  unzipProducts(zProducts: string[]): Products.ProductsState {
    const ids: string[] = [];
    const entities: Entities<Product> = {};
    let index = 0;
    for (const product of zProducts) {
      const p = product.split(FIELDSEP);
      const id = index.toString();
      if (p.length === 2 || p.length === 3) {
        ids.push(id);
        entities[id] = {
          id,
          itemId: p[0],
          rate: Number(p[1]),
          rateType: p.length > 2 ? Number(p[2]) : RateType.Items,
        };
        index++;
      } else {
        console.warn(
          `Router: Invalid number of fields in product: '${product}'`
        );
      }
    }
    return { ids, index, entities };
  }

  zipItems(state: Items.ItemsState): string[] {
    return Object.keys(state).map((id) => {
      const settings = state[id];
      const i = id;
      const ig = this.zipTruthyBool(settings.ignore);
      const bl = this.zipTruthy(settings.belt);
      return [i, ig, bl].join(FIELDSEP);
    });
  }

  unzipItems(zItems: string[]) {
    const items: Items.ItemsState = {};
    for (const recipe of zItems) {
      const r = recipe.split(FIELDSEP);
      const u: ItemSettings = {};
      let i = 1;
      let v = r[i++];
      if (v?.length) {
        u.ignore = this.parseBool(v);
      }
      v = r[i++];
      if (v?.length) {
        u.belt = this.parseString(v);
      }
      items[r[0]] = u;
    }
    return items;
  }

  zipRecipes(state: Recipes.RecipesState): string[] {
    return Object.keys(state).map((id) => {
      const settings = state[id];
      const i = id;
      const fc = this.zipTruthy(settings.factory);
      const md = this.zipTruthyArray(settings.factoryModules);
      const bt = this.zipTruthyArray(settings.beaconModules);
      const bc = this.zipTruthyNum(settings.beaconCount);
      const be = this.zipTruthy(settings.beacon);
      return [i, fc, md, bt, bc, be].join(FIELDSEP);
    });
  }

  unzipRecipes(zRecipes: string[]) {
    const recipes: Recipes.RecipesState = {};
    for (const recipe of zRecipes) {
      const r = recipe.split(FIELDSEP);
      const u: RecipeSettings = {};
      let i = 1;
      let v = r[i++];
      if (v?.length) {
        u.factory = this.parseString(v);
      }
      v = r[i++];
      if (v?.length) {
        u.factoryModules = this.parseArray(v);
      }
      v = r[i++];
      if (v?.length) {
        u.beaconModules = this.parseArray(v);
      }
      v = r[i++];
      if (v?.length) {
        u.beaconCount = this.parseNumber(v);
      }
      v = r[i++];
      if (v?.length) {
        u.beacon = this.parseString(v);
      }
      recipes[r[0]] = u;
    }
    return recipes;
  }

  zipSettings(state: Settings.SettingsState): string {
    const init = Settings.initialSettingsState;
    const bd = this.zipDiff(state.baseId, init.baseId);
    const md = this.zipDiffArray(state.modIds, init.modIds);
    const dr = this.zipDiffNum(state.displayRate, init.displayRate);
    const ip = this.zipDiffNum(state.itemPrecision, init.itemPrecision);
    const bp = this.zipDiffNum(state.beltPrecision, init.beltPrecision);
    const fp = this.zipDiffNum(state.factoryPrecision, init.factoryPrecision);
    const tb = this.zipDiff(state.belt, init.belt);
    const fl = this.zipDiff(state.fuel, init.fuel);
    const di = this.zipDiffArray(state.disabledRecipes, init.disabledRecipes);
    const fr = this.zipDiffRank(state.factoryRank, init.factoryRank);
    const mr = this.zipDiffRank(state.moduleRank, init.moduleRank);
    const bm = this.zipDiff(state.beaconModule, init.beaconModule);
    const bc = this.zipDiffNum(state.beaconCount, init.beaconCount);
    const dm = this.zipDiffBool(state.drillModule, init.drillModule);
    const mb = this.zipDiffNum(state.miningBonus, init.miningBonus);
    const rs = this.zipDiffNum(state.researchSpeed, init.researchSpeed);
    const fw = this.zipDiffNum(state.flowRate, init.flowRate);
    const ex = this.zipDiffBool(state.expensive, init.expensive);
    const be = this.zipDiff(state.beacon, init.beacon);
    const ep = this.zipDiffNum(state.powerPrecision, init.powerPrecision);
    const pp = this.zipDiffNum(
      state.pollutionPrecision,
      init.pollutionPrecision
    );
    const value = [
      bd,
      md,
      dr,
      ip,
      bp,
      fp,
      tb,
      fl,
      di,
      fr,
      mr,
      bm,
      bc,
      dm,
      mb,
      rs,
      fw,
      ex,
      be,
      ep,
      pp,
    ].join(FIELDSEP);
    return /^[:]+$/.test(value) ? '' : value;
  }

  unzipSettings(zSettings: string) {
    const s = zSettings.split(FIELDSEP);
    const settings: Settings.SettingsState = {} as any;
    let i = 0;
    let v = s[i++];
    if (v.length) {
      settings.baseId = v;
    }
    v = s[i++];
    if (v?.length) {
      settings.modIds = this.parseArray(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.displayRate = this.parseNumber(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.itemPrecision = this.parseNumber(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.beltPrecision = this.parseNumber(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.factoryPrecision = this.parseNumber(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.belt = this.parseString(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.fuel = this.parseString(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.disabledRecipes = this.parseArray(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.factoryRank = this.parseArray(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.moduleRank = this.parseArray(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.beaconModule = this.parseString(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.beaconCount = this.parseNumber(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.drillModule = this.parseBool(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.miningBonus = this.parseNumber(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.researchSpeed = this.parseNumber(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.flowRate = this.parseNumber(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.expensive = this.parseBool(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.beacon = this.parseString(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.powerPrecision = this.parseNumber(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.pollutionPrecision = this.parseNumber(v);
    }
    return settings;
  }

  zipTruthy(value: string) {
    return value == null ? '' : value;
  }

  zipTruthyNum(value: number) {
    return value == null ? '' : value.toString();
  }

  zipTruthyBool(value: boolean) {
    return value == null ? '' : value ? TRUE : FALSE;
  }

  zipTruthyArray(value: string[]) {
    return value == null ? '' : value.length ? value.join(ARRAYSEP) : EMPTY;
  }

  zipDiff(value: string, init: string) {
    return value === init ? '' : value == null ? NULL : value;
  }

  zipDiffNum(value: number, init: number) {
    return value === init ? '' : value == null ? NULL : value.toString();
  }

  zipDiffBool(value: boolean, init: boolean) {
    return value === init ? '' : value == null ? NULL : value ? TRUE : FALSE;
  }

  zipDiffArray(value: string[], init: string[]) {
    const zVal = value
      ? value.length
        ? [...value].sort().join(ARRAYSEP)
        : EMPTY
      : NULL;
    const zInit = init
      ? init.length
        ? [...init].sort().join(ARRAYSEP)
        : EMPTY
      : NULL;
    return zVal === zInit ? '' : zVal;
  }

  zipDiffRank(value: string[], init: string[]) {
    const zVal = value
      ? value.length
        ? [...value].join(ARRAYSEP)
        : EMPTY
      : NULL;
    const zInit = init
      ? init.length
        ? [...init].join(ARRAYSEP)
        : EMPTY
      : NULL;
    return zVal === zInit ? '' : zVal;
  }

  parseString(value: string) {
    return value === NULL ? null : value;
  }

  parseBool(value: string) {
    return value === NULL ? null : value === TRUE;
  }

  parseNumber(value: string) {
    return value === NULL ? null : Number(value);
  }

  parseArray(value: string) {
    return value === NULL ? null : value === EMPTY ? [] : value.split(ARRAYSEP);
  }
}
