import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { deflate, inflate } from 'pako';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { data } from 'src/data';
import {
  Product,
  RecipeSettings,
  Step,
  RateType,
  ItemSettings,
  Entities,
  FactorySettings,
  Rational,
  ModHash,
  DisplayRate,
  Preset,
} from '~/models';
import { State } from '~/store';
import { LoadAction } from '~/store/app.actions';
import { FactoriesState, initialFactoriesState } from '~/store/factories';
import { ItemsState } from '~/store/items';
import * as Products from '~/store/products';
import { RecipesState } from '~/store/recipes';
import { SettingsState, initialSettingsState } from '~/store/settings';

export const NULL = '?'; // Encoded, previously 'n'
export const EMPTY = '='; // Encoded, previously 'e'
export const LISTSEP = '_'; // Unreserved, previously ','
export const ARRAYSEP = '~'; // Unreserved, previously '+'
export const FIELDSEP = '*'; // Reserved, unescaped by encoding
export const TRUE = '1';
export const FALSE = '0';
export const BASE64ABC =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.'; // Unreserved
export const MAX = BASE64ABC.length;
export const INVERT = BASE64ABC.split('').reduce(
  (e: Entities<number>, c, i) => {
    e[c] = i;
    return e;
  },
  {}
);
export const MIN_ZIP = 75;

export enum Section {
  Version = 'v',
  Base = 'b',
  Products = 'p',
  Items = 'i',
  Recipes = 'r',
  Factories = 'f',
  Settings = 's',
}

export enum ZipVersion {
  Version0 = '0',
  Version1 = '1',
  Version2 = '2',
  Version3 = '3',
}

export interface Zip {
  bare: string;
  hash: string;
}

@Injectable({
  providedIn: 'root',
})
export class RouterService {
  zip: string;
  zipPartial: Zip = { bare: '', hash: '' };
  base64codes: Uint8Array;
  // Intended to denote hashing algorithm version
  bareVersion = ZipVersion.Version1;
  hashVersion = ZipVersion.Version3;
  zipTail: Zip = {
    bare: `&${Section.Version}=${this.bareVersion}`,
    hash: `&${Section.Version}${this.hashVersion}`,
  };
  cache: Entities<ModHash> = {};
  first = true;

  constructor(
    private router: Router,
    private store: Store<State>,
    private http: HttpClient
  ) {
    const l = 256;
    this.base64codes = new Uint8Array(l);
    for (let i = 0; i < l; i++) {
      this.base64codes[i] = 255; // invalid character
    }
    for (let i = 0; i < BASE64ABC.length; i++) {
      this.base64codes[BASE64ABC.charCodeAt(i)] = i;
    }
    this.base64codes['_'.charCodeAt(0)] = 0;

    this.router.events.subscribe((e) => this.updateState(e));

    this.store.select(Products.getZipState).subscribe((s) => {
      let skip = false;
      if (this.first) {
        // First update: if there are no modified settings, leave base URL.
        if (
          Object.keys(s.items).length === 0 &&
          Object.keys(s.recipes).length === 0 &&
          JSON.stringify(s.factories) ===
            JSON.stringify(initialFactoriesState) &&
          JSON.stringify(s.settings) === JSON.stringify(initialSettingsState)
        ) {
          // No modified settings, skip first update.
          skip = true;
        }
        // Don't check again later, always update.
        this.first = false;
      }
      if (!skip) {
        this.updateUrl(s.products, s.items, s.recipes, s.factories, s.settings);
      }
    });
  }

