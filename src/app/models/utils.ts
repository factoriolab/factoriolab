export type Entities<T = string> = Record<string, T>;

export type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

export type Optional<T> = T | undefined;

export type PickNonNullish<T, K extends keyof T> = {
  [P in K]-?: NonNullable<T[P]>;
};

export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };
