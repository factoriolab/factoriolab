import { EnergyType, FuelType } from '../enum';
import { Rational } from '../rational';
import { RationalFactory } from './factory';

describe('RationalFactory', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RationalFactory({
        speed: 1,
        modules: 2,
        type: EnergyType.Burner,
        category: FuelType.Chemical,
        usage: 3,
        drain: 5,
        pollution: 4,
        mining: true,
        research: true,
        overclockFactor: 1,
      });
      expect(result.speed).toEqual(Rational.one);
      expect(result.modules).toEqual(2);
      expect(result.type).toEqual(EnergyType.Burner);
      expect(result.category).toEqual(FuelType.Chemical);
      expect(result.usage).toEqual(Rational.from(3));
      expect(result.drain).toEqual(Rational.from(5));
      expect(result.pollution).toEqual(Rational.from(4));
      expect(result.mining).toBeTrue();
      expect(result.research).toBeTrue();
      expect(result.overclockFactor).toEqual(1);
    });

    it('should handle string for drain', () => {
      const result = new RationalFactory({
        speed: 1,
        modules: 2,
        type: EnergyType.Electric,
        drain: '60/30',
      });
      expect(result.drain).toEqual(Rational.two);
    });

    it('should ignore undefined fields', () => {
      const result = new RationalFactory({
        speed: 1,
        modules: 2,
      });
      expect(result.speed).toEqual(Rational.one);
      expect(result.modules).toEqual(2);
      expect(result.type).toBeUndefined();
      expect(result.category).toBeUndefined();
      expect(result.usage).toBeUndefined();
      expect(result.drain).toBeUndefined();
      expect(result.pollution).toBeUndefined();
      expect(result.mining).toBeUndefined();
      expect(result.research).toBeUndefined();
      expect(result.overclockFactor).toBeUndefined();
    });
  });
});
