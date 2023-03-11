import { SelectItem } from 'primeng/api';

import { GameInf } from '../game-info';

/** Column configuration key */
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

/** Column configuration */
export interface ColumnCfg {
  show: boolean;
  precision: number | null;
}

/** Column information, nonconfigurable */
export interface ColumnInf {
  hideDefault?: boolean;
  hasPrecision?: boolean;
}

/** Columns configuration */
export type ColumnsCfg = Record<ColumnKey, ColumnCfg>;

/** Columns information, nonconfigurable */
export type ColumnsInf = Record<ColumnKey, ColumnInf>;

/** Columns information data, nonconfigurable */
export const columnsInf: ColumnsInf = {
  checkbox: { hideDefault: true },
  tree: {},
  items: { hasPrecision: true },
  belts: { hasPrecision: true },
  wagons: { hasPrecision: true },
  machines: { hasPrecision: true },
  beacons: {},
  power: { hasPrecision: true },
  pollution: { hasPrecision: true },
  link: {},
};

const allColumns = Object.keys(columnsInf) as ColumnKey[];

/** Default precision for columns with precision */
const DEFAULT_PRECISION: number | null = 1;

/** Initial value to use for columns configuration */
export const initialColumnsCfg: ColumnsCfg = allColumns.reduce(
  (e: Partial<ColumnsCfg>, c) => {
    const inf = columnsInf[c];
    e[c] = {
      show: !inf.hideDefault,
      precision: inf.hasPrecision ? DEFAULT_PRECISION : null,
    };
    return e;
  },
  {}
) as ColumnsCfg;

/** Get column options for passed game */
export function columnOptions(gameInf: GameInf): SelectItem<ColumnKey>[] {
  return allColumns
    .filter((c) => gameInf.hideColumns.indexOf(c) === -1)
    .map(
      (id): SelectItem<ColumnKey> => ({
        label: `options.column.${id}`,
        value: id,
        disabled: id === 'items' || id === 'machines',
      })
    );
}

export function columnsGameCfg(
  columnsCfg: ColumnsCfg,
  gameInf: GameInf
): ColumnsCfg {
  gameInf.hideColumns.forEach((c) => {
    columnsCfg = {
      ...columnsCfg,
      ...{ [c]: { ...columnsCfg[c], ...{ show: false } } },
    };
  });

  return columnsCfg;
}
