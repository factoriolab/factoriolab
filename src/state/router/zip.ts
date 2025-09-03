import { inject, Injectable } from '@angular/core';

import { Rational, rational } from '~/rational/rational';

import { Compression } from './compression';
import { ZARRAYSEP, ZEMPTY, ZFALSE, ZFIELDSEP, ZTRUE } from './constants';
import { LabParams } from './lab-params';
import { ZipData } from './zip-data';

type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

@Injectable({ providedIn: 'root' })
export class Zip {
  private readonly compression = inject(Compression);

  zipFields(fields: string[]): string {
    return fields.join(ZFIELDSEP).replace(/\**$/, '');
  }

  zipString(value: string | undefined): string {
    return value ?? '';
  }

  zipRational(value: Rational | undefined): string {
    return value == null ? '' : value.toString();
  }

  zipNumber(value: number | Rational | undefined): string {
    return value == null ? '' : value.toString();
  }

  zipArray(value: string[] | number[] | undefined): string {
    return value == null ? '' : value.length ? value.join(ZARRAYSEP) : ZEMPTY;
  }

  zipNString(value: string | undefined, hash: string[]): string {
    return value == null ? '' : this.compression.nToId(hash.indexOf(value));
  }

  zipDiffSubset(
    value: Set<string> | undefined,
    init: Set<string> | undefined,
    all: string[],
    hash: string[] = all,
  ): string {
    if (
      value == null ||
      (init != null && Array.from(value).every((v) => init.has(v)))
    )
      return '';
    if (value.size === 0) return ZEMPTY;

    const allSet = new Set(all);
    const result: string[] = [];
    let start: string | undefined;
    let end: string | undefined;
    hash.forEach((h, i) => {
      if (!allSet.has(h)) return;

      if (value.has(h)) {
        const j = this.compression.nToId(i);
        if (start == null) start = j;
        else end = j;
      } else if (start != null) {
        if (end == null) result.push(start);
        else result.push(start + ZARRAYSEP + end);
        start = undefined;
        end = undefined;
      }
    });

    if (start != null) {
      if (end == null) result.push(start);
      else result.push(start + ZARRAYSEP + end);
    }

    return result.join(ZFIELDSEP);
  }

  zipDiffString(
    value: string | undefined,
    init: string | undefined,
    hash: string[],
  ): string | [string, string] {
    if (value === init || value == null) return '';
    return [value, this.compression.nToId(hash.indexOf(value))];
  }

  zipDiffNumber(value: number | undefined, init: number | undefined): string {
    if (value === init || value == null) return '';
    return value.toString();
  }

  zipDiffRational(
    value: Rational | undefined,
    init: Rational | undefined,
  ): string {
    if (value == null || (init != null && value.eq(init))) return '';
    return value.toString();
  }

  zipDiffBool(value: boolean, init: boolean): string {
    return value === init ? '' : value ? ZTRUE : ZFALSE;
  }

  zipDiffIndices(
    value: number[] | undefined,
    init: number[] | undefined,
  ): string | [string, string] {
    const zVal =
      value != null ? (value.length > 0 ? value.join(ZARRAYSEP) : ZEMPTY) : '';
    const zInit =
      init != null ? (init.length > 0 ? init.join(ZARRAYSEP) : ZEMPTY) : '';
    return zVal === zInit ? '' : zVal;
  }

  zipDiffArray(
    value: string[] | undefined,
    init: string[] | undefined,
    hash: string[],
  ): string | [string, string] {
    const zVal =
      value != null ? (value.length > 0 ? value.join(ZARRAYSEP) : ZEMPTY) : '';
    const zInit =
      init != null ? (init.length > 0 ? init.join(ZARRAYSEP) : ZEMPTY) : '';
    if (zVal === zInit) return '';
    if (value == null || value.length === 0) return zVal;
    return [
      zVal,
      value.map((v) => this.compression.nToId(hash.indexOf(v))).join(ZARRAYSEP),
    ];
  }

  parseString(value: string | undefined, hash?: string[]): string | undefined {
    if (hash != null) return this.parseNString(value, hash);
    if (!value?.length) return undefined;
    return value;
  }

