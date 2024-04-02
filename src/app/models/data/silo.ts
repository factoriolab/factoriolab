import { Rational } from '../rational';

const secs = Rational.from(60);

export interface SiloJson {
  /** Number of rocket parts required */
  parts: number | string;
  /** Launch animation delay, in ticks */
  launch: number | string;
}

export interface Silo {
  /** Number of rocket parts required */
  parts: Rational;
  /** Launch animation delay, in seconds */
  launch: Rational;
}

export function parseSilo(json: SiloJson): Silo;
export function parseSilo(json: SiloJson | undefined): Silo | undefined;
export function parseSilo(json: SiloJson | undefined): Silo | undefined {
  if (json == null) return;
  return {
    parts: Rational.from(json.parts),
    launch: Rational.from(json.launch).div(secs),
  };
}
