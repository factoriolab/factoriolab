import { Option } from '~/option/option';
import { spread } from '~/utils/object';

import { Dataset } from '../settings/dataset';

export type ColumnKey =
  | 'checkbox'
  | 'tree'
  | 'items'
  | 'belts'
  | 'wagons'
  | 'rockets'
  | 'machines'
  | 'beacons'
  | 'power'
  | 'pollution'
  | 'link';

export interface ColumnSettings {
  show: boolean;
  precision: number | null;
}

export interface ColumnInfo {
  hideDefault?: true;
  hasPrecision?: true;
  exclude?: (data: Dataset) => boolean;
}

export type ColumnsState = Record<ColumnKey, ColumnSettings>;

export type ColumnsInfo = Record<ColumnKey, ColumnInfo>;

export const columnsInfo: ColumnsInfo = {
  checkbox: { hideDefault: true },
  tree: {},
  items: { hasPrecision: true },
  belts: { hasPrecision: true, exclude: (data) => data.beltIds.length === 0 },
  wagons: {
    hasPrecision: true,
    exclude: (data) =>
      data.cargoWagonIds.length + data.fluidWagonIds.length === 0,
  },
  rockets: {
    hasPrecision: true,
    hideDefault: true,
    exclude: (data) => !data.flags.has('rockets'),
  },
  machines: { hasPrecision: true },
  beacons: { exclude: (data) => data.beaconIds.length === 0 },
  power: { hasPrecision: true, exclude: (data) => !data.flags.has('power') },
  pollution: {
    hasPrecision: true,
    exclude: (data) => !data.flags.has('pollution'),
  },
  link: {},
};

const allColumns = Object.keys(columnsInfo) as ColumnKey[];

/** Default precision for columns with precision */
const DEFAULT_PRECISION: number | null = 1;

/** Initial value to use for columns configuration */
export const initialColumnsState: ColumnsState = allColumns.reduce(
  (e: Partial<ColumnsState>, c) => {
    const inf = columnsInfo[c];
    e[c] = {
      show: !inf.hideDefault,
      precision: inf.hasPrecision ? DEFAULT_PRECISION : null,
    };
    return e;
  },
  {},
) as ColumnsState;

/** Get column options for passed game */
export function columnOptions(data: Dataset): Option<ColumnKey>[] {
  return allColumns
    .filter((c) => !columnsInfo[c].exclude?.(data))
    .map(
      (id): Option<ColumnKey> => ({
        label: `options.column.${id}`,
        value: id,
        disabled: id === 'items' || id === 'machines',
      }),
    );
}

export function gameColumnsState(
  columnsState: ColumnsState,
  data: Dataset,
): ColumnsState {
  // Apply all defaults
  columnsState = spread(initialColumnsState, columnsState);

  // Delete any keys that are not valid
  const oldKeys = Object.keys(columnsState) as ColumnKey[];
  oldKeys
    .filter((c) => !initialColumnsState[c])
    .forEach((c) => delete columnsState[c]);

  // Hide any columns that are not relevant to the current game
  allColumns
    .filter((c) => columnsInfo[c].exclude?.(data))
    .forEach((c) => {
      columnsState = spread(columnsState, {
        [c]: spread(columnsState[c], { show: false }),
      });
    });

  return columnsState;
}

export function copyColumnsState(value: ColumnsState): ColumnsState {
  const keys = Object.keys(value) as ColumnKey[];
  return keys.reduce((s, c) => {
    s[c] = spread(value[c]);
    return s;
  }, {} as ColumnsState);
}
