const FLOAT_PRECISION = 100000;

const bigZero = BigInt(0);
const bigOne = BigInt(1);
const bigMinusOne = BigInt(-1);

export class Rational {
  static zero = new Rational(bigZero);
  static minusOne = new Rational(bigMinusOne);
  static one = new Rational(bigOne);
  static two = new Rational(BigInt(2));
  static hundred = new Rational(BigInt(100));
  static thousand = new Rational(BigInt(1000));

  readonly p: bigint;
  readonly q: bigint;

  static gcd(x: bigint, y: bigint): bigint {
    x = Rational.abs(x);
    y = Rational.abs(y);
    while (y) {
      const t = y;
      y = x % y;
      x = t;
    }
    return x;
  }

  static abs(x: bigint): bigint {
    return x < bigZero ? x * bigMinusOne : x;
  }

  static from(p: number, q: number = 1): Rational {
    return new Rational(BigInt(p), BigInt(q));
  }

  static fromNumber(x: number): Rational {
    if (Number.isInteger(x)) {
      return new Rational(BigInt(x), bigOne);
    }

    return new Rational(
      BigInt(Math.round(x * FLOAT_PRECISION)),
      BigInt(FLOAT_PRECISION)
    );
  }

  static min(x: Rational, y: Rational): Rational {
    return x.lt(y) ? x : y;
  }

  static max(x: Rational, y: Rational): Rational {
    return x.gt(y) ? x : y;
  }

  isZero(): boolean {
    return this.p === bigZero;
  }

  isOne(): boolean {
    return this.p === bigOne && this.q === bigOne;
  }

  nonzero(): boolean {
    return this.p !== bigZero;
  }

  isInteger(): boolean {
    return this.q === bigOne;
  }

  inverse(): Rational {
    return this.mul(Rational.minusOne);
  }

  reciprocal(): Rational {
    return new Rational(this.q, this.p);
  }

  lt(x: Rational): boolean {
    if (this.q === x.q) {
      return this.p < x.p;
    }

    return this.p * x.q < x.p * this.q;
  }

  lte(x: Rational): boolean {
    return this.eq(x) || this.lt(x);
  }

  gt(x: Rational): boolean {
    return x.lt(this);
  }

  gte(x: Rational): boolean {
    return this.eq(x) || this.gt(x);
  }

  eq(x: Rational): boolean {
    return this.p === x.p && this.q === x.q;
  }

  add(x: Rational): Rational {
    return new Rational(this.p * x.q + this.q * x.p, this.q * x.q);
  }

  sub(x: Rational): Rational {
    if (x.isZero()) {
      return this;
    }
    return new Rational(this.p * x.q - this.q * x.p, this.q * x.q);
  }

  mul(x: Rational): Rational {
    if (this.isOne()) {
      return x;
    }
    if (x.isOne()) {
      return this;
    }
    if (this.isZero() || x.isZero()) {
      return Rational.zero;
    }
    return new Rational(this.p * x.p, this.q * x.q);
  }

  div(x: Rational): Rational {
    if (x.isOne()) {
      return this;
    }
    if (this.eq(x)) {
      return Rational.one;
    }
    return new Rational(this.p * x.q, this.q * x.p);
  }

  toNumber(): number {
    return Number(this.p) / Number(this.q);
  }

  toPrecision(x: number): number {
    const round = Math.pow(10, x);
    return Math.ceil(this.toNumber() * round) / round;
  }

  toFraction(): string {
    if (this.isInteger()) {
      return this.p.toString();
    }

    if (Rational.abs(this.p) > Rational.abs(this.q)) {
      const whole = this.p / this.q;
      const mod = this.p % this.q;
      return `${whole} + ${mod}/${this.q}`;
    }

    return `${this.p}/${this.q}`;
  }

  toDecimals(): number {
    if (this.isInteger()) {
      return 0;
    }
    return this.toNumber().toString().split('.')[1]?.length || 0;
  }

  constructor(p: bigint, q: bigint = bigOne) {
    if (q < bigZero) {
      p = -p;
      q = -q;
    }
    const gcd = Rational.gcd(Rational.abs(p), q);
    if (gcd > bigOne) {
      p = p / gcd;
      q = q / gcd;
    }
    this.p = p;
    this.q = q;
  }
}
