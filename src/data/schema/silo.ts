import { Rational, rational } from '~/rational/rational';

export interface SiloJson {
  /** Number of rocket parts required */
  parts: number | string;
  /** Launch animation delay, in ticks */
  launch: number | string;
  /**
   * Whether a rocket can be internally buffered. This determines whether the
   * launch time is additive or treated as a minimum time per rocket.
   */
  buffered?: boolean;
}

export interface Silo {
  /** Number of rocket parts required */
  parts: Rational;
  /** Launch animation delay, in seconds */
  launch: Rational;
  /**
   * Whether a rocket can be internally buffered. This determines whether the
   * launch time is additive or treated as a minimum time per rocket.
   */
  buffered?: boolean;
}

export function parseSilo(json: SiloJson): Silo;
export function parseSilo(json: SiloJson | undefined): Silo | undefined;
export function parseSilo(json: SiloJson | undefined): Silo | undefined {
  if (json == null) return;
  return {
    parts: rational(json.parts),
    launch: rational(json.launch).div(rational(60n)),
    buffered: json.buffered,
  };
}
