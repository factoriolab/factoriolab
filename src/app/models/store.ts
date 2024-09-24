import { computed, Signal, signal } from '@angular/core';

import { compareRank, compareSet, prune, spread } from '~/helpers';

import { Rational } from './rational';
import { Entities, Optional, RecursivePartial } from './utils';

export abstract class Store<T extends object> {
  protected _state = signal(this.initial);
  state = this._state.asReadonly();

  constructor(
    protected initial: T,
    protected nestedKeys: (keyof T)[] = [],
  ) {}

  load(partial: Optional<RecursivePartial<T>>): void {
    if (partial == null) {
      this.set(this.initial);
      return;
    }

    const next = spread(this.initial, partial);
    this.set(next);
  }

  apply(partial: RecursivePartial<T>): void {
    const state = this.state();
    if (partial == null) return;

    let next = spread(state, partial);

    // Spread any top-level nested keys (multi-level nesting not supported)
    for (const key of this.nestedKeys) {
      const apply = partial[key];
      if (typeof apply !== 'object') continue;
      const current = state[key];
      const partialNested: Partial<T> = {};
      partialNested[key] = spread(current, apply);
      next = spread(next, partialNested);
    }

    this.set(next);
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

  protected set(state: T): void {
    this._state.set(state);
  }

  protected reduce(fn: (state: T) => T): void {
    const state = this._state();
    const next = fn(state);
    this.set(next);
  }

  protected update(fn: (state: T) => Partial<T>): void {
    const state = this._state();
    const apply = fn(state);
    const next = spread(state, apply);
    this.set(next);
  }

  protected select<K extends keyof T>(field: K): Signal<T[K]> {
    return computed(() => this.state()[field]);
  }

  /** Removes an entry from an Entities object */
  protected _removeEntry<T>(entities: Entities<T>, id: string): Entities<T> {
    entities = spread(entities);
    delete entities[id];
    return entities;
  }

  /** Resets a passed field of the state */
  protected _resetField<T extends object>(
    state: Entities<T>,
    field: keyof T,
    id?: string,
  ): Entities<T> {
    // Spread into new state
    const newState = spread(state);
    for (const i of Object.keys(newState)) {
      if ((id && id !== i) || newState[i][field] === undefined) continue;

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
  protected _resetFields<T extends object>(
    state: Entities<T>,
    fields: (keyof T)[],
    id?: string,
  ): Entities<T> {
    // Spread into new state
    let newState = spread(state);
    for (const field of fields)
      newState = this._resetField(newState, field, id);
    return newState;
  }

  protected _updateEntity<T extends object>(
    state: Entities<T>,
    id: string,
    apply: Partial<T>,
  ): Entities<T> {
    const applied = spread(state[id], apply);
    prune(applied);
    if (Object.keys(applied).length) return spread(state, { [id]: applied });
    else {
      const next = spread(state);
      delete next[id];
      return next;
    }
  }

  protected _resetValue<T>(value: T, def: Optional<T>): Optional<T> {
    if (def == null) return value;

    if (Array.isArray(value) && Array.isArray(def))
      return compareRank(value, def) as Optional<T>;
    if (value instanceof Set && def instanceof Set)
      return compareSet(value, def) as Optional<T>;
    if (value instanceof Rational && def instanceof Rational)
      return value.eq(def) ? undefined : value;
    return value === def ? undefined : value;
  }

  protected _updateField<T extends object, K extends keyof T>(
    state: Entities<T>,
    id: string,
    field: K,
    value: T[K],
    def: Optional<T[K]>,
  ): Entities<T> {
    const real = this._resetValue(value, def);
    const partial: Partial<T> = {};
    partial[field] = real;
    return this._updateEntity(state, id, partial);
  }
}

export abstract class EntityStore<T extends object> extends Store<Entities<T>> {
  constructor(initial: Entities<T>) {
    super(initial, []);
  }

  updateEntityField<K extends keyof T>(
    id: string,
    field: K,
    value: T[K],
    def?: Optional<T[K]>,
  ): void {
    this.reduce((state) => this._updateField(state, id, field, value, def));
  }

  resetFields(...fields: (keyof T)[]): void {
    this.update((state) => this._resetFields(state, fields));
  }

  resetId(id: string): void {
    this.reduce((state) => this._removeEntry(state, id));
  }
}
