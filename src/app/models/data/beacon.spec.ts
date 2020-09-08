import { Rational } from '../rational';
import { RationalBeacon } from './beacon';

describe('RationalBeacon', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RationalBeacon({
        effectivity: 0.5,
        modules: 2,
        range: 3,
        burner: 2.5,
        electric: 7.5,
      });
      expect(result.effectivity).toEqual(new Rational(BigInt(1), BigInt(2)));
      expect(result.modules).toEqual(2);
      expect(result.range).toEqual(3);
      expect(result.burner).toEqual(2.5);
      expect(result.electric).toEqual(7.5);
    });

    it('should ignore undefined fields', () => {
      const result = new RationalBeacon({
        effectivity: 0.5,
        modules: 2,
        range: 3,
      });
      expect(result.effectivity).toEqual(new Rational(BigInt(1), BigInt(2)));
      expect(result.modules).toEqual(2);
      expect(result.range).toEqual(3);
      expect(result.burner).toBeUndefined();
      expect(result.electric).toBeUndefined();
    });
  });
});
