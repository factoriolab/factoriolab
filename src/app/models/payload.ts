export interface IdPayload<T = string> {
  id: string;
  value: T;
}

export interface DefaultIdPayload<T = string> {
  id: string;
  value: T;
  default: T;
}

export interface DefaultPayload<T = string> {
  value: T;
  default: T;
}

export interface DefaultTogglePayload {
  id: string;
  default: string[];
}
