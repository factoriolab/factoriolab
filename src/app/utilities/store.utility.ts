import { spread } from '~/helpers';
import { Entities, Rational } from '~/models';

export class StoreUtility {
  static rankEquals<T extends number | string>(
    a: T[],
    b: T[] | undefined,
  ): boolean {
    if (b == null) {
      return false;
    }
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }

  static valueEquals<T>(value: T, def: T | undefined): boolean {
    if (value instanceof Rational && def instanceof Rational)
      return value.eq(def);

    return value === def;
  }

  /** Resets a passed fields of the state */
  static resetFields<T extends object>(
    state: Entities<T>,
    fields: (keyof T)[],
    id?: string,
  ): Entities<T> {
    // Spread into new state
    let newState = spread(state);
    for (const field of fields) {
      newState = this.resetField(newState, field, id);
    }
    return newState;
  }

  /** Resets a passed field of the state */
  static resetField<T extends object>(
    state: Entities<T>,
    field: keyof T,
    id?: string,
  ): Entities<T> {
    // Spread into new state
    const newState = spread(state);
    for (const i of Object.keys(newState).filter(
      (j) => (!id || id === j) && newState[j][field] !== undefined,
    )) {
      if (Object.keys(newState[i]).length === 1) {
        delete newState[i];
      } else {
        // Spread into new state
        newState[i] = spread(newState[i]);
        delete newState[i][field];
      }
    }
    return newState;
  }

  static assignValue<T, K extends keyof T>(
    state: Entities<T>,
    field: K,
    id: string,
    value: T[K],
  ): Entities<T> {
    const entity: Partial<T> = {};
    entity[field] = value;
    return spread(state, { [id]: spread(state[id], entity) });
  }

  static compareReset<T extends object, K extends keyof T>(
    state: Entities<T>,
    field: K,
    id: string,
    value: T[K],
    def: T[K] | undefined,
  ): Entities<T> {
    // Spread into new state
    if (this.valueEquals(value, def)) {
      // Resetting to null
      const newState = spread(state);
      if (newState[id] !== undefined) {
        newState[id] = spread(newState[id]);
        if (newState[id][field] !== undefined) {
          delete newState[id][field];
        }
        if (Object.keys(newState[id]).length === 0) {
          delete newState[id];
        }
      }
      return newState;
    } else {
      // Setting field
      return this.assignValue(state, field, id, value);
    }
  }

  static setValue<T extends object, K extends keyof T>(
    state: Entities<T>,
    field: K,
    id: string,
    value: T[K],
  ): Entities<T> {
    if (value === undefined) {
      state = spread(state);
      if (state[id] !== undefined) {
        state[id] = spread(state[id]);
        if (state[id][field] !== undefined) delete state[id][field];
        if (Object.keys(state[id]).length === 0) delete state[id];
      }

      return state;
    }

    const p = { [field]: value } as Partial<T>;
    return spread(state, { [id]: spread(state[id], p) });
  }

  static compareValue<T>(value: T, def: T | undefined): T | undefined {
    return value === def ? undefined : value;
  }

  static compareSet<T>(value: Set<T>, def: Set<T>): Set<T> | undefined {
    if (value.size !== def.size) return value;
    return Array.from(value).every((v) => def.has(v)) ? undefined : value;
  }

  static compareRank(
    value: string[],
    def: string[] | undefined,
  ): string[] | undefined {
    return this.rankEquals(value, def) ? undefined : value;
  }

  static removeEntry<T>(entities: Entities<T>, id: string): Entities<T> {
    entities = spread(entities);
    delete entities[id];
    return entities;
  }
}
