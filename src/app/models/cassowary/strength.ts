/** Original source: https://github.com/IjzerenHein/kiwi.js/blob/master/src/strength.ts */

import { Rational } from '../rational';

export class Strength {
  /** The 'required' symbolic strength. */
  static required = Strength.create(
    Rational.thousand,
    Rational.thousand,
    Rational.thousand
  );

  /** The 'strong' symbolic strength. */
  static strong = Strength.create(Rational.one, Rational.zero, Rational.zero);

  /** The 'medium' symbolic strength. */
  static medium = Strength.create(Rational.zero, Rational.one, Rational.zero);

  /** The 'weak' symbolic strength. */
  static weak = Strength.create(Rational.zero, Rational.zero, Rational.one);

  /**
   * Create a new symbolic strength.
   *
   * @param a strong
   * @param b medium
   * @param c weak
   * @param w weight
   */
  static create(
    a: Rational,
    b: Rational,
    c: Rational,
    w: Rational = Rational.one
  ) {
    let result = Rational.zero;
    result = result.add(
      Rational.max(
        Rational.zero,
        Rational.min(Rational.thousand, a.mul(w))
      ).mul(new Rational(BigInt(1000000)))
    );
    result = result.add(
      Rational.max(
        Rational.zero,
        Rational.min(Rational.thousand, b.mul(w))
      ).mul(Rational.thousand)
    );
    result = result.add(
      Rational.max(Rational.zero, Rational.min(Rational.thousand, c.mul(w)))
    );
    return result;
  }

  /** Clip a symbolic strength to the allowed min and max. */
  static clip(value: Rational) {
    return Rational.max(Rational.zero, Rational.min(Strength.required, value));
  }
}