  parseBool(value: string | undefined): boolean | undefined {
    if (!value?.length) return undefined;
    return value === ZTRUE;
  }

  parseNumber(value: string | undefined): number | undefined {
    if (!value?.length) return undefined;
    return Number(value);
  }

  parseRational(value: string | undefined): Rational | undefined {
    if (!value?.length) return undefined;
    return rational(value);
  }

  parseArray(value: string | undefined, hash?: string[]): string[] | undefined {
    if (hash) return this.parseNArray(value, hash);
    if (!value?.length) return undefined;
    return value === ZEMPTY ? [] : value.split(ZARRAYSEP);
  }

  parseIndices<T extends object>(
    value: string | undefined,
    arr: T[],
  ): T[] | undefined {
    if (!value?.length) return undefined;
    if (value === ZEMPTY) return [];
    return value
      .split(ZARRAYSEP)
      .map((s) => Number(s))
      .map((i) => arr[i] ?? {});
  }

  parseNString(value: string | undefined, hash: string[]): string | undefined {
    const v = this.parseString(value);
    if (v == null) return v;
    return hash[this.compression.idToN(v)];
  }

  parseNArray(value: string | undefined, hash: string[]): string[] | undefined {
    const v = this.parseArray(value);
    if (v == null) return v;
    return v.map((a) => hash[this.compression.idToN(a)]);
  }

  parseSubset(
    value: string | undefined,
    hash: string[],
  ): Set<string> | undefined {
    if (!value?.length) return undefined;
    if (value === ZEMPTY) return new Set();

    const ranges = value.split(ZFIELDSEP);
    const result = new Set<string>();
    for (const range of ranges) {
      const [start, end] = range
        .split(ZARRAYSEP)
        .map((i) => this.compression.idToN(i));
      const sliceEnd = end != null ? end + 1 : start + 1;
      const slice = hash.slice(start, sliceEnd);
      slice.forEach((i) => result.add(i));
    }

    return result;
  }

  /**
   * Sets up a curried function stack to generate functions to add settings
   * query parameters to the `ZipData` `LabParams`.
   */
  set<T>(
    zip: ZipData<LabParams>,
    state: T,
    init: T,
  ): <V, A extends unknown[]>(
    value: (v: V, i: V, ...args: A) => string | [string, string],
  ) => (
    name: KeysMatching<LabParams, string | undefined>,
    locator: (state: T) => V,
    ...args: A
  ) => void {
    /**
     * Accepts a function to convert the state value to a string, or a pair of
     * bare / hashed strings, and returns a curried function. Caller is expected
     * to pass in a reference to a `zip` method on this service.
     */
    return (value) => {
      /**
       * Accepts a query parameter name, locator function to get the state
       * value, and any additional arguments to the value function.
       */
      return (name, locator, ...args): void => {
        /**
         * Get current state and initial values, then run value function to get
         * query parameter value.
         */
        const s = locator(state),
          i = locator(init),
          v = value(s, i, ...args);

        /**
         * If value function returned a tuple of bare / hash values, spread
         * them into local variables. Otherwise, set both variables to the
         * result of the value function.
         */
        let b: string | undefined;
        let h: string | undefined;
        if (Array.isArray(v)) [b, h] = [...v];
        else b = h = v;

        /**
         * If the bare value is defined, set the bare and hash values on thir
         * corresponding `LabParams` objects.
         */
        if (!b) return;
        zip.bare[name] = b;
        zip.hash[name] = h;
      };
    };
  }

  /**
   * Sets up a curried function stack to generate functions to get settings
   * state values from `LabParams`.
   */
  get(
    params: LabParams,
  ): <V, A extends unknown[]>(
    value: (s: string | undefined, ...args: A) => V,
  ) => (
    name: KeysMatching<LabParams, string | undefined>,
    ...args: A
  ) => V | undefined {
    /**
     * Accepts a function to convert the query parameter value to its
     * state value, and returns a curried function. Caller is expected
     * to pass in a reference to a `parse` method on this service.
     */
    return (value) => {
      // Bind the method reference to this service before use.
      value = value.bind(this);
      // Run value function to get state value
      return (name, ...args) => value(params[name], ...args);
    };
  }
}
