export enum ItemSettingsField {
  Ignore = 'ignore',
  Belt = 'belt',
  Wagon = 'wagon',
}

export interface ItemSettings {
  ignore?: boolean;
  belt?: string;
  wagon?: string;
}
