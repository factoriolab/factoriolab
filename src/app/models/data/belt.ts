import { Rational, rational } from '../rational';

export interface BeltJson {
  speed: number | string;
}

export interface Belt {
  speed: Rational;
}

export function parseBelt(json: BeltJson): Belt;
export function parseBelt(json: BeltJson | undefined): Belt | undefined;
export function parseBelt(json: BeltJson | undefined): Belt | undefined {
  if (json == null) return;
  return {
    speed: rational(json.speed),
  };
}
