import { BaseData } from './base-data';

export interface Link extends BaseData {
  source: string;
  target: string;
  value: number;
  // Bidirectional link between two nodes
  bidi?: boolean;
}
