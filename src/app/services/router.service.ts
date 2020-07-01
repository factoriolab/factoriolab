import { Injectable } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import * as eql from 'deep-eql';
import { deflate, inflate } from 'pako';
import { take, filter } from 'rxjs/operators';

import {
  Product,
  RecipeSettings,
  Step,
  RateType,
  ItemId,
  ItemSettings,
  Entities,
} from '~/models';
import { State } from '~/store';
import { DatasetState, getDatasetState } from '~/store/dataset';
import * as Products from '~/store/products';
import * as Items from '~/store/items';
import * as Recipes from '~/store/recipes';
import * as Settings from '~/store/settings';

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
    items: Items.ItemsState,
    recipes: Recipes.RecipesState,
    settings: Settings.SettingsState,
    data: DatasetState
  ) {
    if (this.loaded && !this.unzipping) {
      const zProducts = this.zipProducts(products, data);
      const zState = `p=${zProducts.join(',')}`;
      this.zipPartial = '';
      const zItems = this.zipItems(items, data);
      if (zItems.length) {
        this.zipPartial += `&i=${zItems.join(',')}`;
      }
      const zRecipes = this.zipRecipes(recipes, data);
      if (zRecipes.length) {
        this.zipPartial += `&r=${zRecipes.join(',')}`;
      }
      const zSettings = this.zipSettings(settings, data);
      if (zSettings) {
        this.zipPartial += `&s=${zSettings}`;
      }
      this.zip = btoa(deflate(zState + this.zipPartial, { to: 'string' }));
      this.router.navigateByUrl(`${this.router.url.split('#')[0]}#${this.zip}`);
    } else {
      this.loaded = true;
    }
  }

  stepHref(step: Step, data: DatasetState) {
    const products: Product[] = [
      {
        id: 0,
        itemId: step.itemId,
        rate: step.items.toNumber(),
        rateType: RateType.Items,
      },
    ];
    const zProducts = this.zipProducts(products, data);
    const zState = `p=${zProducts.join(',')}`;
    return `#${btoa(deflate(zState + this.zipPartial, { to: 'string' }))}`;
  }

  updateState(e: Event) {
    try {
      if (e instanceof NavigationEnd) {
        const fragments = e.url.split('#');
        if (fragments.length > 1) {
          const urlZip = fragments[fragments.length - 1];
          if (this.zip !== urlZip) {
            const state: string = inflate(atob(urlZip), { to: 'string' });
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
                    } else if (s[0] === 'i') {
                      this.zipPartial = `&i=${s[1]}`;
                      this.unzipItems(s[1].split(','), data);
                    } else if (s[0] === 'r') {
                      this.zipPartial = `&r=${s[1]}`;
                      this.unzipRecipes(s[1].split(','), data);
                    } else if (s[0] === 's') {
                      this.zipPartial += `&s=${s[1]}`;
                      this.unzipSettings(s[1], data);
                    }
                  }
                }
                this.zip = urlZip;
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
      const i = product.itemId;
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
        itemId: p[0] as ItemId,
        rateType: Number(p[1]),
        rate: Number(p[2]),
      });
      n++;
    }
    this.store.dispatch(new Products.LoadAction(products));
  }

  zipItems(state: Items.ItemsState, data: DatasetState): string[] {
    return Object.keys(state).map((id) => {
      const settings = state[id];
      const i = id;
      const ig = settings.ignore == null ? '' : settings.ignore ? 1 : 0;
      const bl = settings.belt == null ? '' : settings.belt;
      return `${i}:${ig}:${bl}`;
    });
  }

  unzipItems(zItems: string[], data: DatasetState) {
    const items: Items.ItemsState = {};
    for (const recipe of zItems) {
      const r = recipe.split(':');
      const u: ItemSettings = {};
      if (r[1] !== '') {
        u.ignore = r[1] === '1' ? true : false;
      }
      if (r[2] !== '') {
        u.belt = r[2] as ItemId;
      }
      items[r[0]] = u;
    }
    this.store.dispatch(new Items.LoadAction(items));
  }

  zipRecipes(state: Recipes.RecipesState, data: DatasetState): string[] {
    return Object.keys(state).map((id) => {
      const settings = state[id];
      const i = id;
      const fc = settings.factory == null ? '' : settings.factory;
      const md = settings.modules == null ? '' : settings.modules.join('.');
      const bt = settings.beaconModule == null ? '' : settings.beaconModule;
      const bc = settings.beaconCount == null ? '' : settings.beaconCount;
      return `${i}:${fc}:${md}:${bt}:${bc}`;
    });
  }

  unzipRecipes(zRecipes: string[], data: DatasetState) {
    const recipes: Recipes.RecipesState = {};
    for (const recipe of zRecipes) {
      const r = recipe.split(':');
      const u: RecipeSettings = {};
      if (r[1] !== '') {
        u.factory = r[1] as ItemId;
      }
      if (r[2] !== '') {
        u.modules = r[2].split('.').map((m) => m as ItemId);
      }
      if (r[3] !== '') {
        u.beaconModule = r[3] as ItemId;
      }
      if (r[4] !== '') {
        u.beaconCount = Number(r[4]);
      }
      recipes[r[0]] = u;
    }
    this.store.dispatch(new Recipes.LoadAction(recipes));
  }

  zipSettings(state: Settings.SettingsState, data: DatasetState): string {
    const init = Settings.initialSettingsState;
    if (eql(state, init)) {
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
    const tb = state.belt === init.belt ? '' : state.belt;
    const pa = state.assembler === init.assembler ? '' : state.assembler;
    const pf = state.furnace === init.furnace ? '' : state.furnace;
    const di = eql(state.recipeDisabled, init.recipeDisabled)
      ? ''
      : Object.keys(state.recipeDisabled).join('.');
    const fl = state.fuel === init.fuel ? '' : state.fuel;
    const mp = state.prodModule === init.prodModule ? '' : state.prodModule;
    const ms = state.speedModule === init.speedModule ? '' : state.speedModule;
    const bm =
      state.beaconModule === init.beaconModule ? '' : state.beaconModule;
    const bc = state.beaconCount === init.beaconCount ? '' : state.beaconCount;
    const dm =
      state.drillModule === init.drillModule ? '' : Number(state.drillModule);
    const mb = state.miningBonus === init.miningBonus ? '' : state.miningBonus;
    const rs =
      state.researchSpeed === init.researchSpeed ? '' : state.researchSpeed;
    const fr = state.flowRate === init.flowRate ? '' : state.flowRate;
    const ex =
      state.expensive === init.expensive ? '' : Number(state.expensive);
    return `${dr}:${ip}:${bp}:${fp}:${tb}:${pa}:${pf}:${di}:${fl}:${mp}:${ms}:${bm}:${bc}:${dm}:${mb}:${rs}:${fr}:${ex}`;
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
      settings.belt = s[4] as ItemId;
    }
    if (s[5] !== '') {
      settings.assembler = s[5] as ItemId;
    }
    if (s[6] !== '') {
      settings.furnace = s[6] as ItemId;
    }
    if (s[7] !== '') {
      settings.recipeDisabled = s[7]
        .split('.')
        .reduce((e: Entities<boolean>, r) => ({ ...e, ...{ [r]: true } }), {});
    }
    if (s[8] !== '') {
      settings.fuel = s[8] as ItemId;
    }
    if (s[9] !== '') {
      settings.prodModule = s[9] as ItemId;
    }
    if (s[10] !== '') {
      settings.speedModule = s[10] as ItemId;
    }
    if (s[11] !== '') {
      settings.beaconModule = s[11] as ItemId;
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
