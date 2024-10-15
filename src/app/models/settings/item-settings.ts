export interface ItemState {
  beltId?: string;
  wagonId?: string;
}

export interface ItemSettings extends ItemState {
  defaultBeltId?: string;
  defaultWagonId?: string;
}
