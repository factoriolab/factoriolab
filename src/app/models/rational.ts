import * as formula from '@sideway/formula';

const MAX_DENOM = 10000000;
const DIVIDE_BY_ZERO = 'Cannot divide by zero';
const FLOAT_TOLERANCE = 1e-10;

export class Rational {
  static _gcdCache = new Map<bigint, Map<bigint, bigint>>();
  static zero = new Rational(0n);
  static minusOne = new Rational(-1n);
  static one = new Rational(1n);
  static two = new Rational(2n);
  static ten = new Rational(10n);
  static sixty = new Rational(60n);
  static hundred = new Rational(100n);
  static thousand = new Rational(1000n);
  static million = new Rational(1000000n);

  readonly p: bigint;
  readonly q: bigint;

  /** Internal, assumes x & y are non-negative */
  static _gcd(x: bigint, y: bigint): bigint {
    let t: bigint;
    while (y) {
      t = y;
      y = x % y;
      x = t;
    }

    return x;
  }

  static gcd(x: bigint, y: bigint): bigint {
    x = Rational.abs(x);
    y = Rational.abs(y);

    /** Ensure x >= y */
    if (y > x) {
      const t = y;
      y = x;
      x = t;
    }

    let cacheX = this._gcdCache.get(x);
    const cacheResult = cacheX?.get(y);
    if (cacheResult != null) return cacheResult;

    const result = this._gcd(x, y);

    if (cacheX == null) {
      cacheX = new Map();
      this._gcdCache.set(x, cacheX);
    }

    cacheX.set(y, result);
    return result;
  }

  static abs(x: bigint): bigint {
    return x < 0n ? x * -1n : x;
  }

  static from(x: number | string): Rational;
  static from(x: number | string | undefined): Rational | undefined;
  static from(p: number, q: number): Rational;
  static from(
    p: number | string | undefined,
    q?: number,
  ): Rational | undefined {
    if (p == null) return p;

    if (q != null) {
      if (q === 0) throw Error(DIVIDE_BY_ZERO);
      // Parse Rational from array (num/denom pair)
      return new Rational(BigInt(p), BigInt(q));
    }

    // Parse Rational from number
    if (typeof p === 'number') return this.fromNumber(p);

    // Parse Rational from string
    return this.fromString(p);
  }

  static fromNumber(x: number): Rational {
    if (Number.isInteger(x)) return new Rational(BigInt(x));

    if (Math.abs(x) < FLOAT_TOLERANCE) return Rational.zero;

    return this.fromFloat(x);
  }

  private static fromStringCache = new Map<string, Rational>();
  static fromString(x: string): Rational {
    const cached = this.fromStringCache.get(x);
    if (cached) return cached;

    if (x.length === 0) throw new Error('Empty string');

    let result: Rational;

    if (x.startsWith('=')) {
      // Full math support for equations
      const value = new formula.Parser(x.substring(1)).evaluate();
      result = Rational.from(value);
    } else if (x.indexOf('/') === -1) {
      result = Rational.fromNumber(Number(x));
    } else {
      const f = x.split('/');
      if (f.length > 2) throw new Error('Too many /');

      if (f[0].indexOf(' ') === -1) {
        const p = Number(f[0]);
        const q = Number(f[1]);
        result = Rational.from(p, q);
      } else {
        const g = f[0].split(' ');
        if (g.length > 2) throw new Error('Too many spaces');

        const n = Number(g[0]);
        const p = Number(g[1]);
        const q = Number(f[1]);
        result = Rational.from(n).add(Rational.from(p, q));
      }
    }

    this.fromStringCache.set(x, result);
    return result;
  }

  private static fromFloatCache: Record<number, Rational> = {};
  /**
   * Source: https://www.ics.uci.edu/%7Eeppstein/numth/frap.c
   */
  private static fromFloat(startx: number): Rational {
    if (this.fromFloatCache[startx]) return this.fromFloatCache[startx];

    let ai = startx,
      x = startx;

    /** initialize matrix */
    const m = [
      [1, 0],
      [0, 1],
    ];

    /** loop finding terms until denom gets too big */
    while (m[1][0] * (ai = Math.floor(x)) + m[1][1] <= MAX_DENOM) {
      let t = m[0][0] * ai + m[0][1];
      m[0][1] = m[0][0];
      m[0][0] = t;
      t = m[1][0] * ai + m[1][1];
      m[1][1] = m[1][0];
      m[1][0] = t;
      if (x === ai) break; // AF: division by zero
      x = 1 / (x - ai);
    }

    const optA = Rational.from(m[0][0], m[1][0]);
    const errA = Math.abs(startx - optA.toNumber());

    ai = Math.floor((MAX_DENOM - m[1][1]) / m[1][0]);
    m[0][0] = m[0][0] * ai + m[0][1];
    m[1][0] = m[1][0] * ai + m[1][1];

    const optB = Rational.from(m[0][0], m[1][0]);
    const errB = Math.abs(startx - optB.toNumber());

    const result = errA < errB ? optA : optB;
    this.fromFloatCache[startx] = result;
    return result;
  }

