export enum ItemSettingsField {
  Ignore = 'ignore',
  Belt = 'belt',
}

export interface ItemSettings {
  ignore?: boolean;
  belt?: string;
}
