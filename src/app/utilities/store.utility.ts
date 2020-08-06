import {
  DefaultPayload,
  DefaultTogglePayload,
  DefaultIdPayload,
} from '~/models';

export class StoreUtility {
  static rankEquals<T extends number | string>(a: T[], b: T[]) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }

  static arrayEquals<T extends number | string>(a: T[], b: T[]) {
    return this.rankEquals([...a].sort(), [...b].sort());
  }

  static payloadEquals<T>(payload: DefaultIdPayload<T>) {
    return Array.isArray(payload.value) && Array.isArray(payload.default)
      ? this.arrayEquals(payload.value, payload.default)
      : payload.value === payload.default;
  }

  /** Resets a passed field of the recipe state */
  static resetField<T>(state: T, field: string): T {
    // Spread into new state
    const newState = { ...state };
    for (const id of Object.keys(newState).filter(
      (i) => newState[i][field] != null
    )) {
      if (Object.keys(newState[id]).length === 1) {
        delete newState[id];
      } else {
        // Spread into new recipe settings state
        newState[id] = { ...newState[id] };
        delete newState[id][field];
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
    const newState = { ...state };
    if (this.payloadEquals(payload)) {
      // Resetting to null
      if (newState[payload.id] != null) {
        newState[payload.id] = { ...newState[payload.id] };
        if (newState[payload.id][field] != null) {
          delete newState[payload.id][field];
        }
        if (Object.keys(newState[payload.id]).length === 0) {
          delete newState[payload.id];
        }
      }
    } else {
      // Setting field
      newState[payload.id] = {
        ...newState[payload.id],
        ...{ [field]: payload.value },
      };
    }
    return newState;
  }

  static compareValue(payload: DefaultPayload) {
    return payload.value === payload.default ? null : payload.value;
  }

  static tryAddId(state: string[], payload: DefaultTogglePayload) {
    if (state == null) {
      return [...payload.default, payload.id];
    }
    const result = [...state, payload.id];
    const equal = this.arrayEquals(result, payload.default);
    return equal ? null : result;
  }

  static tryRemoveId(state: string[], payload: DefaultTogglePayload) {
    if (state == null) {
      return payload.default.filter((i) => i !== payload.id);
    }
    const result = state.filter((i) => i !== payload.id);
    const equal = this.arrayEquals(result, payload.default);
    return equal ? null : result;
  }
}
