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
  FactorySettings,
} from '~/models';
import { State } from '~/store';
import { LoadAction } from '~/store/app.actions';
import { FactoriesState } from '~/store/factories';
import { ItemsState } from '~/store/items';
import * as Products from '~/store/products';
import { RecipesState } from '~/store/recipes';
import { SettingsState, initialSettingsState } from '~/store/settings';

export const NULL = 'n';
export const EMPTY = 'e';
export const LISTSEP = ',';
export const ARRAYSEP = '+';
export const FIELDSEP = '*';
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
    items: ItemsState,
    recipes: RecipesState,
    factories: FactoriesState,
    settings: SettingsState
  ): void {
    if (!this.unzipping) {
      const zProducts = this.zipProducts(
        products.ids.map((i) => products.entities[i])
      );
      const zState = `p=${zProducts}`;
      this.zipPartial = '';
      const zPreset = this.zipDiffNumber(
        settings.preset,
        initialSettingsState.preset
      );
      if (zPreset.length) {
        this.zipPartial += `&b=${zPreset}`;
      }
      const zItems = this.zipItems(items);
      if (zItems.length) {
        this.zipPartial += `&i=${zItems}`;
      }
      const zRecipes = this.zipRecipes(recipes);
      if (zRecipes.length) {
        this.zipPartial += `&r=${zRecipes}`;
      }
      const zFactories = this.zipFactories(factories);
      if (zFactories.length) {
        this.zipPartial += `&f=${zFactories}`;
      }
      const zSettings = this.zipSettings(settings);
      if (zSettings.length) {
        this.zipPartial += `&s=${zSettings}`;
      }
      this.zip = this.getHash(zState);
      this.router.navigateByUrl(`${this.router.url.split('#')[0]}#${this.zip}`);
    }
  }

  stepHref(step: Step): string {
    const products: Product[] = [
      {
        id: '0',
        itemId: step.itemId,
        rate: step.items.toString(),
        rateType: RateType.Items,
      },
    ];
    const zProducts = this.zipProducts(products);
    return '#' + this.getHash(`p=${zProducts}`);
  }

  getHash(zProducts: string): string {
    const unzipped = zProducts + this.zipPartial;
    const zipped = `z=${btoa(deflate(unzipped, { to: 'string' }))}`;
    return unzipped.length < zipped.length ? unzipped : zipped;
  }

  updateState(e: Event): void {
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
                  state.productsState = this.unzipProducts(s[1].split(LISTSEP));
                } else if (s[0] === 'b') {
                  this.zipPartial += `&b=${s[1]}`;
                  state.settingsState = {
                    ...state.settingsState,
                    ...{ preset: this.parseNumber(s[1]) },
                  };
                } else if (s[0] === 'i') {
                  this.zipPartial = `&i=${s[1]}`;
                  state.itemsState = this.unzipItems(s[1].split(LISTSEP));
                } else if (s[0] === 'r') {
                  this.zipPartial = `&r=${s[1]}`;
                  state.recipesState = this.unzipRecipes(s[1].split(LISTSEP));
                } else if (s[0] === 'f') {
                  this.zipPartial = `&f=${s[1]}`;
                  state.factoriesState = this.unzipFactories(
                    s[1].split(LISTSEP)
                  );
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
            this.store.dispatch(new LoadAction(state));
            this.unzipping = false;
          }
        }
      }
    } catch (e) {
      console.warn('Router: Failed to parse url');
      console.error(e);
    }
  }

  zipProducts(products: Product[]): string {
    return products
      .map((product) => {
        const i = product.itemId;
        const r = product.rate;

        return [
          i,
          r,
          this.zipDiffNumber(product.rateType, RateType.Items),
          this.zipTruthyString(product.viaId),
        ]
          .join(FIELDSEP)
          .replace(/\**$/, '');
      })
      .join(LISTSEP);
  }

  unzipProducts(zProducts: string[]): Products.ProductsState {
    const ids: string[] = [];
    const entities: Entities<Product> = {};
    let index = 0;
    for (const product of zProducts) {
      const p = product.split(FIELDSEP);
      const id = index.toString();
      const u: Product = {
        id,
        itemId: p[0],
        rate: p[1],
        rateType: p.length > 2 ? Number(p[2]) : RateType.Items,
      };
      let i = 3;
      let v = p[i++];
      if (v?.length) {
        u.viaId = this.parseString(v);
      }
      ids.push(id);
      entities[id] = u;
      index++;
    }
    return { ids, index, entities };
  }

  zipItems(state: ItemsState): string {
    return Object.keys(state)
      .map((id) => {
        const settings = state[id];
        return [
          id,
          this.zipTruthyBool(settings.ignore),
          this.zipTruthyString(settings.belt),
          this.zipTruthyString(settings.wagon),
        ]
          .join(FIELDSEP)
          .replace(/\**$/, '');
      })
      .join(LISTSEP);
  }

  unzipItems(zItems: string[]): ItemsState {
    const items: ItemsState = {};
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
      v = r[i++];
      if (v?.length) {
        u.wagon = this.parseString(v);
      }
      items[r[0]] = u;
    }
    return items;
  }

  zipRecipes(state: RecipesState): string {
    return Object.keys(state)
      .map((id) => {
        const settings = state[id];
        return [
          id,
          this.zipTruthyString(settings.factory),
          this.zipTruthyArray(settings.factoryModules),
          this.zipTruthyNumber(settings.beaconCount),
          this.zipTruthyArray(settings.beaconModules),
          this.zipTruthyString(settings.beacon),
        ]
          .join(FIELDSEP)
          .replace(/\**$/, '');
      })
      .join(LISTSEP);
  }

  unzipRecipes(zRecipes: string[]): RecipesState {
    const recipes: RecipesState = {};
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
        u.beaconCount = this.parseNumber(v);
      }
      v = r[i++];
      if (v?.length) {
        u.beaconModules = this.parseArray(v);
      }
      v = r[i++];
      if (v?.length) {
        u.beacon = this.parseString(v);
      }
      recipes[r[0]] = u;
    }
    return recipes;
  }

  zipFactories(state: FactoriesState): string {
    const ids = state.ids ? ['', ...state.ids] : Object.keys(state.entities);
    return ids
      .map((id) => {
        const othEnt = state.entities[id] || {};
        if (id === '') {
          id = state.ids == null ? '' : TRUE;
        }
        return [
          id,
          this.zipTruthyArray(othEnt.moduleRank),
          this.zipTruthyNumber(othEnt.beaconCount),
          this.zipTruthyString(othEnt.beaconModule),
          this.zipTruthyString(othEnt.beacon),
        ]
          .join(FIELDSEP)
          .replace(/\**$/, '');
      })
      .join(LISTSEP);
  }

  unzipFactories(zFactories: string[]): FactoriesState {
    const factories: FactoriesState = {
      ids: null,
      entities: {},
    };
    let loadIds = false;
    for (let z = 0; z < zFactories.length; z++) {
      const factory = zFactories[z];
      const f = factory.split(FIELDSEP);
      const u: FactorySettings = {};
      let i = 1;
      let v = f[i++];
      if (v?.length) {
        u.moduleRank = this.parseArray(v);
      }
      v = f[i++];
      if (v?.length) {
        u.beaconCount = this.parseNumber(v);
      }
      v = f[i++];
      if (v?.length) {
        u.beaconModule = this.parseString(v);
      }
      v = f[i++];
      if (v?.length) {
        u.beacon = this.parseString(v);
      }
      let id = f[0];
      if (z === 0) {
        if (id === TRUE) {
          loadIds = true;
          factories.ids = [];
        }
        id = '';
      } else if (loadIds) {
        factories.ids.push(id);
      }
      factories.entities[id] = u;
    }
    return factories;
  }

  zipSettings(state: SettingsState): string {
    const init = initialSettingsState;
    return [
      this.zipDiffString(state.baseId, init.baseId),
      this.zipDiffArray(state.disabledRecipes, init.disabledRecipes),
      this.zipDiffBool(state.expensive, init.expensive),
      this.zipDiffString(state.belt, init.belt),
      this.zipDiffString(state.fuel, init.fuel),
      this.zipDiffNumber(state.flowRate, init.flowRate),
      this.zipDiffNumber(state.displayRate, init.displayRate),
      this.zipDiffNumber(state.miningBonus, init.miningBonus),
      this.zipDiffNumber(state.researchSpeed, init.researchSpeed),
      this.zipDiffNumber(state.inserterTarget, init.inserterTarget),
      this.zipDiffNumber(state.inserterCapacity, init.inserterCapacity),
      this.zipDiffString(state.cargoWagon, init.cargoWagon),
      this.zipDiffString(state.fluidWagon, init.fluidWagon),
    ]
      .join(FIELDSEP)
      .replace(/\**$/, '');
  }

  unzipSettings(zSettings: string): SettingsState {
    const s = zSettings.split(FIELDSEP);
    const settings: SettingsState = {} as any;
    let i = 0;
    let v = s[i++];
    if (v.length) {
      settings.baseId = v;
    }
    v = s[i++];
    if (v?.length) {
      settings.disabledRecipes = this.parseArray(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.expensive = this.parseBool(v);
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
      settings.flowRate = this.parseNumber(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.displayRate = this.parseNumber(v);
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
      settings.inserterTarget = this.parseNumber(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.inserterCapacity = this.parseNumber(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.cargoWagon = this.parseString(v);
    }
    v = s[i++];
    if (v?.length) {
      settings.fluidWagon = this.parseString(v);
    }
    return settings;
  }

  zipTruthyString(value: string): string {
    return value == null ? '' : value;
  }

  zipTruthyNumber(value: number): string {
    return value == null ? '' : value.toString();
  }

  zipTruthyBool(value: boolean): string {
    return value == null ? '' : value ? TRUE : FALSE;
  }

  zipTruthyArray(value: string[]): string {
    return value == null ? '' : value.length ? value.join(ARRAYSEP) : EMPTY;
  }

  zipDiffString(value: string, init: string): string {
    return value === init ? '' : value == null ? NULL : value;
  }

  zipDiffNumber(value: number, init: number): string {
    return value === init ? '' : value == null ? NULL : value.toString();
  }

  zipDiffBool(value: boolean, init: boolean): string {
    return value === init ? '' : value == null ? NULL : value ? TRUE : FALSE;
  }

  zipDiffArray(value: string[], init: string[]): string {
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

  zipDiffRank(value: string[], init: string[]): string {
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

  parseString(value: string): string {
    return value === NULL ? null : value;
  }

  parseBool(value: string): boolean {
    return value === NULL ? null : value === TRUE;
  }

  parseNumber(value: string): number {
    return value === NULL ? null : Number(value);
  }

  parseArray(value: string): string[] {
    return value === NULL ? null : value === EMPTY ? [] : value.split(ARRAYSEP);
  }
}
