import { computed, Signal, signal } from '@angular/core';
import { Subject } from 'rxjs';

import { Rational } from '~/rational/rational';
import { areSetsEqual } from '~/utils/equality';
import { prune, spread } from '~/utils/object';

export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };

/**
 * Compares an array with a default array. If it differs from the default,
 * returns the value, otherwise returns undefined.
 */
function compareRank(value: string[], def: string[]): string[] | undefined {
  if (value.length === def.length && value.every((v, i) => v === def[i]))
    return undefined;

  return value;
}

/**
 * Compares a set with a default set. If it differs from the default, returns
 * the value, otherwise returns undefined.
 */
export function compareSet<T>(value: Set<T>, def: Set<T>): Set<T> | undefined {
  if (areSetsEqual(value, def)) return undefined;
  return value;
}

export abstract class Store<T extends object> {
  protected _state = signal(this.initial);
  load$ = new Subject<void>();
  state = this._state.asReadonly();

  constructor(
    protected initial: T,
    protected nestedKeys: (keyof T)[] = [],
  ) {}

  /** Load recursive partial state, spreading any nested keys */
  load(partial: RecursivePartial<T> | undefined): void {
    this.load$.next();
    if (partial == null) {
      this.set(this.initial);
      return;
    }

    let next = spread(this.initial, partial as Partial<T>);

    // Spread any top-level nested keys (multi-level nesting not supported)
    for (const key of this.nestedKeys) {
      const apply = partial[key];
      if (typeof apply !== 'object') continue;
      const initial = this.initial[key];
      const partialNested: Partial<T> = {};
      partialNested[key] = spread(initial, apply);
      next = spread(next, partialNested);
    }

    this.set(next);
  }

  /** Load partial state, any nested keys should be complete */
  apply(partial: Partial<T>): void {
    this.set(spread(this.state(), partial));
  }

  /**
   * Update a field, potentially resetting to undefined if value matches a
   * default. If no default is used, prefer using `apply` method.
   */
  updateField<K extends keyof T>(field: K, value: T[K], def: T[K]): void {
    const result = this._resetValue(value, def);
    const partial: Partial<T> = {};
    partial[field] = result;
    this.apply(partial);
  }

  set(state: T): void {
    this._state.set(state);
  }

  protected reduce(fn: (state: T) => T): void {
    this._state.update(fn);
  }

  protected update(fn: (state: T) => Partial<T>): void {
    this._state.update((state) => spread(state, fn(state)));
  }

  protected select<K extends keyof T>(field: K): Signal<T[K]> {
    return computed(() => this.state()[field]);
  }

  /** Removes an entry from a Record */
  protected _removeEntry<T>(
    record: Record<string, T>,
    id: string,
  ): Record<string, T> {
    record = spread(record);
    delete record[id];
    return record;
  }

  protected _resetValue<T>(value: T, def: T | undefined): T | undefined {
    if (def == null) return value;

    if (Array.isArray(value) && Array.isArray(def))
      return compareRank(value, def) as T | undefined;
    if (value instanceof Set && def instanceof Set)
      return compareSet(value, def) as T | undefined;
    if (value instanceof Rational && def instanceof Rational)
      return value.eq(def) ? undefined : value;
    return value === def ? undefined : value;
  }
}

export abstract class RecordStore<T extends object> extends Store<
  Record<string, T>
> {
  constructor() {
    super({}, []);
  }

  updateRecord(id: string, partial: Partial<T>): void {
    this.reduce((state) => this._updateRecord(state, id, partial));
  }

  updateRecordField<K extends keyof T>(
    id: string,
    field: K,
    value: T[K],
    def?: T[K],
  ): void {
    this.reduce((state) => this._updateField(state, id, field, value, def));
  }

  resetFields(...fields: (keyof T)[]): void {
    this.reduce((state) => this._resetFields(state, fields));
  }

  resetId(id: string): void {
    this.reduce((state) => this._removeEntry(state, id));
  }

  private _updateRecord<T extends object>(
    state: Record<string, T>,
    id: string,
    apply: Partial<T>,
  ): Record<string, T> {
    const applied = spread(state[id], apply);
    prune(applied);
    if (Object.keys(applied).length) return spread(state, { [id]: applied });
    else {
      const next = spread(state);
      delete next[id];
      return next;
    }
  }

  /** Resets a passed field of the state */
  private _resetField<T extends object>(
    state: Record<string, T>,
    field: keyof T,
  ): Record<string, T> {
    // Spread into new state
    const newState = spread(state);
    for (const i of Object.keys(newState)) {
      if (newState[i][field] === undefined) continue;

      if (Object.keys(newState[i]).length === 1) delete newState[i];
      else {
        // Spread into new state
        newState[i] = spread(newState[i]);
        delete newState[i][field];
      }
    }
    return newState;
  }

  /** Resets a passed fields of the state */
  private _resetFields<T extends object>(
    state: Record<string, T>,
    fields: (keyof T)[],
  ): Record<string, T> {
    // Spread into new state
    let newState = spread(state);
    for (const field of fields) newState = this._resetField(newState, field);
    return newState;
  }

  private _updateField<T extends object, K extends keyof T>(
    state: Record<string, T>,
    id: string,
    field: K,
    value: T[K],
    def: T[K] | undefined,
  ): Record<string, T> {
    const real = this._resetValue(value, def);
    const partial: Partial<T> = {};
    partial[field] = real;
    return this._updateRecord(state, id, partial);
  }
}
