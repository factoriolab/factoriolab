import { Strength } from './strength';
import { Rational } from './rational';

describe('Strength', () => {
  describe('create', () => {
    it('should create a new strength from passed Rationals', () => {
      const result = Strength.create(
        Rational.one,
        Rational.one,
        Rational.one,
        Rational.one
      );
      expect(result).toEqual(new Rational(BigInt(1001001)));
    });
  });

  describe('clip', () => {
    it('should clip to at least zero', () => {
      expect(Strength.clip(Rational.minusOne)).toEqual(Rational.zero);
    });

    it('should clip to at max Strength.required', () => {
      expect(Strength.clip(Strength.required.add(Rational.one))).toEqual(
        Strength.required
      );
    });
  });
});
