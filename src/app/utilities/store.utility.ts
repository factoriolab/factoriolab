import { DefaultPayload, DefaultIdPayload, IdPayload } from '~/models';

export class StoreUtility {
  static rankEquals<T extends number | string>(a: T[], b: T[]) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }

  static arrayEquals<T extends number | string>(a: T[], b: T[]) {
    return this.rankEquals([...a].sort(), [...b].sort());
  }

  static payloadEquals<T>(payload: DefaultIdPayload<T>) {
    return Array.isArray(payload.value) && Array.isArray(payload.default)
      ? this.arrayEquals(
          payload.value as (number | string)[],
          payload.default as (number | string)[]
        )
      : payload.value === payload.default;
  }

  /** Resets a passed fields of the state */
  static resetFields<T>(state: T, fields: string[], id: string = null) {
    // Spread into new state
    let newState = { ...state };
    for (const field of fields) {
      newState = this.resetField(newState, field, id);
    }
    return newState;
  }

  /** Resets a passed field of the state */
  static resetField<T>(state: T, field: string, id: string = null): T {
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
    state: T,
    field: string,
    payload: DefaultIdPayload<P>
  ): T {
    // Spread into new state
    if (this.payloadEquals(payload)) {
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

  static assignValue<T, P>(state: T, field: string, payload: IdPayload<P>) {
    return {
      ...state,
      ...{
        [payload.id]: { ...state[payload.id], ...{ [field]: payload.value } },
      },
    };
  }

  static compareValue<T>(payload: DefaultPayload<T>) {
    return payload.value === payload.default ? null : payload.value;
  }

  static compareValues(payload: DefaultPayload<string[]>) {
    return this.arrayEquals(payload.value, payload.default)
      ? null
      : payload.value;
  }

  static compareRank(payload: DefaultPayload<string[]>) {
    return this.rankEquals(payload.value, payload.default)
      ? null
      : payload.value;
  }
}
