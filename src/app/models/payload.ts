export interface IdPayload<T = string> {
  id: string;
  value: T;
}

export interface DefaultIdPayload<T = string, D = T> {
  id: string;
  value: T;
  default: D;
}

export interface DefaultPayload<T = string, D = T> {
  value: T;
  default: D;
}
