import { Rational } from '../rational';
import { RationalFactory } from './factory';

describe('RationalFactory', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RationalFactory({
        speed: 1,
        modules: 2,
        burner: 3,
        electric: 4,
        drain: 5,
      });
      expect(result.speed).toEqual(Rational.one);
      expect(result.modules).toEqual(2);
      expect(result.burner).toEqual(new Rational(BigInt(3)));
      expect(result.electric).toEqual(new Rational(BigInt(4)));
      expect(result.drain).toEqual(new Rational(BigInt(5)));
    });

    it('should ignore undefined expensive fields', () => {
      const result = new RationalFactory({
        speed: 1,
        modules: 2,
      });
      expect(result.speed).toEqual(Rational.one);
      expect(result.modules).toEqual(2);
      expect(result.burner).toBeUndefined();
      expect(result.electric).toBeUndefined();
      expect(result.drain).toBeUndefined();
    });
  });
});
