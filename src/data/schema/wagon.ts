import { Rational, rational } from '~/rational/rational';
import { coalesce } from '~/utils/nullish';

import { Quality } from './quality';

export interface WagonJson {
  itemTypes: string[];
  capacity: number | string;
  qualityRecord?: Record<string, Partial<WagonJson>>;
  /** Default: items */
  capacityType?: 'items' | 'stacks';
}

export interface Wagon {
  itemTypes: Set<string>;
  capacity: Rational;
  capacityType: 'items' | 'stacks';
  quality?: Quality;
}

export function parseWagon(json: WagonJson, quality?: Quality): Wagon;
export function parseWagon(
  json: WagonJson | undefined,
  quality?: Quality,
): Wagon | undefined;
export function parseWagon(
  json: WagonJson | undefined,
  quality?: Quality,
): Wagon | undefined {
  if (json == null) return;
  return {
    itemTypes: new Set(json.itemTypes),
    capacity: rational(json.capacity),
    capacityType: coalesce(json.capacityType, 'items'),
    quality: quality,
  };
}
