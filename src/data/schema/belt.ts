import { Rational, rational } from '~/rational/rational';

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
}

export function parseBelt(json: BeltJson): Belt;
export function parseBelt(json: BeltJson | undefined): Belt | undefined;
export function parseBelt(json: BeltJson | undefined): Belt | undefined {
  if (json == null) return;
  return {
    itemTypes: new Set(json.itemTypes),
    speed: rational(json.speed),
  };
}
