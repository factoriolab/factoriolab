export interface PageData {
  filter?: string;
  sort?: 'name' | 'category';
  dir?: 1 | -1;
  page?: number;
  rows: number;
}
