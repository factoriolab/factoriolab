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
  Rational,
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

  /*
  // This constant can also be computed with the following algorithm:
  const base64abc = [],
    A = "A".charCodeAt(0),
    a = "a".charCodeAt(0),
    n = "0".charCodeAt(0);
  for (let i = 0; i < 26; ++i) {
    base64abc.push(String.fromCharCode(A + i));
  }
  for (let i = 0; i < 26; ++i) {
    base64abc.push(String.fromCharCode(a + i));
  }
  for (let i = 0; i < 10; ++i) {
    base64abc.push(String.fromCharCode(n + i));
  }
  base64abc.push("+");
  base64abc.push("/");
  */
  base64abc = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '-',
    '.',
  ];

  /*
  // This constant can also be computed with the following algorithm:
  const l = 256, base64codes = new Uint8Array(l);
  for (let i = 0; i < l; ++i) {
    base64codes[i] = 255; // invalid character
  }
  base64abc.forEach((char, index) => {
    base64codes[char.charCodeAt(0)] = index;
  });
  base64codes["=".charCodeAt(0)] = 0; // ignored anyway, so we just need to prevent an error
  */
  base64codes = [
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    62,
    255,
    255,
    255,
    63,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    255,
    255,
    255,
    0,
    255,
    255,
    255,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    255,
    255,
    255,
    255,
    255,
    255,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51,
  ];

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
    const zProducts = this.zipProducts(products);
    return '#' + this.getHash(`p=${zProducts}`, false);
  }

  getHash(zProducts: string, log = true): string {
    const unzipped = zProducts + this.zipPartial;
    if (log) {
      try {
        const test = deflate(unzipped);
        console.log(test);
        const a = this.bytesToBase64(test);
        const b = encodeURIComponent(unzipped);
        console.log(a);
        console.log(b);
        console.log(`${a.length} vs ${b.length}`);

        //const str = String.fromCharCode.apply(null, test);
        //const str = new TextDecoder('utf-8').decode(test);
        //console.log(str);
      } catch (ex) {
        console.error(ex);
      }
    }

    const zipped = `z=${btoa(deflate(unzipped, { to: 'string' }))}`;
    return unzipped.length < zipped.length ? unzipped : zipped;
  }

  getBase64Code(charCode): number {
    if (charCode >= this.base64codes.length) {
      throw new Error('Unable to parse base64 string.');
    }
    const code = this.base64codes[charCode];
    if (code === 255) {
      throw new Error('Unable to parse base64 string.');
    }
    return code;
  }

  bytesToBase64(bytes): string {
    let result = '',
      i,
      l = bytes.length;
    for (i = 2; i < l; i += 3) {
      result += this.base64abc[bytes[i - 2] >> 2];
      result += this.base64abc[
        ((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)
      ];
      result += this.base64abc[((bytes[i - 1] & 0x0f) << 2) | (bytes[i] >> 6)];
      result += this.base64abc[bytes[i] & 0x3f];
    }
    if (i === l + 1) {
      // 1 octet yet to write
      result += this.base64abc[bytes[i - 2] >> 2];
      result += this.base64abc[(bytes[i - 2] & 0x03) << 4];
      result += '==';
    }
    if (i === l) {
      // 2 octets yet to write
      result += this.base64abc[bytes[i - 2] >> 2];
      result += this.base64abc[
        ((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)
      ];
      result += this.base64abc[(bytes[i - 1] & 0x0f) << 2];
      result += '=';
    }
    return result;
  }

  base64ToBytes(str): Uint8Array {
    if (str.length % 4 !== 0) {
      throw new Error('Unable to parse base64 string.');
    }
    const index = str.indexOf('=');
    if (index !== -1 && index < str.length - 2) {
      throw new Error('Unable to parse base64 string.');
    }
    let missingOctets = str.endsWith('==') ? 2 : str.endsWith('=') ? 1 : 0,
      n = str.length,
      result = new Uint8Array(3 * (n / 4)),
      buffer;
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

  base64encode(str, encoder = new TextEncoder()): string {
    return this.bytesToBase64(encoder.encode(str));
  }

  base64decode(str, decoder = new TextDecoder()): string {
    return decoder.decode(this.base64ToBytes(str));
  }

  updateState(e: Event): void {
    try {
      if (e instanceof NavigationEnd) {
        const fragments = e.urlAfterRedirects.split('#');
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
        const r = Rational.fromString(product.rate).toString();

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
