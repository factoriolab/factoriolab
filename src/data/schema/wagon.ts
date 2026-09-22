import { Rational, rational } from '~/rational/rational';
import { coalesce } from '~/utils/nullish';

export interface WagonJson {
  itemTypes: string[];
  capacity: number | string;
  /** Default: items */
  capacityType?: 'items' | 'stacks';
}

export interface Wagon {
  itemTypes: Set<string>;
  capacity: Rational;
  capacityType: 'items' | 'stacks';
}

export function parseWagon(json: WagonJson): Wagon;
export function parseWagon(json: WagonJson | undefined): Wagon | undefined;
export function parseWagon(json: WagonJson | undefined): Wagon | undefined {
  if (json == null) return;
  return {
    itemTypes: new Set(json.itemTypes),
    capacity: rational(json.capacity),
    capacityType: coalesce(json.capacityType, 'items'),
  };
}