  static min(x: Rational, y: Rational): Rational {
    return x.lt(y) ? x : y;
  }

  static max(x: Rational, y: Rational): Rational {
    return x.gt(y) ? x : y;
  }

  isZero(): boolean {
    return this.p === 0n;
  }

  isOne(): boolean {
    return this.p === 1n && this.q === 1n;
  }

  nonzero(): boolean {
    return this.p !== 0n;
  }

  isInteger(): boolean {
    return this.q === 1n;
  }

  inverse(): Rational {
    return this.mul(Rational.minusOne);
  }

  reciprocal(): Rational {
    return new Rational(this.q, this.p);
  }

  lt(x: Rational): boolean {
    if (this.q === x.q) return this.p < x.p;

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
    if (x.isZero()) return this;

    return new Rational(this.p * x.q + this.q * x.p, this.q * x.q);
  }

  sub(x: Rational): Rational {
    if (x.isZero()) return this;

    return new Rational(this.p * x.q - this.q * x.p, this.q * x.q);
  }

  mul(x: Rational): Rational {
    if (this.isOne()) return x;
    if (x.isOne()) return this;
    if (this.isZero() || x.isZero()) return Rational.zero;

    return new Rational(this.p * x.p, this.q * x.q);
  }

  div(x: Rational): Rational {
    if (x.isOne() || this.isZero()) return this;
    if (this.eq(x)) return Rational.one;

    return new Rational(this.p * x.q, this.q * x.p);
  }

  ceil(): Rational {
    if (this.isInteger()) return this;

    // Calculate ceiling using absolute value
    const num = new Rational(Rational.abs(this.p) / this.q + 1n);
    if (this.p < 0n) {
      // Inverse back to negative if necessary
      return num.inverse();
    }

    return num;
  }

  floor(): Rational {
    if (this.isInteger()) return this;
    return new Rational(this.p / this.q);
  }

  abs(): Rational {
    return new Rational(Rational.abs(this.p), this.q);
  }

  toNumber(): number {
    return Number(this.p) / Number(this.q);
  }

  toPrecision(x: number): number {
    const round = Rational.from(Math.pow(10, x));
    return this.mul(round).ceil().div(round).toNumber();
  }

  toFraction(mixed = true): string {
    if (this.isInteger()) return this.p.toString();

    if (mixed && Rational.abs(this.p) > Rational.abs(this.q)) {
      const whole = this.p / this.q;
      const mod = this.p % this.q;
      return `${whole} + ${mod}/${this.q}`;
    }

    return `${this.p}/${this.q}`;
  }

  /**
   * Converts rational to string
   * * Default: Use decimals if 2 or less, use num/den otherwise
   * * Custom:
   *   * Specify null to use mixed fraction
   *   * Specify number to specify number of decimals
   */
  toString(precision?: number | null): string {
    if (precision) return this.toPrecision(precision).toString();

    if (precision === null || this.toDecimals() > 2)
      return this.toFraction(precision !== undefined);

    return this.toNumber().toString();
  }

  toDecimals(): number {
    const num = this.toNumber();
    if (num % 1 !== 0) {
      // Pick apart complex numbers, looking for decimal and negative exponent
      // 3.33e-6 => ["3.33e-6", ".33", "33", "e-6", "6"]
      const match = num.toString().match(/\d+(\.(\d+))?(e-(\d+))?/);
      let decimals = 0;
      // Regex pattern should match all known number toString formats
      // istanbul ignore else
      if (match) {
        if (match[2]) {
          // Found decimal portion, add length
          decimals += match[2].length;
        }

        if (match[4]) {
          // Found negative exponent, add value
          decimals += Number(match[4]);
        }
      } else {
        console.warn('Number did not match expected pattern', num);
      }

      return decimals;
    }

    return 0;
  }

  toJSON(): string {
    return this.toString();
  }

  constructor(p: bigint, q: bigint = 1n) {
    if (q < 0n) {
      p = -p;
      q = -q;
    }

    if (q !== 1n) {
      const gcd = Rational.gcd(Rational.abs(p), q);
      if (gcd > 1n) {
        p = p / gcd;
        q = q / gcd;
      }
    }

    this.p = p;
    this.q = q;
  }
}
