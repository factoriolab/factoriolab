export interface IMap<T extends { id: number }, U> extends IndexedMap<T, U> {}

export function createMap<T extends { id: number }, U>(): IMap<T, U> {
  return new IndexedMap<T, U>();
}

class IndexedMap<T extends { id: number }, U> {
  public index = {} as { [id: number]: number | undefined };
  public array = [] as Array<Pair<T, U>>;

  /** Returns the number of items in the array. */
  public size(): number {
    return this.array.length;
  }

  /** Returns true if the array is empty. */
  public empty(): boolean {
    return this.array.length === 0;
  }

  /** Returns the item at the given array index. */
  public itemAt(index: number): Pair<T, U> {
    return this.array[index];
  }

  /**
   * Returns true if the key is in the array, false otherwise.
   *
   * @param key The key to locate in the array.
   */
  public contains(key: T) {
    return this.index[key.id] !== undefined;
  }

  /**
   * Returns the pair associated with the given key, or undefined.
   *
   * @param key The key to locate in the array.
   */
  public find(key: T) {
    const i = this.index[key.id];
    return i === undefined ? undefined : this.array[i];
  }

  /**
   * Returns the pair associated with the key if it exists.
   *
   * If the key does not exist, a new pair will be created and
   * inserted using the value created by the given factory.
   *
   * @param key The key to locate in the array.
   * @param factory The function which creates the default value.
   */
  public setDefault(key: T, factory: () => U): Pair<T, U> {
    const i = this.index[key.id];
    if (i === undefined) {
      const pair = new Pair(key, factory());
      this.index[key.id] = this.array.length;
      this.array.push(pair);
      return pair;
    } else {
      return this.array[i];
    }
  }

  /**
   * Insert the pair into the array and return the pair.
   *
   * This will overwrite any existing entry in the array.
   *
   * @param key The key portion of the pair.
   * @param value The value portion of the pair.
   */
  public insert(key: T, value: U): Pair<T, U> {
    const pair = new Pair(key, value);
    const i = this.index[key.id];
    if (i === undefined) {
      this.index[key.id] = this.array.length;
      this.array.push(pair);
    } else {
      this.array[i] = pair;
    }
    return pair;
  }

  /**
   * Removes and returns the pair for the given key, or undefined.
   *
   * @param key The key to remove from the map.
   */
  public erase(key: T): Pair<T, U> {
    const i = this.index[key.id];
    if (i === undefined) {
      return undefined;
    }
    this.index[key.id] = undefined;
    const pair = this.array[i];
    const last = this.array.pop();
    if (pair !== last) {
      this.array[i] = last;
      this.index[last.first.id] = i;
    }
    return pair;
  }

  /** Create a copy of this associative array. */
  public copy(): IndexedMap<T, U> {
    const copy = new IndexedMap<T, U>();
    for (let i = 0; i < this.array.length; i++) {
      const pair = this.array[i].copy();
      copy.array[i] = pair;
      copy.index[pair.first.id] = i;
    }
    return copy;
  }
}

/** A class which defines a generic pair object. */
class Pair<T, U> {
  /**
   * @param first The first item of the pair.
   * @param second The second item of the pair.
   */
  constructor(public first: T, public second: U) {}

  /** Create a copy of the pair. */
  public copy() {
    return new Pair(this.first, this.second);
  }
}
