import { Rational } from '../rational';

const secs = Rational.from(60);

export interface Silo {
  /** Number of rocket parts required */
  parts: number;
  /** Launch animation delay, in ticks */
  launch: number;
}

export class SiloRational {
  /** Number of rocket parts required */
  parts: Rational;
  /** Launch animation delay, in seconds */
  launch: Rational;

  constructor(obj: Silo) {
    this.parts = Rational.fromNumber(obj.parts);
    this.launch = Rational.fromNumber(obj.launch).div(secs);
  }
}
