export enum CategoryId {
  Logistics = 'logistics',
  Production = 'production',
  Intermediate = 'intermediate',
  Combat = 'combat',
  Research = 'research',
}

export interface Category {
  id: CategoryId;
  name: string;
}
