export enum ItemSettingsField {
  Ignore = 'ignore',
  Belt = 'belt',
  Wagon = 'wagon',
  Recipe = 'recipe',
}

export interface ItemSettings {
  ignore?: boolean;
  belt?: string;
  wagon?: string;
  recipe?: string;
}
