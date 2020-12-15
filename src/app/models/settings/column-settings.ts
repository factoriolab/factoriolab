export enum ColumnSettingsField {
  Ignore = 'ignore',
  Precision = 'precision',
}

export interface ColumnSettings {
  ignore?: boolean;
  precision?: number;
}

export const DefaultColumnSettings: ColumnSettings = {
  ignore: false,
  precision: 1,
};
