import {
  DefaultIdPayload,
  DefaultPayload,
  Entities,
  IdPayload,
} from '~/models';

export class StoreUtility {
  static rankEquals<T extends number | string>(
    a: T[],
    b: T[] | undefined
  ): boolean {
    if (b == null) {
      return false;
    }
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }

  static arrayEquals<T extends number | string>(
    a: T[],
    b: T[] | undefined
  ): boolean {
    if (b == null) {
      return false;
    }
    return this.rankEquals([...a].sort(), [...b].sort());
  }

  static payloadEquals<T>(payload: DefaultIdPayload<T>, rank = false): boolean {
    return Array.isArray(payload.value) && Array.isArray(payload.def)
      ? rank
        ? this.rankEquals(
            payload.value as (number | string)[],
            payload.def as (number | string)[]
          )
        : this.arrayEquals(
            payload.value as (number | string)[],
            payload.def as (number | string)[]
          )
      : payload.value === payload.def;
  }

  /** Resets a passed fields of the state */
  static resetFields<T>(
    state: Entities<T>,
    fields: (keyof T)[],
    id?: string
  ): Entities<T> {
    // Spread into new state
    let newState = { ...state };
    for (const field of fields) {
      newState = this.resetField(newState, field, id);
    }
    return newState;
  }

  /** Resets a passed field of the state */
  static resetField<T>(
    state: Entities<T>,
    field: keyof T,
    id?: string
  ): Entities<T> {
    // Spread into new state
    const newState = { ...state };
    for (const i of Object.keys(newState).filter(
      (j) => (!id || id === j) && newState[j][field] !== undefined
    )) {
      if (Object.keys(newState[i]).length === 1) {
        delete newState[i];
      } else {
        // Spread into new state
        newState[i] = { ...newState[i] };
        delete newState[i][field];
      }
    }
    return newState;
  }

  static compareReset<T, P>(
    state: Entities<T>,
    field: keyof T,
    payload: DefaultIdPayload<P>,
    rank = false
  ): Entities<T> {
    // Spread into new state
    if (this.payloadEquals(payload, rank)) {
      // Resetting to null
      const newState = { ...state };
      if (newState[payload.id] !== undefined) {
        newState[payload.id] = { ...newState[payload.id] };
        if (newState[payload.id][field] !== undefined) {
          delete newState[payload.id][field];
        }
        if (Object.keys(newState[payload.id]).length === 0) {
          delete newState[payload.id];
        }
      }
      return newState;
    } else {
      // Setting field
      return this.assignValue(state, field, payload);
    }
  }

  static assignValue<T, P>(
    state: Entities<T>,
    field: keyof T,
    payload: IdPayload<P>
  ): Entities<T> {
    return {
      ...state,
      ...{
        [payload.id]: { ...state[payload.id], ...{ [field]: payload.value } },
      },
    };
  }

  static compareValue<T>(payload: DefaultPayload<T>): T | undefined {
    return payload.value === payload.def ? undefined : payload.value;
  }

  static compareValues(
    payload: DefaultPayload<string[]>
  ): string[] | undefined {
    return this.arrayEquals(payload.value, payload.def)
      ? undefined
      : payload.value;
  }

  static compareRank(
    value: string[],
    def: string[] | undefined
  ): string[] | undefined {
    return this.rankEquals(value, def) ? undefined : value;
  }
}
