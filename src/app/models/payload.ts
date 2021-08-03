export interface IdPayload<T = string> {
  id: string;
  value: T;
}

export interface DefaultIdPayload<T = string, D = T> {
  id: string;
  value: T;
  def: D;
}

export interface DefaultPayload<T = string, D = T> {
  value: T;
  def: D;
}

export interface PreviousPayload<T = string> {
  value: T;
  prev: T;
}
