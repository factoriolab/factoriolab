import {
  Entities,
  IdIndexValueDefaultPayload,
  IdIndexValuePayload,
  IdValueDefaultPayload,
  IdValuePayload,
  ValueDefaultPayload,
} from '~/models';

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

  static arrayEquals<T extends number | string>(
    a: T[],
    b: T[] | undefined,
  ): boolean {
    if (b == null) {
      return false;
    }
    return this.rankEquals([...a].sort(), [...b].sort());
  }

  static payloadEquals<T>(
    payload: IdValueDefaultPayload<T>,
    rank = false,
  ): boolean {
    return Array.isArray(payload.value) && Array.isArray(payload.def)
      ? rank
        ? this.rankEquals(
            payload.value as (number | string)[],
            payload.def as (number | string)[],
          )
        : this.arrayEquals(
            payload.value as (number | string)[],
            payload.def as (number | string)[],
          )
      : payload.value === payload.def;
  }

  /** Resets a passed fields of the state */
  static resetFields<T extends object>(
    state: Entities<T>,
    fields: (keyof T)[],
    id?: string,
  ): Entities<T> {
    // Spread into new state
    let newState = { ...state };
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
    const newState = { ...state };
    for (const i of Object.keys(newState).filter(
      (j) => (!id || id === j) && newState[j][field] !== undefined,
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

  static compareReset<T extends object, K extends keyof T>(
    state: Entities<T>,
    field: K,
    payload: IdValueDefaultPayload<T[K]>,
    rank = false,
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

  static assignValue<T, K extends keyof T>(
    state: Entities<T>,
    field: K,
    payload: IdValuePayload<T[K]>,
  ): Entities<T> {
    return {
      ...state,
      ...{
        [payload.id]: { ...state[payload.id], ...{ [field]: payload.value } },
      },
    };
  }

  static compareValue<T>(payload: ValueDefaultPayload<T>): T | undefined {
    return payload.value === payload.def ? undefined : payload.value;
  }

  static compareValues(
    payload: ValueDefaultPayload<string[]>,
  ): string[] | undefined {
    return this.arrayEquals(payload.value, payload.def)
      ? undefined
      : payload.value;
  }

  static compareRank(
    value: string[],
    def: string[] | undefined,
  ): string[] | undefined {
    return this.rankEquals(value, def) ? undefined : value;
  }

  /** Resets a passed field of the state */
  static resetFieldIndex<
    T extends { [key in K]?: U[] },
    U extends object,
    V extends Exclude<T[K], undefined>[number],
    K extends keyof T,
    L extends keyof V,
  >(
    state: Entities<T>,
    field: K,
    subfield: L,
    index: number,
    id?: string,
  ): Entities<T> {
    // Spread into new state
    const newState = { ...state };
    for (const i of Object.keys(newState).filter(
      (j) => (!id || id === j) && newState[j][field] != null,
    )) {
      const arr = newState[i][field];
      if (arr != null) {
        const newArr = arr.map((a) => ({ ...a }));

        // Reset the specific subfield
        delete (newArr[index] as unknown as V)[subfield];

        if (newArr.length === 1 && Object.keys(newArr[index]).length === 0) {
          // Delete this field from the entity
          delete newState[i][field];
        } else {
          // Set this field on the entitiy
          newState[i][field] = newArr as unknown as T[K];
        }
      }

      // Check whether whole entity has keys
      if (Object.keys(newState[i]).length === 0) {
        // Delete the whole entity
        delete newState[i];
      }
    }
    return newState;
  }

  static compareResetIndex<
    T extends { [key in K]?: U[] },
    U extends object,
    V extends Exclude<T[K], undefined>[number],
    K extends keyof T,
    L extends keyof V,
  >(
    state: Entities<T>,
    field: K,
    subfield: L,
    payload: IdIndexValueDefaultPayload<V[L]>,
    rank = false,
  ): Entities<T> {
    if (this.payloadEquals(payload, rank)) {
      // Resetting to null, spread into new state
      const newState = { ...state };
      if (newState[payload.id] !== undefined) {
        newState[payload.id] = { ...newState[payload.id] };
        const arr = newState[payload.id][field];
        if (arr != null) {
          const newArr = arr.map((a) => ({ ...a }));

          // Reset the specific subfield
          delete (newArr[payload.index] as unknown as V)[subfield];

          if (
            newArr.length === 1 &&
            Object.keys(newArr[payload.index]).length === 0
          ) {
            // Delete this field from the entity
            delete newState[payload.id][field];
          } else {
            // Set this field on the entity
            newState[payload.id][field] = newArr as unknown as T[K];
          }
        }

        // Check whether whole entity has keys
        if (Object.keys(newState[payload.id]).length === 0) {
          // Delete the whole entity
          delete newState[payload.id];
        }
      }
      return newState;
    } else {
      // Setting field
      return this.assignIndexValue(state, field, subfield, payload);
    }
  }

  static assignIndexValue<
    T extends { [key in K]?: U[] },
    U extends object,
    V extends Exclude<T[K], undefined>[number],
    K extends keyof T,
    L extends keyof V,
  >(
    state: Entities<T>,
    field: K,
    subfield: L,
    payload: IdIndexValuePayload<V[L]>,
  ): Entities<T> {
    return {
      ...state,
      ...{
        [payload.id]: {
          ...state[payload.id],
          ...{
            [field]: (
              state[payload.id]?.[field] ??
              // Generate default empty object array
              new Array(payload.index + 1).fill({})
            ).map((v, i) => {
              if (i === payload.index) {
                return { ...v, ...{ [subfield]: payload.value } };
              } else {
                return v;
              }
            }),
          },
        },
      },
    };
  }
}
