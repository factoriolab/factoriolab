import { SelectItem } from 'primeng/api';

import { spread } from '~/helpers';

import { Flag } from '../flags';

export type ColumnKey =
  | 'checkbox'
  | 'tree'
  | 'items'
  | 'belts'
  | 'wagons'
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
  flag?: true;
}

export type ColumnsState = Record<ColumnKey, ColumnSettings>;

export type ColumnsInfo = Record<ColumnKey, ColumnInfo>;

export const columnsInfo: ColumnsInfo = {
  checkbox: { hideDefault: true },
  tree: {},
  items: { hasPrecision: true },
  belts: { hasPrecision: true },
  wagons: { hasPrecision: true, flag: true },
  machines: { hasPrecision: true },
  beacons: { flag: true },
  power: { hasPrecision: true, flag: true },
  pollution: { hasPrecision: true, flag: true },
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
export function columnOptions(flags: Set<Flag>): SelectItem<ColumnKey>[] {
  return allColumns
    .filter((c) => !columnsInfo[c].flag || flags.has(c as Flag))
    .map(
      (id): SelectItem<ColumnKey> => ({
        label: `options.column.${id}`,
        value: id,
        disabled: id === 'items' || id === 'machines',
      }),
    );
}

export function gameColumnsState(
  columnsState: ColumnsState,
  flags: Set<Flag>,
): ColumnsState {
  allColumns
    .filter((c) => columnsInfo[c].flag && !flags.has(c as Flag))
    .forEach((c) => {
      columnsState = spread(columnsState, {
        [c]: spread(columnsState[c], { show: false }),
      });
    });

  return columnsState;
}
