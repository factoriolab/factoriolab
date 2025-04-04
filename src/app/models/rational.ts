import * as formula from '@sideway/formula';

const MAX_DENOM = 10000000;
const DIVIDE_BY_ZERO = 'Cannot divide by zero';
const FLOAT_TOLERANCE = 1e-10;
const DECIMALS_REGEX = new RegExp(/\d+(\.(\d+))?(e-(\d+))?/);

export function gcd(x: bigint, y: bigint): bigint {
  x = abs(x);
  y = abs(y);

  /** Ensure x >= y */
  if (y > x) {
    const t = y;
    y = x;
    x = t;
  }

  let t: bigint;
  while (y) {
    t = y;
    y = x % y;
    x = t;
  }

  return x;
}

export function abs(x: bigint): bigint {
  return x < 0n ? x * -1n : x;
}

export class Rational {
  readonly p: bigint;
  readonly q: bigint;

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
    return new Rational(this.p * -1n, this.q);
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
    if (this.isZero() || x.isZero()) return zero;
    return new Rational(this.p * x.p, this.q * x.q);
  }

  div(x: Rational): Rational {
    if (x.isOne() || this.isZero()) return this;
    if (this.eq(x)) return one;
    return new Rational(this.p * x.q, this.q * x.p);
  }

  ceil(): Rational {
    if (this.isInteger()) return this;

    // Calculate ceiling using absolute value
    const num = new Rational(abs(this.p) / this.q + 1n);
    // Inverse back to negative if necessary
    if (this.p < 0n) return num.inverse();
    return num;
  }

  floor(): Rational {
    if (this.isInteger()) return this;
    return new Rational(this.p / this.q);
  }

  trunc(decimals: number | bigint): Rational {
    if (typeof decimals === 'number') decimals = BigInt(decimals);
    const q = 10n ** decimals;
    const p = (this.p * q) / this.q;
    return new Rational(p, q);
  }

  round(): Rational {
    if (this.isInteger()) return this;

    const x = this.p % this.q;
    const y = Number(x) / Number(this.q);
    if (y >= 0.5) return this.ceil();
    return this.floor();
  }

  abs(): Rational {
    return new Rational(abs(this.p), this.q);
  }

  pow(exponent: number): Rational {
    const num = this.toNumber();
    const result = Math.pow(num, exponent);
    return rational(result);
  }

  simplify(): Rational {
    return rational(this.toNumber());
  }

  toNumber(): number {
    return Number(this.p) / Number(this.q);
  }

  toPrecision(x: number): number {
    const round = fromNumber(Math.pow(10, x));
    return this.mul(round).ceil().div(round).toNumber();
  }

  toFraction(mixed = true): string {
    if (this.isInteger()) return this.p.toString();

    if (mixed && abs(this.p) > abs(this.q)) {
      const whole = this.p / this.q;
      const mod = this.p % this.q;
      return `${whole.toString()} + ${mod.toString()}/${this.q.toString()}`;
    }

    return `${this.p.toString()}/${this.q.toString()}`;
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
      const match = DECIMALS_REGEX.exec(num.toString());
      let decimals = 0;

      // istanbul ignore else: Regex pattern should match all known number toString formats
      if (match) {
        // If decimal portion found, add length
        if (match[2]) decimals += match[2].length;

        // If negative exponent found, add value
        if (match[4]) decimals += Number(match[4]);
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

  constructor(p: bigint, q = 1n) {
    if (q === 1n) {
      this.p = p;
      this.q = q;
      return;
    }

    if (q === 0n) throw new Error(DIVIDE_BY_ZERO);

    if (q < 0n) {
      p = -p;
      q = -q;
    }

    const d = gcd(p, q);
    if (d > 1n) {
      p = p / d;
      q = q / d;
    }

    this.p = p;
    this.q = q;
  }
}

const zero = new Rational(0n);
const one = new Rational(1n);

export function fromNumber(x: number): Rational {
  if (Number.isInteger(x)) return new Rational(BigInt(x));
  if (Math.abs(x) < FLOAT_TOLERANCE) return zero;
  return fromFloat(x);
}

const fromFloatCache = new Map<number, Rational>();
/**
 * Source: https://www.ics.uci.edu/%7Eeppstein/numth/frap.c
 */
export function fromFloat(startx: number): Rational {
  const cached = fromFloatCache.get(startx);
  if (cached != null) return cached;

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

  const optA = rational(m[0][0], m[1][0]);
  const errA = Math.abs(startx - optA.toNumber());

  ai = Math.floor((MAX_DENOM - m[1][1]) / m[1][0]);
  m[0][0] = m[0][0] * ai + m[0][1];
  m[1][0] = m[1][0] * ai + m[1][1];

  const optB = rational(m[0][0], m[1][0]);
  const errB = Math.abs(startx - optB.toNumber());

  const result = errA < errB ? optA : optB;
  fromFloatCache.set(startx, result);
  return result;
}

const fromStringCache = new Map<string, Rational>();
export function fromString(x: string): Rational {
  const cached = fromStringCache.get(x);
  if (cached) return cached;

  if (x.length === 0) throw new Error('Empty string');

  let result: Rational;

  if (x.startsWith('=')) {
    // Full math support for equations
    const value = new formula.Parser(x.substring(1)).evaluate();
    result = rational(value);
  } else if (!x.includes('/')) {
    result = fromNumber(Number(x));
  } else {
    const f = x.split('/');
    if (f.length > 2) throw new Error('Too many /');

    if (!f[0].includes(' ')) {
      const p = Number(f[0]);
      const q = Number(f[1]);
      result = rational(p, q);
    } else {
      const g = f[0].split(' ');
      if (g.length > 2) throw new Error('Too many spaces');

      const n = Number(g[0]);
      const p = Number(g[1]);
      const q = Number(f[1]);
      result = fromNumber(n).add(rational(p, q));
    }
  }

  fromStringCache.set(x, result);
  return result;
}

export function rationalFn(x: number | bigint | string): Rational;
export function rationalFn(
  x: number | bigint | string | undefined,
): Rational | undefined;
export function rationalFn(p: number, q: number): Rational;
export function rationalFn(p: bigint, q: bigint): Rational;
export function rationalFn(
  p: number | bigint | string | undefined,
  q?: number | bigint,
): Rational | undefined {
  if (p == null) return;

  if (q != null) {
    p = BigInt(p);
    q = BigInt(q);
    // Parse Rational from array (num/denom pair)
    return new Rational(p, q);
  }

  switch (typeof p) {
    case 'bigint':
      return new Rational(p);
    case 'number':
      return fromNumber(p);
    case 'string':
      return fromString(p);
  }
}

export const rational = Object.assign(rationalFn, {
  zero,
  one,
});
