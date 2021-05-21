import { Rational } from '../rational';

const secs = Rational.from(60);

export interface Silo {
  /** Fixed silo recipe */
  recipe: string;
  /** Number of rocket parts required */
  parts: number;
  /** Launch animation delay, in ticks */
  launch: number;
}

export class RationalSilo {
  /** Fixed silo recipe */
  recipe: string;
  /** Number of rocket parts required */
  parts: Rational;
  /** Launch animation delay, in seconds */
  launch: Rational;

  constructor(data: Silo) {
    this.recipe = data.recipe;
    this.parts = Rational.fromNumber(data.parts);
    this.launch = Rational.fromNumber(data.launch).div(secs);
  }
}
