import { EnergyType, FuelType } from '../enum';
import { Rational } from '../rational';
import { RationalBeacon } from './beacon';

describe('RationalBeacon', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RationalBeacon({
        effectivity: 0.5,
        modules: 2,
        range: 3,
        type: EnergyType.Burner,
        category: FuelType.Chemical,
        usage: 1,
      });
      expect(result.effectivity).toEqual(new Rational(BigInt(1), BigInt(2)));
      expect(result.modules).toEqual(2);
      expect(result.range).toEqual(3);
      expect(result.type).toEqual(EnergyType.Burner);
      expect(result.category).toEqual(FuelType.Chemical);
      expect(result.usage).toEqual(Rational.one);
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
      expect(result.type).toBeUndefined();
      expect(result.category).toBeUndefined();
      expect(result.usage).toBeUndefined();
    });
  });
});