  updateUrl(
    products: Products.ProductsState,
    items: ItemsState,
    recipes: RecipesState,
    factories: FactoriesState,
    settings: SettingsState
  ): void {
    this.zipState(products, items, recipes, factories, settings).subscribe(
      (zState) => {
        this.zip = this.getHash(zState);
        const hash = this.router.url.split('#');
        this.router.navigateByUrl(
          `${hash[0].split('?')[0]}?${this.zip}${
            (hash[1] && `#${hash[1]}`) || ''
          }`
        );
      }
    );
  }

  zipState(
    products: Products.ProductsState,
    items: ItemsState,
    recipes: RecipesState,
    factories: FactoriesState,
    settings: SettingsState
  ): Observable<Zip> {
    return this.requestHash(settings.baseId).pipe(
      map((hash) => {
        const zipPartial: Zip = { bare: '', hash: '' };
        // Base
        const zBase = this.zipDiffString(
          settings.baseId,
          initialSettingsState.baseId
        );
        if (zBase.length) {
          zipPartial.hash += `&${Section.Base}${this.getId(
            data.hash.indexOf(zBase)
          )}`;
        }
        // Products
        const p = products.ids.map((i) => products.entities[i]);
        const zState = this.zipProducts(p, hash);
        // Settings
        this.zipItems(zipPartial, items, hash);
        this.zipRecipes(zipPartial, recipes, hash);
        this.zipFactories(zipPartial, factories, hash);
        this.zipSettings(zipPartial, settings, hash);
        this.zipPartial = zipPartial;
        return zState;
      })
    );
  }

  stepHref(step: Step, hash: ModHash): string {
    if (!step.items) {
      return null;
    }
    const products: Product[] = [
      {
        id: '0',
        itemId: step.itemId,
        rate: step.items.toString(),
        rateType: RateType.Items,
      },
    ];
    return '?' + this.getHash(this.zipProducts(products, hash));
  }

  getHash(zProducts: Zip): string {
    const bare = zProducts.bare + this.zipPartial.bare + this.zipTail.bare;
    const hash = zProducts.hash + this.zipPartial.hash + this.zipTail.hash;
    const zip = `z=${this.bytesToBase64(deflate(hash))}`;
    return bare.length < Math.max(zip.length, MIN_ZIP) ? bare : zip;
  }

  getParams(zip: string): Entities {
    const sections = zip.split('&');
    const substr = sections[0][1] === '=' ? 2 : 1;
    const params = sections.reduce((e: Entities<string>, v) => {
      e[v[0]] = v.substr(substr);
      return e;
    }, {});
    return params;
  }

  updateState(e: Event): void {
    try {
      if (e instanceof NavigationEnd) {
        const [prehash, ...posthash] = e.urlAfterRedirects.split('#');
        const hash = posthash.join('#'); // Preserve # after first instance
        const [prequery, ...postquery] = prehash.split('?');
        let query = postquery.join('?'); // Preserve ? after first instance
        if (!query.length && hash.length > 1 && hash[1] === '=') {
          // Try to recognize and handle old hash style navigation
          query = hash;
        }
        if (query) {
          let zip = query;
          if (this.zip !== zip) {
            if (zip.startsWith('z=')) {
              // Upgrade old query-unsafe zipped characters
              const z = zip
                .substr(2)
                .replace(/\+/g, '-')
                .replace(/\//g, '.')
                .replace(/=/g, '_');
              zip = inflate(this.base64ToBytes(z), { to: 'string' });
            }
            // Upgrade old query-unsafe delimiters
            zip = zip.replace(/,/g, LISTSEP).replace(/\+/g, ARRAYSEP);
            // Upgrade old null/empty values
            zip = zip
              .replace(/\*n\*/g, `*${NULL}*`)
              .replace(/\*e\*/g, `*${EMPTY}*`);
            const params = this.getParams(zip);
            let v = ZipVersion.Version0;
            if (params[Section.Version]) {
              v = params[Section.Version] as ZipVersion;
            }
            const state: State = {} as any;
            switch (v) {
              case ZipVersion.Version0: {
                if (params[Section.Products]) {
                  state.productsState = this.unzipProducts(params, v);
                }
                let preset: Preset;
                if (params[Section.Base]) {
                  preset = this.parseNumber(params[Section.Base]);
                }
                if (params[Section.Items]) {
                  state.itemsState = this.unzipItems(params, v);
                }
                if (params[Section.Recipes]) {
                  state.recipesState = this.unzipRecipes(params, v);
                }
                if (params[Section.Factories]) {
                  state.factoriesState = this.unzipFactories(params, v);
                }
                if (params[Section.Settings]) {
                  state.settingsState = this.unzipSettings(params, v);
                }
                if (preset != null) {
                  state.settingsState = {
                    ...state.settingsState,
                    ...{ preset },
                  };
                }
                this.dispatch(zip, state);
                break;
              }
              case ZipVersion.Version1: {
                Object.keys(params).forEach((k) => {
                  params[k] = decodeURIComponent(params[k]);
                });
                if (params[Section.Products]) {
                  state.productsState = this.unzipProducts(params, v);
                }
                if (params[Section.Items]) {
                  state.itemsState = this.unzipItems(params, v);
                }
                if (params[Section.Recipes]) {
                  state.recipesState = this.unzipRecipes(params, v);
                }
                if (params[Section.Factories]) {
                  state.factoriesState = this.unzipFactories(params, v);
                }
                if (params[Section.Settings]) {
                  state.settingsState = this.unzipSettings(params, v);
                }
                this.dispatch(zip, state);
                break;
              }
              case ZipVersion.Version2:
              case ZipVersion.Version3: {
                const baseId = this.parseNString(
                  params[Section.Base],
                  data.hash
                );
                this.requestHash(
                  baseId || initialSettingsState.baseId
                ).subscribe((hash) => {
                  if (params[Section.Products]) {
                    state.productsState = this.unzipProducts(params, v, hash);
                  }
                  if (params[Section.Items]) {
                    state.itemsState = this.unzipItems(params, v, hash);
                  }
                  if (params[Section.Recipes]) {
                    state.recipesState = this.unzipRecipes(params, v, hash);
                  }
                  if (params[Section.Factories]) {
                    state.factoriesState = this.unzipFactories(params, v, hash);
                  }
                  if (params[Section.Settings]) {
                    state.settingsState = this.unzipSettings(params, v, hash);
                  }
                  if (baseId != null) {
                    state.settingsState = {
                      ...state.settingsState,
                      ...{ baseId },
                    };
                  }
                  this.dispatch(zip, state);
                });
                break;
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Router: Failed to parse url');
      console.error(e);
    }
  }

  dispatch(zip: string, state: State): void {
    this.zip = zip;
    this.store.dispatch(new LoadAction(state));
  }

  zipProducts(products: Product[], hash: ModHash): Zip {
    const z = this.zipList(
      products.map((obj) => {
        const r = Rational.fromString(obj.rate).toString();
        const t = this.zipDiffNumber(obj.rateType, RateType.Items);

        return {
          bare: this.zipFields([
            obj.itemId,
            r,
            t,
            this.zipTruthyString(obj.viaId),
            this.zipTruthyString(obj.viaSetting),
            this.zipTruthyArray(obj.viaFactoryModules),
            this.zipTruthyString(obj.viaBeaconCount),
            this.zipTruthyArray(obj.viaBeaconModules),
            this.zipTruthyString(obj.viaBeacon),
            this.zipTruthyNumber(obj.viaOverclock),
          ]),
          hash: this.zipFields([
            this.zipTruthyNString(obj.itemId, hash.items),
            r,
            t,
            this.zipTruthyNString(
              obj.viaId,
              obj.rateType === RateType.Factories ? hash.recipes : hash.items
            ),
            this.zipTruthyNString(
              obj.viaSetting,
              obj.rateType === RateType.Belts
                ? hash.belts
                : obj.rateType === RateType.Wagons
                ? hash.wagons
                : obj.rateType === RateType.Factories
                ? hash.factories
                : hash.items
            ),
            this.zipTruthyNArray(obj.viaFactoryModules, hash.modules),
            this.zipTruthyString(obj.viaBeaconCount),
            this.zipTruthyNArray(obj.viaBeaconModules, hash.modules),
            this.zipTruthyNString(obj.viaBeacon, hash.beacons),
            this.zipTruthyNumber(obj.viaOverclock),
          ]),
        };
      })
    );

    return {
      bare: `${Section.Products}=${z.bare}`,
      hash: `${Section.Products}${z.hash}`,
    };
  }

  unzipProducts(
    params: Entities,
    v: ZipVersion,
    hash: ModHash = null
  ): Products.ProductsState {
    const list = params[Section.Products].split(LISTSEP);
    const ids: string[] = [];
    const entities: Entities<Product> = {};
    let index = 0;
    for (const product of list) {
      const s = product.split(FIELDSEP);
      let i = 0;
      const id = index.toString();
      let obj: Product;

      switch (v) {
        case ZipVersion.Version0:
        case ZipVersion.Version1: {
          obj = {
            id,
            itemId: s[i++],
            rate: s[i++],
            rateType: Number(s[i++]) | RateType.Items,
            viaId: this.parseString(s[i++]),
            viaSetting: this.parseString(s[i++]),
            viaFactoryModules: this.parseArray(s[i++]),
            viaBeaconCount: this.parseString(s[i++]),
            viaBeaconModules: this.parseArray(s[i++]),
            viaBeacon: this.parseString(s[i++]),
            viaOverclock: this.parseNumber(s[i++]),
          };
          break;
        }
        case ZipVersion.Version2:
        case ZipVersion.Version3: {
          obj = {
            id,
            itemId: this.parseNString(s[i++], hash.items),
            rate: s[i++],
            rateType: Number(s[i++]) | RateType.Items,
          };
          obj.viaId = this.parseNString(
            s[i++],
            obj.rateType === RateType.Factories ? hash.recipes : hash.items
          );
          obj.viaSetting = this.parseNString(
            s[i++],
            obj.rateType === RateType.Belts
              ? hash.belts
              : obj.rateType === RateType.Wagons
              ? hash.wagons
              : obj.rateType === RateType.Factories
              ? hash.factories
              : hash.items
          );
          obj.viaFactoryModules = this.parseNArray(s[i++], hash.modules);
          obj.viaBeaconCount = this.parseString(s[i++]);
          obj.viaBeaconModules = this.parseNArray(s[i++], hash.modules);
          obj.viaBeacon = this.parseNString(s[i++], hash.beacons);
          obj.viaOverclock = this.parseNumber(s[i++]);
          break;
        }
      }

      Object.keys(obj)
        .filter((k) => obj[k] === undefined)
        .forEach((k) => {
          delete obj[k];
        });

      ids.push(id);
      entities[id] = obj;
      index++;
    }
    return { ids, index, entities };
  }

  zipItems(partial: Zip, state: ItemsState, hash: ModHash): void {
    const z = this.zipList(
      Object.keys(state).map((i) => {
        const obj = state[i];
        const g = this.zipTruthyBool(obj.ignore);

        return {
          bare: this.zipFields([
            i,
            g,
            this.zipTruthyString(obj.belt),
            this.zipTruthyString(obj.wagon),
            this.zipTruthyString(obj.recipe),
          ]),
          hash: this.zipFields([
            this.zipTruthyNString(i, hash.items),
            g,
            this.zipTruthyNString(obj.belt, hash.belts),
            this.zipTruthyNString(obj.wagon, hash.wagons),
            this.zipTruthyNString(obj.recipe, hash.recipes),
          ]),
        };
      })
    );

    if (z.bare.length) {
      partial.bare += `&${Section.Items}=${z.bare}`;
      partial.hash += `&${Section.Items}${z.hash}`;
    }
  }

  unzipItems(
    params: Entities,
    v: ZipVersion,
    hash: ModHash = null
  ): ItemsState {
    const list = params[Section.Items].split(LISTSEP);
    const entities: ItemsState = {};
    for (const item of list) {
      const s = item.split(FIELDSEP);
      let i = 0;
      let id: string;
      let obj: ItemSettings;

      switch (v) {
        case ZipVersion.Version0:
        case ZipVersion.Version1: {
          id = s[i++];
          obj = {
            ignore: this.parseBool(s[i++]),
            belt: this.parseString(s[i++]),
            wagon: this.parseString(s[i++]),
            recipe: this.parseString(s[i++]),
          };
          break;
        }
        case ZipVersion.Version2:
        case ZipVersion.Version3: {
          id = this.parseNString(s[i++], hash.items);
          obj = {
            ignore: this.parseBool(s[i++]),
            belt: this.parseNString(s[i++], hash.belts),
            wagon: this.parseNString(s[i++], hash.wagons),
            recipe: this.parseNString(s[i++], hash.recipes),
          };
          break;
        }
      }

      Object.keys(obj)
        .filter((k) => obj[k] === undefined)
        .forEach((k) => {
          delete obj[k];
        });

      entities[id] = obj;
    }
    return entities;
  }

  zipRecipes(partial: Zip, state: RecipesState, hash: ModHash): void {
    const z = this.zipList(
      Object.keys(state).map((i) => {
        const obj = state[i];

        return {
          bare: this.zipFields([
            i,
            this.zipTruthyString(obj.factory),
            this.zipTruthyArray(obj.factoryModules),
            this.zipTruthyString(obj.beaconCount),
            this.zipTruthyArray(obj.beaconModules),
            this.zipTruthyString(obj.beacon),
            this.zipTruthyNumber(obj.overclock),
            this.zipTruthyString(obj.cost),
            this.zipTruthyString(obj.beaconTotal),
          ]),
          hash: this.zipFields([
            this.zipTruthyNString(i, hash.recipes),
            this.zipTruthyNString(obj.factory, hash.factories),
            this.zipTruthyNArray(obj.factoryModules, hash.modules),
            this.zipTruthyString(obj.beaconCount),
            this.zipTruthyNArray(obj.beaconModules, hash.modules),
            this.zipTruthyNString(obj.beacon, hash.beacons),
            this.zipTruthyNumber(obj.overclock),
            this.zipTruthyString(obj.cost),
            this.zipTruthyString(obj.beaconTotal),
          ]),
        };
      })
    );

    if (z.bare.length) {
      partial.bare += `&${Section.Recipes}=${z.bare}`;
      partial.hash += `&${Section.Recipes}${z.hash}`;
    }
  }

  unzipRecipes(
    params: Entities,
    v: ZipVersion,
    hash: ModHash = null
  ): RecipesState {
    const list = params[Section.Recipes].split(LISTSEP);
    const entities: RecipesState = {};
    for (const recipe of list) {
      const s = recipe.split(FIELDSEP);
      let i = 0;
      let id: string;
      let obj: RecipeSettings;

      switch (v) {
        case ZipVersion.Version0:
        case ZipVersion.Version1: {
          id = s[i++];
          obj = {
            factory: this.parseString(s[i++]),
            factoryModules: this.parseArray(s[i++]),
            beaconCount: this.parseString(s[i++]),
            beaconModules: this.parseArray(s[i++]),
            beacon: this.parseString(s[i++]),
            overclock: this.parseNumber(s[i++]),
            cost: this.parseString(s[i++]),
            beaconTotal: this.parseString(s[i++]),
          };
          break;
        }
        case ZipVersion.Version2:
        case ZipVersion.Version3: {
          id = this.parseNString(s[i++], hash.recipes);
          obj = {
            factory: this.parseNString(s[i++], hash.factories),
            factoryModules: this.parseNArray(s[i++], hash.modules),
            beaconCount:
              v === ZipVersion.Version2
                ? this.parseNNumber(s[i++]).toString()
                : this.parseString(s[i++]),
            beaconModules: this.parseNArray(s[i++], hash.modules),
            beacon: this.parseNString(s[i++], hash.beacons),
            overclock: this.parseNumber(s[i++]),
            cost: this.parseString(s[i++]),
            beaconTotal: this.parseString(s[i++]),
          };
          break;
        }
      }

      Object.keys(obj)
        .filter((k) => obj[k] === undefined)
        .forEach((k) => {
          delete obj[k];
        });

      entities[id] = obj;
    }
    return entities;
  }

  zipFactories(partial: Zip, state: FactoriesState, hash: ModHash): void {
    const ids = state.ids ? ['', ...state.ids] : Object.keys(state.entities);
    const z = this.zipList(
      ids.map((i) => {
        const obj = state.entities[i] || {};
        let h = true;
        if (i === '') {
          i = state.ids == null ? '' : TRUE;
          h = false;
        }
        return {
          bare: this.zipFields([
            i,
            this.zipTruthyArray(obj.moduleRank),
            this.zipTruthyString(obj.beaconCount),
            this.zipTruthyString(obj.beaconModule),
            this.zipTruthyString(obj.beacon),
            this.zipTruthyNumber(obj.overclock),
          ]),
          hash: this.zipFields([
            h ? this.zipTruthyNString(i, hash.factories) : i,
            this.zipTruthyNArray(obj.moduleRank, hash.modules),
            this.zipTruthyString(obj.beaconCount),
            this.zipTruthyNString(obj.beaconModule, hash.modules),
            this.zipTruthyNString(obj.beacon, hash.beacons),
            this.zipTruthyNumber(obj.overclock),
          ]),
        };
      })
    );

    if (z.bare.length) {
      partial.bare += `&${Section.Factories}=${z.bare}`;
      partial.hash += `&${Section.Factories}${z.hash}`;
    }
  }

  unzipFactories(
    params: Entities,
    v: ZipVersion,
    hash: ModHash = null
  ): FactoriesState {
    const list = params[Section.Factories].split(LISTSEP);
    let ids: string[] = null;
    const entities: Entities<FactorySettings> = {};
    let loadIds = false;
    for (let z = 0; z < list.length; z++) {
      const factory = list[z];
      const s = factory.split(FIELDSEP);
      let i = 0;
      let id: string;
      let obj: FactorySettings;

      switch (v) {
        case ZipVersion.Version0:
        case ZipVersion.Version1: {
          id = s[i++];
          obj = {
            moduleRank: this.parseArray(s[i++]),
            beaconCount: this.parseString(s[i++]),
            beaconModule: this.parseString(s[i++]),
            beacon: this.parseString(s[i++]),
            overclock: this.parseNumber(s[i++]),
          };
          if (z === 0 && id === TRUE) {
            loadIds = true;
            ids = [];
            id = '';
          } else if (loadIds) {
            ids.push(id);
          }
          break;
        }
        case ZipVersion.Version2:
        case ZipVersion.Version3: {
          id = s[i++];
          obj = {
            moduleRank: this.parseNArray(s[i++], hash.modules),
            beaconCount:
              v === ZipVersion.Version2
                ? this.parseNNumber(s[i++])?.toString()
                : this.parseString(s[i++]),
            beaconModule: this.parseNString(s[i++], hash.modules),
            beacon: this.parseNString(s[i++], hash.beacons),
            overclock: this.parseNumber(s[i++]),
          };
          if (z === 0 && id === TRUE) {
            loadIds = true;
            ids = [];
            id = '';
          } else {
            id = this.parseNString(id, hash.factories);
            if (loadIds) {
              ids.push(id);
            }
          }
          break;
        }
      }

      Object.keys(obj)
        .filter((k) => obj[k] === undefined)
        .forEach((k) => {
          delete obj[k];
        });

      if (Object.keys(obj).length) {
        entities[id] = obj;
      }
    }
    return { ids, entities };
  }

  zipSettings(partial: Zip, state: SettingsState, hash: ModHash): void {
    const init = initialSettingsState;
    const z: Zip = {
      bare: this.zipFields([
        this.zipDiffString(state.baseId, init.baseId),
        this.zipDiffDisplayRate(state.displayRate, init.displayRate),
        this.zipDiffNumber(state.preset, init.preset),
        this.zipDiffArray(state.disabledRecipes, init.disabledRecipes),
        this.zipDiffString(state.belt, init.belt),
        this.zipDiffString(state.fuel, init.fuel),
        this.zipDiffNumber(state.flowRate, init.flowRate),
        this.zipDiffNumber(state.miningBonus, init.miningBonus),
        this.zipDiffNumber(state.researchSpeed, init.researchSpeed),
        this.zipDiffNumber(state.inserterCapacity, init.inserterCapacity),
        this.zipDiffNumber(state.inserterTarget, init.inserterTarget),
        this.zipDiffBool(state.expensive, init.expensive),
        this.zipDiffString(state.cargoWagon, init.cargoWagon),
        this.zipDiffString(state.fluidWagon, init.fluidWagon),
        this.zipDiffString(state.pipe, init.pipe),
        this.zipDiffString(state.costFactor, init.costFactor),
        this.zipDiffString(state.costFactory, init.costFactory),
        this.zipDiffString(state.costInput, init.costInput),
        this.zipDiffString(state.costIgnored, init.costIgnored),
        this.zipDiffString(state.beaconReceivers, init.beaconReceivers),
      ]),
      hash: this.zipFields([
        this.zipDiffDisplayRate(state.displayRate, init.displayRate),
        this.zipDiffNumber(state.preset, init.preset),
        this.zipDiffNArray(
          state.disabledRecipes,
          init.disabledRecipes,
          hash.recipes
        ),
        this.zipDiffNString(state.belt, init.belt, hash.belts),
        this.zipDiffNString(state.fuel, init.fuel, hash.fuels),
        this.zipDiffNNumber(state.flowRate, init.flowRate),
        this.zipDiffNNumber(state.miningBonus, init.miningBonus),
        this.zipDiffNNumber(state.researchSpeed, init.researchSpeed),
        this.zipDiffNumber(state.inserterCapacity, init.inserterCapacity),
        this.zipDiffNumber(state.inserterTarget, init.inserterTarget),
        this.zipDiffBool(state.expensive, init.expensive),
        this.zipDiffNString(state.cargoWagon, init.cargoWagon, hash.wagons),
        this.zipDiffNString(state.fluidWagon, init.fluidWagon, hash.wagons),
        this.zipDiffNString(state.pipe, init.pipe, hash.belts),
        this.zipDiffString(state.costFactor, init.costFactor),
        this.zipDiffString(state.costFactory, init.costFactory),
        this.zipDiffString(state.costInput, init.costInput),
        this.zipDiffString(state.costIgnored, init.costIgnored),
        this.zipDiffString(state.beaconReceivers, init.beaconReceivers),
      ]),
    };

    if (z.bare.length) {
      partial.bare += `&${Section.Settings}=${z.bare}`;
      partial.hash += `&${Section.Settings}${z.hash}`;
    }
  }

  unzipSettings(
    params: Entities,
    v: ZipVersion,
    hash: ModHash = null
  ): SettingsState {
    const zip = params[Section.Settings];
    const s = zip.split(FIELDSEP);
    let i = 0;
    let obj: SettingsState;

    switch (v) {
      case ZipVersion.Version0: {
        const baseId = this.parseString(s[i++]);
        obj = {
          baseId: baseId && data.hash[data.v0.indexOf(baseId)],
          disabledRecipes: this.parseArray(s[i++]),
          expensive: this.parseBool(s[i++]),
          belt: this.parseString(s[i++]),
          fuel: this.parseString(s[i++]),
          flowRate: this.parseNumber(s[i++]),
          displayRate: this.parseNumber(s[i++]),
          miningBonus: this.parseNumber(s[i++]),
          researchSpeed: this.parseNumber(s[i++]),
          inserterTarget: this.parseNumber(s[i++]),
          inserterCapacity: this.parseNumber(s[i++]),
          cargoWagon: this.parseString(s[i++]),
          fluidWagon: this.parseString(s[i++]),
          pipe: this.parseString(s[i++]),
          costFactor: this.parseString(s[i++]),
          costFactory: this.parseString(s[i++]),
          costInput: this.parseString(s[i++]),
          costIgnored: this.parseString(s[i++]),
          beaconReceivers: this.parseString(s[i++]),
          preset: undefined,
        };
        break;
      }
      case ZipVersion.Version1: {
        obj = {
          baseId: this.parseString(s[i++]),
          displayRate: this.parseDisplayRate(s[i++]),
          preset: this.parseNumber(s[i++]),
          disabledRecipes: this.parseArray(s[i++]),
          belt: this.parseString(s[i++]),
          fuel: this.parseString(s[i++]),
          flowRate: this.parseNumber(s[i++]),
          miningBonus: this.parseNumber(s[i++]),
          researchSpeed: this.parseNumber(s[i++]),
          inserterCapacity: this.parseNumber(s[i++]),
          inserterTarget: this.parseNumber(s[i++]),
          expensive: this.parseBool(s[i++]),
          cargoWagon: this.parseString(s[i++]),
          fluidWagon: this.parseString(s[i++]),
          pipe: this.parseString(s[i++]),
          costFactor: this.parseString(s[i++]),
          costFactory: this.parseString(s[i++]),
          costInput: this.parseString(s[i++]),
          costIgnored: this.parseString(s[i++]),
          beaconReceivers: this.parseString(s[i++]),
        };
        break;
      }
      case ZipVersion.Version2:
      case ZipVersion.Version3: {
        obj = {
          displayRate: this.parseDisplayRate(s[i++]),
          preset: this.parseNumber(s[i++]),
          disabledRecipes: this.parseNArray(s[i++], hash.recipes),
          belt: this.parseNString(s[i++], hash.belts),
          fuel: this.parseNString(s[i++], hash.fuels),
          flowRate: this.parseNNumber(s[i++]),
          miningBonus: this.parseNNumber(s[i++]),
          researchSpeed: this.parseNNumber(s[i++]),
          inserterCapacity: this.parseNumber(s[i++]),
          inserterTarget: this.parseNumber(s[i++]),
          expensive: this.parseBool(s[i++]),
          cargoWagon: this.parseNString(s[i++], hash.wagons),
          fluidWagon: this.parseNString(s[i++], hash.wagons),
          pipe: this.parseNString(s[i++], hash.belts),
          costFactor: this.parseString(s[i++]),
          costFactory: this.parseString(s[i++]),
          costInput: this.parseString(s[i++]),
          costIgnored: this.parseString(s[i++]),
          beaconReceivers: this.parseString(s[i++]),
          baseId: undefined,
        };
        break;
      }
    }

    Object.keys(obj)
      .filter((k) => obj[k] === undefined)
      .forEach((k) => {
        delete obj[k];
      });

    return obj;
  }

  zipList(list: Zip[]): Zip {
    return {
      bare: encodeURIComponent(list.map((i) => i.bare).join(LISTSEP)),
      hash: list.map((i) => i.hash).join(LISTSEP),
    };
  }

  zipFields(fields: string[]): string {
    return fields.join(FIELDSEP).replace(/\**$/, '');
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

  zipTruthyNString(value: string, hash: string[]): string {
    return value == null ? '' : this.getId(hash.indexOf(value));
  }

  zipTruthyNArray(value: string[], hash: string[]): string {
    return value == null
      ? ''
      : value.length
      ? value.map((v) => this.getId(hash.indexOf(v))).join(ARRAYSEP)
      : EMPTY;
  }

  zipDiffString(value: string, init: string): string {
    return value === init ? '' : value == null ? NULL : value;
  }

  zipDiffNumber(value: number, init: number): string {
    return value === init ? '' : value == null ? NULL : value.toString();
  }

  zipDiffDisplayRate(value: DisplayRate, init: DisplayRate): string {
    if (value === init) {
      return '';
    }
    switch (value) {
      case null:
        return NULL;
      case DisplayRate.PerSecond:
        return '0';
      case DisplayRate.PerMinute:
        return '1';
      case DisplayRate.PerHour:
        return '2';
    }
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
    const zVal = value ? (value.length ? value.join(ARRAYSEP) : EMPTY) : NULL;
    const zInit = init ? (init.length ? init.join(ARRAYSEP) : EMPTY) : NULL;
    return zVal === zInit ? '' : zVal;
  }

  zipDiffNString(value: string, init: string, hash: string[]): string {
    return value === init
      ? ''
      : value == null
      ? NULL
      : this.getId(hash.indexOf(value));
  }

  zipDiffNNumber(value: number, init: number): string {
    return value === init ? '' : value == null ? NULL : this.getId(value);
  }

  zipDiffNArray(value: string[], init: string[], hash: string[]): string {
    const zVal = value
      ? value.length
        ? value
            .map((v) => this.getId(hash.indexOf(v)))
            .sort()
            .join(ARRAYSEP)
        : EMPTY
      : NULL;
    const zInit = init
      ? init.length
        ? init
            .map((v) => this.getId(hash.indexOf(v)))
            .sort()
            .join(ARRAYSEP)
        : EMPTY
      : NULL;
    return zVal === zInit ? '' : zVal;
  }

  zipDiffNRank(value: string[], init: string[], hash: string[]): string {
    const zVal = value
      ? value.length
        ? value.map((v) => this.getId(hash.indexOf(v))).join(ARRAYSEP)
        : EMPTY
      : NULL;
    const zInit = init
      ? init.length
        ? init.map((v) => this.getId(hash.indexOf(v))).join(ARRAYSEP)
        : EMPTY
      : NULL;
    return zVal === zInit ? '' : zVal;
  }

  parseString(value: string): string {
    if (!value?.length) {
      return undefined;
    }
    return value === NULL ? null : value;
  }

  parseBool(value: string): boolean {
    if (!value?.length) {
      return undefined;
    }
    return value === NULL ? null : value === TRUE;
  }

  parseNumber(value: string): number {
    if (!value?.length) {
      return undefined;
    }
    return value === NULL ? null : Number(value);
  }

  parseDisplayRate(value: string): DisplayRate {
    if (!value?.length) {
      return undefined;
    }
    switch (value) {
      case NULL:
        return null;
      case '0':
        return DisplayRate.PerSecond;
      case '1':
        return DisplayRate.PerMinute;
      case '2':
        return DisplayRate.PerHour;
    }
  }

  parseArray(value: string): string[] {
    if (!value?.length) {
      return undefined;
    }
    return value === NULL ? null : value === EMPTY ? [] : value.split(ARRAYSEP);
  }

  parseNString(value: string, hash: string[]): string {
    const v = this.parseString(value);
    if (v == null) {
      return v;
    }
    return hash[this.getN(v)];
  }

  parseNNumber(value: string): number {
    if (!value?.length) {
      return undefined;
    }
    return value === NULL ? null : this.getN(value);
  }

  parseNArray(value: string, hash: string[]): string[] {
    const v = this.parseArray(value);
    if (v == null) {
      return v;
    }
    return v.map((a) => hash[this.getN(a)]);
  }

  getId(n: number): string {
    if (n / MAX >= 1) {
      return this.getId(Math.floor(n / MAX)) + this.getId(n % MAX);
    } else {
      return BASE64ABC[n];
    }
  }

  getN(id: string): number {
    const n = INVERT[id[0]];
    if (id.length > 1) {
      id = id.substr(1);
      return n * Math.pow(MAX, id.length) + this.getN(id);
    } else {
      return n;
    }
  }

  getBase64Code(charCode: number): number {
    if (charCode >= this.base64codes.length) {
      throw new Error('Unable to parse base64 string.');
    }
    const code = this.base64codes[charCode];
    if (code === 255) {
      throw new Error('Unable to parse base64 string.');
    }
    return code;
  }

  bytesToBase64(bytes: Uint8Array): string {
    let result = '';
    let i: number;
    const l = bytes.length;
    for (i = 2; i < l; i += 3) {
      result += BASE64ABC[bytes[i - 2] >> 2];
      result += BASE64ABC[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
      result += BASE64ABC[((bytes[i - 1] & 0x0f) << 2) | (bytes[i] >> 6)];
      result += BASE64ABC[bytes[i] & 0x3f];
    }
    if (i === l + 1) {
      // 1 octet yet to write
      result += BASE64ABC[bytes[i - 2] >> 2];
      result += BASE64ABC[(bytes[i - 2] & 0x03) << 4];
      result += '__';
    }
    if (i === l) {
      // 2 octets yet to write
      result += BASE64ABC[bytes[i - 2] >> 2];
      result += BASE64ABC[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
      result += BASE64ABC[(bytes[i - 1] & 0x0f) << 2];
      result += '_';
    }
    return result;
  }

  base64ToBytes(str: string): Uint8Array {
    if (str.length % 4 !== 0) {
      throw new Error('Unable to parse base64 string.');
    }
    const index = str.indexOf('_');
    if (index !== -1 && index < str.length - 2) {
      throw new Error('Unable to parse base64 string.');
    }
    const missingOctets = str.endsWith('__') ? 2 : str.endsWith('_') ? 1 : 0;
    const n = str.length;
    const result = new Uint8Array(3 * (n / 4));
    let buffer: number;
    for (let i = 0, j = 0; i < n; i += 4, j += 3) {
      buffer =
        (this.getBase64Code(str.charCodeAt(i)) << 18) |
        (this.getBase64Code(str.charCodeAt(i + 1)) << 12) |
        (this.getBase64Code(str.charCodeAt(i + 2)) << 6) |
        this.getBase64Code(str.charCodeAt(i + 3));
      result[j] = buffer >> 16;
      result[j + 1] = (buffer >> 8) & 0xff;
      result[j + 2] = buffer & 0xff;
    }
    return result.subarray(0, result.length - missingOctets);
  }

  requestHash(id: string): Observable<ModHash> {
    return this.cache[id]
      ? of(this.cache[id])
      : this.http.get(`data/${id}/hash.json`).pipe(
          map((response) => response as ModHash),
          tap((data) => (this.cache[id] = data))
        );
  }
}
