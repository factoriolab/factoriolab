export type TableRows = 25 | 50 | 100 | 1000;

export interface TableState {
  filter?: string;
  sort?: string;
  asc: boolean;
  page: number;
  rows: TableRows;
}

export const initialTableState: TableState = {
  asc: false,
  page: 0,
  rows: 100,
};
