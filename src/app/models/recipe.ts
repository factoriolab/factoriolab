export interface Recipe {
  id: string;
  time: number;
  in?: { [key: string]: number };
  out?: { [key: string]: number };
  producers?: string[];
}
