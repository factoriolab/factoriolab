export interface IdPayload<T = string> {
  id: string;
  value: T;
}

export interface IdIndexPayload<T = string> {
  id: string;
  index: number;
  value: T;
}

export interface IdIndexDefaultPayload<T = string> {
  id: string;
  index: number;
  value: T;
  def: T | undefined;
}

export interface IdDefaultPayload<T = string> {
  id: string;
  value: T;
  def: T | undefined;
}

export interface DefaultPayload<T = string> {
  value: T;
  def: T | undefined;
}

export interface PreviousPayload<T = string> {
  value: T;
  prev: T;
}
