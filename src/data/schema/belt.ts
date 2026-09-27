import { Rational, rational } from '~/rational/rational';

import { Quality } from './quality';

export const PIPE = 'pipe';

export interface BeltJson {
  itemTypes: string[];
  /** Items/s */
  speed: number | string;
  qualityRecord?: Record<string, Partial<BeltJson>>;
}

export interface Belt {
  itemTypes: Set<string>;
  /** Items/s */
  speed: Rational;
  quality?: Quality;
}

export function parseBelt(json: BeltJson, quality?: Quality): Belt;
export function parseBelt(
  json: BeltJson | undefined,
  quality?: Quality,
): Belt | undefined;
export function parseBelt(
  json: BeltJson | undefined,
  quality?: Quality,
): Belt | undefined {
  if (json == null) return;
  return {
    itemTypes: new Set(json.itemTypes),
    speed: rational(json.speed),
    quality,
  };
}
