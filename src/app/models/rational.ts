import { memoize } from './memoize';

const FLOAT_PRECISION = 100000;

export class Rational {
  static zero = new Rational(BigInt(0));
  static minusOne = new Rational(BigInt(-1));
  static one = new Rational(BigInt(1));
  static two = new Rational(BigInt(2));
  static hundred = new Rational(BigInt(100));
  static thousand = new Rational(BigInt(1000));

  p: bigint;
  q: bigint;

  @memoize()
  static gcd(x: bigint, y: bigint) {
    x = Rational.abs(x);
    y = Rational.abs(y);
    while (y) {
      const t = y;
      y = x % y;
      x = t;
    }
    return x;
  }

  @memoize()
  static abs(x: bigint) {
    return x < BigInt(0) ? x * BigInt(-1) : x;
  }

  @memoize()
  static fromNumber(x: number) {
    if (Number.isInteger(x)) {
      return new Rational(BigInt(x), BigInt(1));
    }

    return new Rational(
      BigInt(Math.round(x * FLOAT_PRECISION)),
      BigInt(FLOAT_PRECISION)
    );
  }

  static min(x: Rational, y: Rational) {
    return x.lt(y) ? x : y;
  }

  static max(x: Rational, y: Rational) {
    return x.gt(y) ? x : y;
  }

  isZero() {
    return this.p === BigInt(0);
  }

  nonzero() {
    return this.p !== BigInt(0);
  }

  inverse() {
    return this.mul(Rational.minusOne);
  }

  lt(x: Rational) {
    if (this.q === x.q) {
      return this.p < x.p;
    }

    return this.p * x.q < x.p * this.q;
  }

  lte(x: Rational) {
    return this.eq(x) || this.lt(x);
  }

  gt(x: Rational) {
    return x.lt(this);
  }

  gte(x: Rational) {
    return this.eq(x) || this.gt(x);
  }

  eq(x: Rational) {
    return this.p === x.p && this.q === x.q;
  }

  add(x: Rational) {
    return new Rational(this.p * x.q + this.q * x.p, this.q * x.q);
  }

  sub(x: Rational) {
    return new Rational(this.p * x.q - this.q * x.p, this.q * x.q);
  }

  mul(x: Rational) {
    return new Rational(this.p * x.p, this.q * x.q);
  }

  div(x: Rational) {
    return new Rational(this.p * x.q, this.q * x.p);
  }

  toNumber() {
    return Number(this.p) / Number(this.q);
  }

  toPrecision(x: number) {
    const round = Math.pow(10, x);
    return Math.ceil(this.toNumber() * round) / round;
  }

  toFraction() {
    if (this.q === BigInt(1)) {
      return this.p.toString();
    }

    if (Rational.abs(this.p) > Rational.abs(this.q)) {
      const whole = this.p / this.q;
      const mod = this.p % this.q;
      return `${whole} + ${mod}/${this.q}`;
    }

    return `${this.p}/${this.q}`;
  }

  constructor(p: bigint, q: bigint = BigInt(1)) {
    if (q < BigInt(0)) {
      p = -p;
      q = -q;
    }
    const gcd = Rational.gcd(Rational.abs(p), q);
    if (gcd > BigInt(1)) {
      p = p / gcd;
      q = q / gcd;
    }
    this.p = p;
    this.q = q;
  }
}
