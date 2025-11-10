export interface TableState {
  filter?: string;
  sort?: string;
  asc: boolean;
  page: number;
  rows: number;
}

export const initialTableState: TableState = {
  asc: false,
  page: 0,
  rows: 100,
};
