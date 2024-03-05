interface KeyPayload<T> {
  key: T;
}

interface IdPayload {
  id: string;
}

interface IndexPayload {
  index: number;
}

interface ValuePayload<T = string> {
  value: T;
}

interface DefaultPayload<T = string> {
  def: T | undefined;
}

interface PreviousPayload<T = string> {
  prev: T;
}

export type IdValuePayload<T = string> = IdPayload & ValuePayload<T>;
export type IdIndexValuePayload<T = string> = IdValuePayload<T> & IndexPayload;
export type IdIndexValueDefaultPayload<
  T = string,
  D = T,
> = IdIndexValuePayload<T> & DefaultPayload<D>;
export type IdValueDefaultPayload<T = string, D = T> = IdValuePayload<T> &
  DefaultPayload<D>;
export type ValueDefaultPayload<T = string, D = T> = ValuePayload<T> &
  DefaultPayload<D>;
export type ValuePreviousPayload<T = string> = ValuePayload<T> &
  PreviousPayload<T>;
export type KeyIdPayload<K> = KeyPayload<K> & IdPayload;
export type KeyIdValuePayload<K, T = string> = KeyPayload<K> &
  IdValuePayload<T>;
